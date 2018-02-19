import { Injectable } from '@angular/core';
import { SocketService } from 'app/services/socket.service';
import * as fs from 'fs';
import * as path from 'path';

declare var $: any;
var ss = require('socket.io-stream');

@Injectable()
export class FileService {

  manifest: any = {};

  allFiles = [];
  hashList = [];

  workingDirectoryFiles = [];

  dir = './data/';

  fileQueue = [];
  isSendingFile = false;

  interfaceFiles = [];

  receivedFileTimeout = null;

  uploadStatus: any = {};

  downloadQueue = [];
  downloadStatus: any = {};

  constructor(private SocketService: SocketService) {
    this.SocketService.socketConnected$.asObservable().subscribe(connected => {
      if(connected) {
        this.SocketService.on('send.server.received').subscribe(res => {
          this.fileQueue = this.fileQueue.slice(this.fileQueue.indexOf(res.file), 1);
        });

        this.SocketService.on('requestfiles').subscribe(data => {
          for (let i = 0; i < data.length; i++) {
            const file = data[i];
            if(this.fileQueue.indexOf(file) === -1) {
              this.uploadStatus[file] = 0;
              this.fileQueue.push(file);
              this.SendFile(file);
            }
          }
        });

        this.SocketService.on('updateuploadstatus').subscribe(data => {
          this.uploadStatus[data.name] = data.progress;
        });

        this.SocketService.on('downloadstats').subscribe(data => {
          console.log('downloadstats', data);
          this.downloadStatus[data.name].size = data.size;
        });

        ss(this.SocketService.socket).on('client.receive', (stream, data) => {
          console.log("Stream Started");
          if (!fs.existsSync(this.dir)) {
            fs.mkdir(this.dir);
          }

          var filename = path.basename(data.name);
          stream.pipe(fs.createWriteStream(this.dir + filename));
          console.log("Pipe Created", filename);

          // stream.on('end', () => {
          //   console.log('Finished: ', filename);
          // })

          // var size = 0;
          // let progress = '';
          // stream.on('data', (chunk) => {
          //   size += chunk.length;
          //   let newProgress = (Math.floor(size / data.size * 100) + '%');
          //   if (newProgress !== progress) {
          //     progress = newProgress;
          //     console.log(filename, progress);
          //   }
          // });
        });
      }
    });
  }

  RequestManifestFiles() {
    console.log('Requesting Files');

    this.interfaceFiles = [];
    let data = this.manifest.manifest[localStorage.getItem('SelectedInterface')].files;
    this.SocketService.emit('requestfiles', data);
  }

  GetProjectFolderFiles() {
    let files = [];

    if (!fs.existsSync(localStorage.getItem('WorkingDirectory'))){
      return [];
    }

    files = fs.readdirSync(localStorage.getItem('WorkingDirectory'));
    return files;
  }

  SetManifest(manifest) {
    this.manifest = manifest;
    this.allFiles = [];
    for (let key in manifest.manifest) {
      if (manifest.hasOwnProperty(key)) {
        for (let i = 0; i < manifest[key].files.length; i++) {
          const file = manifest[key].files[i];
          this.allFiles.push(file);
        }
      }
    }

    // TODO: Generate a hash of every file in the manifest
   }

  AddFileToQueue(name) {
    this.fileQueue.push(name);
    console.log('File added to queue:', name);
    this.SendFile(name);
  }

  SendFile(name) {
    console.log('Handling Next File:', name);
    ss.forceBase64 = true;
    let stream = ss.createStream();
    let filename = localStorage.getItem('WorkingDirectory') + name;
    let file = fs.statSync(filename);

    ss(this.SocketService.socket).emit('server.receive', stream, { name: filename, size: file.size });
    fs.createReadStream(filename).pipe(stream);
  }

  IsUploading() {
    return !(this.fileQueue.length == 0);
  }

  HasAllFiles(requestMissing = true) {
    let allFiles = []; // All files we have in possesion on this cliet.
    let allRequiredFiles = this.manifest.manifest[localStorage.getItem('SelectedInterface')].files;
    let filesToDownload = [];

    if(fs.existsSync(this.dir)) {
      fs.readdirSync(this.dir).forEach(file => {
        allFiles.push(file);
      })
    }

    for (let i = 0; i < allRequiredFiles.length; i++) {
      if (allFiles.indexOf(allRequiredFiles[i]) == -1) {
        filesToDownload.push(allRequiredFiles[i]);
      }
    }

    if (filesToDownload.length > 0 && requestMissing) {
      for (let i = 0; i < filesToDownload.length; i++) {
        const file = filesToDownload[i];
        this.RequestFile(file);
      }
    }

    return (allFiles.length == allRequiredFiles.length)
  }

  RequestFile(file) {
    this.downloadQueue.push(file);
    this.downloadStatus[file] = {size: 0, progress: ''}

    ss.forceBase64 = true;
    var stream = ss.createStream();
    ss(this.SocketService.socket).emit('requestfile', stream, {name: file});
    let parts = [];
    var size = 0;
    stream.on('data', (chunk) => {
      parts.push(chunk);
      
      size += chunk.length;
      let newProgress = Math.floor(size / this.downloadStatus[file].size * 100) + '%';
      if (newProgress != this.downloadStatus[file].progress) {
        this.downloadStatus[file].progress = newProgress;
      }
    });
    stream.on('end', () => {
      console.log("Downloaded & Saved", file, this.downloadQueue, this.downloadQueue.indexOf(file));
      this.downloadQueue.splice(this.downloadQueue.indexOf(file), 1);
      if (!fs.existsSync(this.dir)) {
        fs.mkdirSync(this.dir);
      }

      if (fs.existsSync(this.dir + file)) {
        fs.unlinkSync(this.dir + file);
      }

      parts.forEach(chunk => {
        fs.appendFileSync(this.dir + file, new Buffer(chunk));
      });

      parts = [];
    });
  }

  IsDownloading() {
    return (this.downloadQueue.length > 0);
  }

}
