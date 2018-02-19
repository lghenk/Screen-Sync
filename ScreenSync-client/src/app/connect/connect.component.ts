import { Component, OnInit } from '@angular/core';
import { SocketService } from 'app/services/socket.service';
import { Router } from '@angular/router/src/router';

@Component({
  selector: 'app-connect',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.css']
})
export class ConnectComponent implements OnInit {

  Address = '';
  constructor(private SocketService: SocketService, private Router: Router) { }

  ngOnInit() {
    console.log(this.SocketService.socketConnected$.value);

    this.SocketService.socketConnected$.asObservable().subscribe(connected => {
      if (connected) {
        console.log('We can move on to selection of controller or interface');
        this.Router.navigate(['/selecttype']);
      }
    });
  }

  Connect() {
    if (this.SocketService.socket != null) {
      this.SocketService.socket.disconnect(true);
    }

    this.SocketService.connect(this.Address);
  }

  SendFile(event) {
    // let reader = new FileReader();
    // var file = event.srcElement.files[0];

    // this.SocketService.delivery.send(file, { foo: 'bar' });
  }
}
