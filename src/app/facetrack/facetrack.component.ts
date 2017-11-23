import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FaceTracker } from "./facetrack";
declare var navigator: any;

@Component({
  selector: 'app-facetrack',
  templateUrl: './facetrack.component.html',
  styleUrls: ['./facetrack.component.css']
})
export class FacetrackComponent implements OnInit {
  @ViewChild("hardwareVideo") private hardwareVideo: ElementRef;
  @ViewChild("overlay") private overlay: ElementRef;
  @ViewChild("webgl") private webgl: ElementRef;
  /////////////////////////////////////////////////////////////
  private constraints:any;
  public track:any;
  public scaleX:number = 1;
  public scaleY:number = 1;
  public rotationY:number = 0;
  public rotationZ:number = 0;
  public rotationX:number = 0;
  public posx:number = 0;
  public posy:number = 0;

  constructor() {
    navigator.getUserMedia = (navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia);
  }

  public ngOnInit() {
    this.constraints = {
      audio:false,
      video: {
        width:{ideal:640},
        height:{ideal:480},
        minAspectRatio: 1.333,
        maxAspectRatio: 1.334,
        minFrameRate: 30
      }
    };

    this.videoStart();
  }

  public ngAfterViewInit(){
    this.clmtrackr();
    this.loop();
  }

  private videoStart(){
    let video = this.hardwareVideo.nativeElement;

    let promise = new Promise<MediaStream>((resolve, reject) => {
      navigator.getUserMedia(this.constraints, (stream) => {
        resolve(stream);
      }, (err) => reject(err));
    }).then((stream) => {
      if ("srcObject" in video) {
        video.srcObject = stream;
      } else {
        video.src = window.URL.createObjectURL(stream);
      }
      video.onloadedmetadata = function(e) {
        video.play();
      };
    }).catch(this.logError);
  }

  private clmtrackr() {
    this.track = new FaceTracker(this.hardwareVideo, this.overlay, this.webgl, true);
    this.track.clmInit();
    //Debug
    this.track.drawLoop();
    this.track.drawGrid();//*/Comment for No-Debug
    //Draw Face Mask
    //this.track.drawMask();//Comment for No-Mask
    //Draw 3D Objects
    this.track.getFaceData();//Comment for No-3D-Objects
  }

  private loop = () =>{
    this.scaleX = this.track._scaleX;
    this.scaleY = this.track._scaleY;
    this.rotationY = this.track._rotationY;
    this.rotationZ = this.track._rotationZ;
    this.rotationX = this.track._rotationX;
    this.posx = this.track._posx;
    this.posy = this.track._posy;

    requestAnimationFrame(this.loop);
  }

  private logError(error: any) {
    console.log(error.name + ": " + error.message);
  }

}
