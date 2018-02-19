import { Component, OnInit } from '@angular/core';
import { SocketService } from 'app/services/socket.service';
import * as fs from 'fs';
import { FileService } from 'app/services/file.service';
import { Router } from '@angular/router/src/router';

declare var $:any;

@Component({
  selector: 'app-selecttype',
  templateUrl: './selecttype.component.html',
  styleUrls: ['./selecttype.component.css']
})
export class SelecttypeComponent implements OnInit {

  selectedOption: string;

  isController = false;
  isInterface = false;

  interfaceListener = null;
  interfaceData: any = {};
  interfaceConnections: any = {};

  createDirectory = '';

  showInterfaces = false;
  createInterfaces = false;

  errorCreate = false;
  errorMessage = '';

  selectedInterface = null;

  isDownloading = false;

  constructor(private SocketService: SocketService, public FileService: FileService, public router: Router) { }

  ngOnInit() { }

  SetupController() {
    this.isController = true;
    this.SocketService.emit('selectrole', {type: 'controller'});
    // Continue to select/create project & send file manifest to server to be distributed to all connected interfaces so they can signup/
    // Sending a new manifest will result in loss of current interface configuration
  }

  RequestInterfaces() {
    this.isInterface = true;
    if(this.interfaceListener == null) {
      this.interfaceListener = this.SocketService.on('returnmanifest').subscribe(data => {
        console.log(data);
        this.interfaceData = data;
      });
    }

    this.SocketService.emit('getmanifest');
  }

  InitCreateProject() {
    $('#selectDirectory').click();
  }

  SelectedCreateProjectDirectory(event) {
    this.createDirectory = event.srcElement.files[0].path;
    this.createInterfaces = true;
  }

  CreateProject() {
    let data = JSON.stringify(this.interfaceData);
    localStorage.setItem('WorkingDirectory', this.createDirectory);
    // Continue to dashboard and update manifest on server
    this.SocketService.emit('updatemanifest', this.interfaceData);

    let loadData = {
      path: this.createDirectory + '/manifest.json',
      name: 'manifest.json'
    }
    this.LoadManifest(loadData);

    fs.writeFile(this.createDirectory + '/manifest.json', data, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log('Successfully created manifest');
      }
    });
  }

  CreateInterface() {
    $('#createInterfaceName').removeClass('is-invalid');
    this.errorCreate = false;
    let name = $('#createInterfaceName').val();
    if (name.length == 0 || name.split(' ').join('').length == 0) {
      // No name was entered
      this.errorCreate = true;
      this.errorMessage = 'You must provide a valid name for your interface name!';
      $('#createInterfaceName').addClass('is-invalid');
    } else {
      // Name was entered.. Check if interface name is unique
      let isUnique = true;
      for (let key in this.interfaceData) {
        if (this.interfaceData.hasOwnProperty(key)) {
          if (key === name) {
            isUnique = false;
          }

          console.log(key + ' -> ' + this.interfaceData[key]);
        }
      }

      if(isUnique) {
        // Continue adding interface
        this.interfaceData[name] = {
          'sockets': [],
          'files': []
        };

        console.log(this.interfaceData);
      } else {
        // Interface already exists
        this.errorCreate = true;
        this.errorMessage = 'An interface with that name already exists!';
        $('#createInterfaceName').addClass('is-invalid');
      }
    }
  }

  DeleteInterface(name) {
    delete this.interfaceData[name];
  }

  InitLoadProject() {
    $('#selectManifest').click();
  }

  SelectedCreateProjectManifest(event) {
    let manifestPath = event.srcElement.files[0];
    this.LoadManifest(manifestPath);
  }

  LoadManifest(manifestPath) {
    this.showInterfaces = true;

    localStorage.setItem('WorkingDirectory', manifestPath.path.replace(manifestPath.name, ''));

    let manifest = fs.readFileSync(manifestPath.path).toString();
    manifest = JSON.parse(manifest);
    this.interfaceData = manifest;
    this.FileService.SetManifest(manifest);

    this.SocketService.emit('updatemanifest', this.interfaceData);

    this.SocketService.on('updateinterfaceconnections').subscribe(data => {
      console.log(data);
      this.interfaceConnections = data;
    })

    let files = [];
  }

  toArrayBuffer(buf) {
    var ab = new ArrayBuffer(buf.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
      view[i] = buf[i];
    }
    return ab;
  }


  generateArray(obj) {
    return Object.keys(obj).map((key) => { return { key: key, value: obj[key] } });
  }

  InterfaceFiles() {
    this.isDownloading = true;
    this.SocketService.emit('selectrole', { type: 'interface', name: this.selectedInterface });
    this.FileService.SetManifest(this.interfaceData);
    
    if (this.FileService.HasAllFiles()) {
      this.isDownloading = false;
      this.router.navigate(['/interface/dashboard']);
    }
  }

  SelectInterface(item) {
    this.selectedInterface = item.key;
    localStorage.setItem('SelectedInterface', this.selectedInterface);
  }

  SelectedInterface(item) {
    return (this.selectedInterface == item.key);
  }

  IsUploading() {
    return this.FileService.IsUploading();
  }

}