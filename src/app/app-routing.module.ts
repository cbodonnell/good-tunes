import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlayerComponent } from './components/player/player.component';
import { WaveComponent } from './components/wave/wave.component';

const routes: Routes = [
  {
    path: '',
    component: PlayerComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
