import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameBoardComponent } from './views/game-board/game-board.component';
import { MultiplayerComponent } from './views/multiplayer/multiplayer.component';

const routes: Routes = [
  { path: '', redirectTo: '/singleplayer', pathMatch: 'full' },
  { path: 'singleplayer', component: GameBoardComponent },
  { path: 'multiplayer', component: MultiplayerComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
