import { Component, OnInit } from '@angular/core';
import { SocketService } from 'app/services/socket.service';
import { FileService } from 'app/services/file.service';
import { Router } from '@angular/router/src/router';
import { clearInterval } from 'timers';

declare var timelineitem: any;
declare var Timeline: any;
declare var TimelineMananger: any;
declare var $: any;

@Component({
  selector: 'app-controldashboard',
  templateUrl: './controldashboard.component.html',
  styleUrls: ['./controldashboard.component.css']
})
export class ControldashboardComponent implements OnInit {

  manifest = {};
  timeline = null;

  files: any = {};
  fileQueue = [];

  drawInterval = null;

  constructor(private SocketService: SocketService, public FileService: FileService, public router: Router) { }

  ngOnInit() {
    this.timeline = new TimelineMananger($('#Timeline'));
    this.manifest = this.FileService.manifest;
    console.log(this.manifest);
    let processedManifest = this.generateArray(this.manifest);
    processedManifest.forEach(element => {
      this.timeline.AddTimeline(element.key);
    });

    this.fileQueue = this.FileService.GetProjectFolderFiles();
    this.files = {
      'audio': {},
      'video': {}
    };
    this.loadFileMetaData();

    /// - Start Timeline Loop -
    this.drawInterval = setInterval(this.timeline.Draw, 10, this.timeline);
  }

  loadFileMetaData() {
    if(this.fileQueue.length == 0) return;

    let element = this.fileQueue[0];
    this.fileQueue.shift();
    if (element.includes('.mp4')) {
      this.files['video'][element] = {
        duration: -1,
        file: element
      }
      this.LoadVideoData(element);
    } else if (element.includes('.mp3')) {
      this.files['audio'][element] = {
        duration: -1,
        file: element
      }
      this.LoadAudioData(element);
    } else {
      // The file was useless
      this.loadFileMetaData();
    }
  }

  LoadVideoData(video) {
    let vidDOM = $('video');
    $(vidDOM).attr('src', localStorage.getItem('WorkingDirectory') + video);
    $(vidDOM).attr('id', video);
    $(vidDOM).css('display', 'none');
    $('body').append($(vidDOM));

    $(document.getElementById(video)).on('loadedmetadata', (dom) => {
      this.files['video'][dom.currentTarget.id].duration = -1;
      this.loadFileMetaData();
    });
  }

  trackByIndex(i: number, obj: any) {
    return obj.value;
  }

  LoadAudioData(audio) {
    let audDOM = $('audio');
    $(audDOM).attr('src', localStorage.getItem('WorkingDirectory') + audio);
    $(audDOM).css('display', 'none');
    $(audDOM).attr('id', audio);
    $('body').append($(audDOM));

    $(document.getElementById(audio)).on('loadedmetadata', (dom) => {
      this.files['audio'][dom.currentTarget.id].duration = -1;
      this.loadFileMetaData();
    });
  }

  generateArray(obj) {
    return Object.keys(obj).map((key) => { return { key: key, value: obj[key] } });
  }

  AddToTimeline(iface, file) {
    console.log(iface, file);
  }

}
