import {Injectable} from '@angular/core';
import {Subject, timer} from 'rxjs';
import {TOKEN} from "../app.component";
import {SongDataService} from "../services/song-data.service";

export type WebSocketMessage = {
  action: string;
  data: any;
}

export const TXT_PARSE = 'parseTxt'

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  public socket!: WebSocket;
  private messageSubject: Subject<string> = new Subject();

  constructor(private songDataService: SongDataService) {
  }

  public connect(url: string): void {
    if (localStorage.getItem(TOKEN)) {
      this.socket = new WebSocket(url + `?token=${localStorage.getItem(TOKEN)}`);
    } else {
      localStorage.setItem(TOKEN, Math.random().toString(36).substr(2, 9))
      this.socket = new WebSocket(url + `?token=${localStorage.getItem(TOKEN)}`);
    }

    this.socket.onopen = (event) => {
      console.log('WebSocket Open');
      this.dispatchWsMessages()
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

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
    }
  }

  private dispatchWsMessages(): void {
    this.messageSubject.subscribe({
      next: (message: string) => {
        const wsMessage: WebSocketMessage = JSON.parse(message);

        switch (wsMessage.action) {
          case TXT_PARSE:
            // const data: SongDataFetched = JSON.parse(wsMessage.data)
            // this.songDataService.songsData.push(data)
            this.songDataService.handleFetchedMetaData(message)
            break;
          case 'txtParseFinished':
            console.log('txtParseFinished:', wsMessage.data);
            break;
          default:
            console.error('Unknown message type:', wsMessage.action);
        }

      }, error: (err) => {
        console.error('Error dispatching message:', err)
      }
    })
  }

  private retryConnection(url: string) {
    timer(2000)
      .subscribe(() => {
        console.log('Retrying WebSocket connection...');
        this.connect(url);
      });
  }
}
