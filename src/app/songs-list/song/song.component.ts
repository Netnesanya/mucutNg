import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CombinedSongData, SongDataFetched, SongDataUserInput} from "../../services/song-data.service";
import {NgClass, NgIf} from "@angular/common";
import {HttpService} from "../../http.service";
import {DISABLED, LOADING, READY} from "../../header/header.component";
import {FormsModule} from "@angular/forms";

@Component({
    selector: 'app-song',
    standalone: true,
    imports: [
        NgIf,
        NgClass,
        FormsModule
    ],
    templateUrl: './song.component.html',
    styleUrl: './song.component.css'
})
export class SongComponent implements OnInit {
    @Output() removeSong = new EventEmitter<SongDataFetched>();

    @Input() songData!: CombinedSongData



    public userInput!: SongDataUserInput
    public temporaryUrl = ''

    constructor(private http: HttpService) {
    }

    ngOnInit() {
        this.userInput = {
            from: 0,
            to: 0,
            duration: 35,
        }
    }

    public updateTitle(event: any): void {
        this.songData.fetched['title'] = event.target.value
    }

    public insertOriginalUrl(event: any): void {
        this.temporaryUrl = event.target.value
    }

    public updateSong(event: any): void {
        event.preventDefault()

        this.http.updateMp3Metadata({...this.songData.fetched, original_url: this.temporaryUrl})
            .subscribe(data => {
            this.songData.fetched = data as SongDataFetched
        }), (error: Error) => {
            console.error('Error updating mp3 metadata:', error)
        }
    }

    public updateTimestampInput(event: any): void {
        this.songData.userInput = this.songData.userInput || {};

        const inputName = event.target.name;
        const inputValue = event.target.value;

        (this.songData.userInput as any)[inputName] = Number(inputValue) || inputValue;
    }


    public remove(event: any): void {
        event.preventDefault()
        this.removeSong.emit(this.songData.fetched)
    }

    protected readonly READY = READY;
    protected readonly LOADING = LOADING;
}
