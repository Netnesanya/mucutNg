import { Injectable } from '@angular/core';
import {WebSocketService} from "../connection/websocket.service";
import {ERROR, READY} from "../header/header.component";
import {Observable, of} from "rxjs";

export type SongDataFetched = {
  duration: number
  duration_string: string
  heatmap: Array<{end_time: number, start_time: number, value: number}>
  original_url: string
  title: string
}

export type SongDataUserInput =   {
  from?: number | string;
  to?: number | string;
  duration?: number
}

export type CombinedSongData = {
    fetched: SongDataFetched
    userInput: SongDataUserInput
}

@Injectable({
  providedIn: 'root'
})
export class SongDataService {

  public songsData: CombinedSongData[] = [];

  public defaultDuration!: number

  public downloadedMessages: string[] = []

  constructor(private ws: WebSocketService) { }

  public handleTxtContent(txt: File): Observable<string> {
      const reader = new FileReader();

      reader.onload = () => {
        const content = reader.result;
        if (typeof content === 'string') {
          console.log("Sending message:", content);
          this.ws.sendMessage(content);
          // this.submitButtonStatus = LOADING;

          // Listen for messages from the server
          this.ws.getMessages().subscribe({
            next: (message) => {
              console.log(message);
              if (message.includes('Successfully downloaded audio segment')) {
                this.downloadedMessages.push(message.replace('Successfully downloaded audio segment', "downloaded"));
                return
              }

              const fetchedDataArray: SongDataFetched[] = JSON.parse(message);

              const newSongsData: CombinedSongData[] = fetchedDataArray
                .filter(fetched =>
                  // Check if fetched song does not exist in the current songsData array
                  !this.songsData.some(
                    existingSong => existingSong.fetched.original_url === fetched.original_url
                  )
                )
                .map(fetched => ({
                  fetched: fetched,
                  userInput: {} // Initialize with an empty object or copy existing userInput if needed
                }));

              // Add the newSongsData to the existing songsData array
              this.songsData = [...this.songsData, ...newSongsData];
              console.log(this.songsData);
              // this.submitButtonStatus = READY;
            },
            error: (error) => {
              console.error('WebSocket error:', error);
              return of(ERROR);
            }
          });
        }
      };

    reader.readAsText(txt);

    return of(READY)
    }
}
