import { Routes } from '@angular/router';
import { Game } from './game/game';
import { NewGame } from './new-game/new-game';

export const routes: Routes = [
  {
    path: 'game/:id',
    component: Game,
  },
  {
    path: '',
    component: NewGame,
  },
];
