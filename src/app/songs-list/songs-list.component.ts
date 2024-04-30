import {Component, OnInit} from '@angular/core';
import {NgClass, NgForOf} from "@angular/common";
import {SongComponent} from "./song/song.component";
import {CombinedSongData, SongDataFetched, SongDataService} from "../services/song-data.service";
import {DISABLED, LOADING, READY} from "../header/header.component";
import {HttpService} from "../http.service";
import {FormsModule} from "@angular/forms";

@Component({
    selector: 'app-songs-list',
    standalone: true,
    imports: [
        NgForOf,
        SongComponent,
        NgClass,
        FormsModule
    ],
    templateUrl: './songs-list.component.html',
    styleUrl: './songs-list.component.css'
})
export class SongsListComponent implements OnInit {
    public updateButtonStatus: string = DISABLED;
    public siqName: string = '';
    // public authorName: string = '';

    constructor(public songDataService: SongDataService, public http: HttpService) {}

    ngOnInit() {}

    public removeSong(index: number): void {
        // Adjust to use index for removal
        this.songDataService.songsData.splice(index, 1);
    }

    public createEmptySongField(event: any): void {
        event.preventDefault()
        this.updateButtonStatus = READY;
        const newSong: CombinedSongData = {
            fetched: {
                title: '',
                original_url: '',
                duration: 0,
                duration_string: '',
                heatmap: []
            },
            userInput: {}
        };
        this.songDataService.songsData.push(newSong);
    }

    public handleUpdateButton(event: any): void {
        event.preventDefault()
        if (this.updateButtonStatus === READY) {
            this.updateButtonStatus = LOADING;

            // Map over songsData to extract the fetched part for the update operation
            const metadataToUpdate = this.songDataService.songsData.map(data => data.fetched);

            this.http.updateMp3MetadataBulk(metadataToUpdate)
                .subscribe({
                    next: (data) => {
                        this.songDataService.songsData = this.songDataService.songsData.map((song, index) => ({
                            // @ts-ignore
                            fetched: data[index],
                            userInput: song.userInput
                        }));
                        this.updateButtonStatus = READY;
                    },
                    error: (error) => {
                        console.error(error);
                        this.updateButtonStatus = READY;
                    }
                });
        }
    }

    public handleCreateSiq(event: any): void {
        event.preventDefault();
        this.http.requestSiqCreation(this.siqName)
            .subscribe({
                next: (data) => {
                    console.log(data);
                },
                error: (error) => {
                    console.error(error);
                }
            });

    }
    public removeAll(): void {
        this.songDataService.songsData = [];
    }

    protected readonly READY = READY;
    protected readonly LOADING = LOADING;
}
