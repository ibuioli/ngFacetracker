import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { FacetrackComponent } from './facetrack/facetrack.component';
import { ThreeComponent } from './facetrack/three/three.component';


@NgModule({
  declarations: [
    AppComponent,
    FacetrackComponent,
    ThreeComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
