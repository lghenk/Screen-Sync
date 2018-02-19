import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import * as fs from 'fs';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import { Router } from '@angular/router/src/router';
import { isUndefined } from 'util';
import { NgZone } from '@angular/core/src/zone/ng_zone';

declare var ss: any;

@Injectable()
export class SocketService {

  socket: any;

  totalClients = 0;
  totalRooms = 0;

  socketConnected$ = new BehaviorSubject<boolean>(false);

  address = '';

  firstConnection = true;

  constructor(private Router:Router, private ngZone: NgZone) {}

  connect(address: string) {
    this.address = address;
    this.socket = io(address, {});
    this.socket.on('connect', () => this.socketConnected$.next(true));
    this.socket.on('disconnect', () => this.socketConnected$.next(false));
    this.socket.on('kick', () => {
      this.socket.disconnect();
      this.Router.navigate(['/']);
    });

    this.on('statsUpdate').subscribe(res => {
        this.totalRooms = res.roomsCount;
        this.totalClients = res.clientsCount;
    });

    if (this.firstConnection) {
      this.firstConnection = false;

      this.socketConnected$.asObservable().subscribe(connected => {
        console.log('Socket connected: ', connected);
      });

    }
  }

  isFirstConnection() {
    return this.firstConnection;
  }

  emit(event: string, data = null) {
    this.socket.emit(event, data);
  }

  on(event: string): Observable<any> {

    return new Observable(observer => {

      this.socket.on(event, data => {
        observer.next(data);
      });

      // observable is disposed
      return () => {
        this.socket.off(event);
      }

    });
  }
}
