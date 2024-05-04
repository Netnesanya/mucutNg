// src/app/websocket.service.ts
import { Injectable } from '@angular/core';
import {Observable, Subject, timer} from 'rxjs';
import {TOKEN} from "../app.component";

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  public socket!: WebSocket;
  private messageSubject: Subject<string> = new Subject();

  public connect(url: string): void {
    if (localStorage.getItem(TOKEN)) {
      this.socket = new WebSocket(url + `?token=${localStorage.getItem(TOKEN)}`);
    } else {
      localStorage.setItem(TOKEN, Math.random().toString(36).substr(2, 9))
      this.socket = new WebSocket(url + `?token=${localStorage.getItem(TOKEN)}`);
    }

    this.socket.onopen = (event) => {
        console.log('WebSocket Open');
    }

    this.socket.onmessage = (event) => {
      console.log(event);
      this.messageSubject.next(event.data);
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket Closed', event);
      this.retryConnection(url);
    };

    this.socket.onerror = (event) => {
      console.error('WebSocket error:', event);
    };
  }

  public sendMessage(message: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.error('WebSocket is not connected.');
    }
  }

  public getMessages(): Observable<string> {
    return this.messageSubject.asObservable();
  }

  private retryConnection(url: string) {
    timer(2000)
        .subscribe(() => {
          console.log('Retrying WebSocket connection...');
          this.connect(url);
        });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
    }
  }
}
