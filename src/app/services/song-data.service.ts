import { Injectable } from '@angular/core';

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

  constructor() { }
}
