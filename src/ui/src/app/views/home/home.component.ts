import { Component, OnInit } from '@angular/core';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  protected navigation = [
    {
      label: 'Single Player',
      route: '/singleplayer',
      image: '/assets/images/mainMenu/singleplayer.png',
      imageHover: '/assets/images/mainMenu/singleplayer_hover.png',
    },
    {
      label: 'Multiplayer',
      route: '/multiplayer',
      image: '/assets/images/mainMenu/multiplayer.png',
      imageHover: '/assets/images/mainMenu/multiplayer.png',
    },
    {
      label: 'Gallery',
      route: '/gallery',
      image: '/assets/images/mainMenu/gallery.png',
      imageHover: '/assets/images/mainMenu/gallery.png',
    },
  ];

  private audio!: Howl;

  constructor(
    private readonly audioService: AudioService,
  ) { }

  ngOnInit(): void {
    this.audio = this.audioService.selectSoundFromLibrary('mainMenuHover');
  }


  protected onMouseEnter() {
    this.audioService.playAudio(this.audio);
  }

}
