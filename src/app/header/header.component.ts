import {Component, OnInit} from '@angular/core';
import {HttpService} from "../http.service";
import {CombinedSongData, SongDataFetched, SongDataService} from "../services/song-data.service";
import {NgClass} from "@angular/common";
import {WebSocketService} from "../websocket.service";

export const READY = 'ready'
export const LOADING = 'loading'
export const DISABLED = 'disabled'
export const ERROR = 'error'

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        NgClass
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

    public selectedFile: File | null = null;

    public submitButtonStatus: string = DISABLED
    public downloadAllButtonStatus: string = DISABLED

    constructor(
        private http: HttpService,
        public songDataService: SongDataService,
        private ws: WebSocketService
    ) {
        this.ws.connect('ws://localhost:8080/ws/video-info'); // Ensure the URL matches your server setup
    }

    ngOnInit() {
    }

    public handleFileInput(event: Event) {
        const element = event.currentTarget as HTMLInputElement;
        let fileList: FileList | null = element.files;
        if (fileList) {
            this.submitButtonStatus = READY
            this.selectedFile = fileList[0];
        }
    }

    public handleDownloadAll(): void {
        if (this.submitButtonStatus === READY || this.songDataService.songsData.length > 0) {
            this.downloadAllButtonStatus = LOADING;
            this.songDataService.downloadedMessages = [];

            const updatedData = this.songDataService.songsData.map(el => {
                // Create a copy of el.userInput, updating the duration or setting it if it's not already set
                const updatedUserInput = {
                    ...el.userInput,
                    duration: this.songDataService.defaultDuration
                };
                // Return a new object with the updated userInput
                return {
                    ...el,
                    userInput: updatedUserInput
                };
            });

            this.http.downloadMp3Bulk(updatedData)
                .subscribe({
                    next: (data) => {
                        this.downloadAllButtonStatus = READY;
                    },
                    error: (error: Error) => {
                        this.downloadAllButtonStatus = READY;
                        console.error('Error downloading mp3 in bulk:', error);
                    }
                });
        }
    }


    // Relevant parts of HeaderComponent
    public submitFile() {
        const file = this.selectedFile;
        if (file) {
            const reader = new FileReader();

            reader.onload = () => {
                const content = reader.result;
                if (typeof content === 'string') {
                    console.log("Sending message:", content);
                    this.ws.sendMessage(content);
                    this.submitButtonStatus = LOADING;

                    // Listen for messages from the server
                    this.ws.getMessages().subscribe({
                        next: (message) => {
                            if (message.includes('Successfully downloaded audio segment')) {
                                this.songDataService.downloadedMessages.push(message.replace('Successfully downloaded audio segment', "downloaded"));
                                return
                            }

                            const fetchedDataArray: SongDataFetched[] = JSON.parse(message);

                            const newSongsData: CombinedSongData[] = fetchedDataArray
                                .filter(fetched =>
                                    // Check if fetched song does not exist in the current songsData array
                                    !this.songDataService.songsData.some(
                                        existingSong => existingSong.fetched.original_url === fetched.original_url
                                    )
                                )
                                .map(fetched => ({
                                    fetched: fetched,
                                    userInput: {} // Initialize with an empty object or copy existing userInput if needed
                                }));

                            // Add the newSongsData to the existing songsData array
                            this.songDataService.songsData = [...this.songDataService.songsData, ...newSongsData];
                            console.log(this.songDataService.songsData);
                            this.submitButtonStatus = READY;
                        },
                        error: (error) => {
                            console.error('WebSocket error:', error);
                            this.submitButtonStatus = ERROR;
                        }
                    });
                }
            };

            reader.readAsText(file);
        }
    }




    public updateLengthInput(event: any): void {
        this.songDataService.defaultDuration = Number(event.target.value) ?? 0
        // this.songDataService.songsData.forEach(el => {
        //     el.userInput = el.userInput || {};
        //     el.userInput.duration = Number(event.target.value) || event.target.value;
        // })
    }

    protected readonly READY = READY;
    protected readonly LOADING = LOADING;
}
