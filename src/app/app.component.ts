import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public width:number = 400;
  public height:number = 300;

  constructor(){}

  ngOnInit(){}

}
