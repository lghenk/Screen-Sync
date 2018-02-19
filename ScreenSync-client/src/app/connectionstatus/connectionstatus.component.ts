import { Component, OnInit } from '@angular/core';
import { SocketService } from 'app/services/socket.service';

declare var $: any;

@Component({
  selector: 'app-connectionstatus',
  templateUrl: './connectionstatus.component.html',
  styleUrls: ['./connectionstatus.component.css']
})
export class ConnectionstatusComponent implements OnInit {

  status = 'Offline';

  constructor(private SocketService: SocketService) { }

  ngOnInit() {
    this.SocketService.socketConnected$.asObservable().subscribe(connected => {
      if(connected) {
        $('.status').addClass('online').removeClass('offline');
        this.status = 'Connected';
      } else {
        $('.status').addClass('offline').removeClass('online');
        this.status = 'Offline';
      }
    })
  }

}
