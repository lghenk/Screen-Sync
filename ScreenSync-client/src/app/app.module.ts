import { NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { AppRoutingModule } from 'app/app-routing.module';
import { SocketService } from 'app/services/socket.service';
import { ConnectComponent } from 'app/connect/connect.component';
import { ConnectionstatusComponent } from './connectionstatus/connectionstatus.component';
import { SelecttypeComponent } from './selecttype/selecttype.component';
import { FileService } from 'app/services/file.service';
import { ControldashboardComponent } from './controldashboard/controldashboard.component';
import { InterfacedashboardComponent } from './interfacedashboard/interfacedashboard.component';



@NgModule({
  declarations: [
    AppComponent,
    ConnectComponent,
    ConnectionstatusComponent,
    SelecttypeComponent,
    ControldashboardComponent,
    InterfacedashboardComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [SocketService, FileService],
  bootstrap: [AppComponent]
})
export class AppModule { }
