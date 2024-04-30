import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {SongsListComponent} from "./songs-list/songs-list.component";
import {HeaderComponent} from "./header/header.component";
import { HttpClientModule} from "@angular/common/http";
import {HttpService} from "./http.service";


@Component({
  selector: 'app-root',
  standalone: true,
    imports: [CommonModule, RouterOutlet, SongsListComponent, HeaderComponent, HttpClientModule],
    providers: [HttpService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {


}
