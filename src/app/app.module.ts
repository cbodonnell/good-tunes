import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlayerComponent } from './components/player/player.component';
import { FileComponent } from './components/file/file.component';
import { UploadDirective } from './directives/upload.directive';

@NgModule({
  declarations: [
    AppComponent,
    PlayerComponent,
    FileComponent,
    UploadDirective,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
