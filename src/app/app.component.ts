import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {SongsListComponent} from "./songs-list/songs-list.component";
import {HeaderComponent} from "./header/header.component";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {HttpService} from "./connection/http.service";
import {WebSocketService} from "./connection/websocket.service";
import {AuthInterceptor} from "./connection/auth.interceptor";


export const TOKEN = 'token'

@Component({
  selector: 'app-root',
  standalone: true,
    imports: [CommonModule, RouterOutlet, SongsListComponent, HeaderComponent, HttpClientModule],
    providers: [HttpService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  constructor(
    private ws: WebSocketService
  ) {
  }

  ngOnInit() {
    this.ws.connect('ws://localhost:8080/ws/connect');
  }



}
