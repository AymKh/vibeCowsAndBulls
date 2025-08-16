import { Component, OnInit } from '@angular/core';
import { MultiplayerService } from '../../services/multiplayer.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  protected connected: boolean = false;

  constructor(
    private readonly multiplayerService: MultiplayerService,
  ) { }

  ngOnInit(): void {
    this.multiplayerService
      .connected$
      .subscribe(connected => {
        this.connected = connected;
      })
  }


}
