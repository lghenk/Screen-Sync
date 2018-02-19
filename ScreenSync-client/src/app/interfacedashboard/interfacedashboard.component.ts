import { Component, OnInit } from '@angular/core';
import { SocketService } from 'app/services/socket.service';
import { FileService } from 'app/services/file.service';
import { Router } from '@angular/router/src/router';

declare var $: any;

@Component({
  selector: 'app-interfacedashboard',
  templateUrl: './interfacedashboard.component.html',
  styleUrls: ['./interfacedashboard.component.css']
})
export class InterfacedashboardComponent implements OnInit {

  constructor(private SocketService: SocketService, public FileService: FileService, public router: Router) { }

  ngOnInit() {
    $(window).resize(function () {
      $('#videoPlayer').height($(window).height());
      $('#videoPlayer').width($(window).width());
    });

    $(window).trigger('resize');
  }

}
