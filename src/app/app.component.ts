import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  /* Camera Resolution */
  /* More is better */
  public width = 640;
  public height = 480;

  constructor() {}

}
