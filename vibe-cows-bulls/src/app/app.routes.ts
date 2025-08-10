import { Routes } from '@angular/router';
import { GameBoardComponent } from './views/game-board/game-board.component';
import { MultiplayerComponent } from './views/multiplayer/multiplayer.component';

export const routes: Routes = [
  { path: '', redirectTo: '/singleplayer', pathMatch: 'full' },
  { path: 'singleplayer', component: GameBoardComponent },
  { path: 'multiplayer', component: MultiplayerComponent }
];
