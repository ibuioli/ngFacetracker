import { ElementRef } from '@angular/core';
import * as clm from 'clmtrackr';

export class FaceTracker {
  //Internal Constructor Params
  private _video: ElementRef;
  private _overlay: ElementRef;
  private _videoReady: boolean = false;

  //CLM object
  private _clm:any;

  //Canvas & Context
  private _canvas:any;
  private _cc:any;

  //Params from Face
  public _scaleX:number = 1;
  public _scaleY:number = 1;
  public _rotationY:number = 0;
  public _rotationZ:number = 0;
  public _rotationX:number = 0;
  public _posx:number = 0;
  public _posy:number = 0;

  constructor(video:ElementRef, overlay:ElementRef, videoReady:boolean) {
    this._video = video;
    this._overlay = overlay;
    this._videoReady = videoReady;
    //////////////////////////////
    this._clm = new clm.default.tracker({useWebGL: true, searchWindow : 14});
  }

  public clmInit() {
    //Tracking Init
    this._clm.init();
    //Start FaceTracking
    this.clmStart();
    ////////////////////////////
    //Init canvas
    this._canvas = this._overlay.nativeElement;
    this._cc = this._canvas.getContext('2d');
  }

  public clmStart(){
    this._clm.start(this._video.nativeElement);
  }

  public clmStop(){
    this._clm.stop();
  }

  public drawLoop = () => {
    if (this._clm.getCurrentPosition()) {
      if(this._clm.getScore() > 0.5){
        this._cc.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this._clm.draw(this._canvas);
      }else{
        this._cc.clearRect(0, 0, this._canvas.width, this._canvas.height);
      }
    }

    requestAnimationFrame(this.drawLoop);
  }

  public getFaceData = () => {
    if (this._clm.getCurrentPosition()) {
      if(this._clm.getScore() > 0.5){
        this._scaleX = (this._clm.getCurrentPosition()[14][0] - this._clm.getCurrentPosition()[0][0]) / 80;
        this._scaleY = (this._clm.getCurrentPosition()[7][1] - this._clm.getCurrentPosition()[33][1]) / 60;
        this._rotationY = (this._clm.getCurrentPosition()[3][0] - this._clm.getCurrentPosition()[44][0]) - (this._clm.getCurrentPosition()[50][0] - this._clm.getCurrentPosition()[11][0]);
        this._rotationZ = this._clm.getCurrentPosition()[0][1] - this._clm.getCurrentPosition()[14][1];
        this._rotationX = this._clm.getCurrentPosition()[0][1] - this._clm.getCurrentPosition()[23][1];
        this._posx = this._clm.getCurrentPosition()[62][0];
        this._posy = this._clm.getCurrentPosition()[62][1];
      }
    }

    requestAnimationFrame(this.getFaceData);
  }
  //--END FACETRACK.TS
}
