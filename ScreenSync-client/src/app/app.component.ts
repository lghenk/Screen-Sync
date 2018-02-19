import { Component } from '@angular/core';
import { SocketService } from 'app/services/socket.service';
import { Router } from '@angular/router/src/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private SocketService: SocketService, public Router: Router) {
    if(!this.SocketService.socketConnected$.value && this.Router.url != '') {
      this.Router.navigate(['']);
    }
  }
}
