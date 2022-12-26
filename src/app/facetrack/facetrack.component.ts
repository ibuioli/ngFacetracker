import { Component, OnInit, ElementRef, Input, ViewChild, AfterViewInit } from '@angular/core';
import { FaceTracker } from './facetrack';
declare var navigator: any;

@Component({
  selector: 'app-facetrack',
  templateUrl: './facetrack.component.html',
  styleUrls: ['./facetrack.component.css']
})
export class FacetrackComponent implements OnInit, AfterViewInit {
  @ViewChild('hardwareVideo', {static: true}) private hardwareVideo: ElementRef;
  @ViewChild('overlay', {static: true}) private overlay: ElementRef;
  @ViewChild('webgl', {static: true}) private webgl: ElementRef;
  @ViewChild('imageMask', {static: true}) private imageMask: ElementRef;
  /////////////////////////////////////////////////////////////
  private constraints: any;
  public track: any;
  public scaleX = 1;
  public scaleY = 1;
  public rotationY = 0;
  public rotationZ = 0;
  public rotationX = 0;
  public posx = 0;
  public posy = 0;
  ////////////////////////////////////////////////////////////
  @Input() public width = 400;
  @Input() public height = 300;

  constructor() {
    navigator.getUserMedia = (navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia);
  }

  public ngOnInit() {
    this.constraints = {
      audio: false,
      video: {
        width: {ideal: 640},
        height: {ideal: 480},
        minAspectRatio: 1.333,
        maxAspectRatio: 1.334,
        minFrameRate: 30
      }
    };

    this.videoStart();
  }

  public ngAfterViewInit() {
    this.clmtrackr();
    this.loop();
  }

  private videoStart() {
    const video = this.hardwareVideo.nativeElement;

    const promise = new Promise<MediaStream>((resolve, reject) => {
      navigator.getUserMedia(this.constraints, (stream: MediaStream | PromiseLike<MediaStream>) => {
          resolve(stream);
        }, (err: any) => reject(err));
        }).then((stream) => {
        if ('srcObject' in video) {
          video.srcObject = stream;
        }
        video.onloadedmetadata = function(e: any) {
          video.play();
        };
      }).catch(this.logError);
  }

  private clmtrackr() {
    this.track = new FaceTracker(this.hardwareVideo, this.overlay, this.webgl, this.imageMask, true);
    this.track.clmInit();
    // Debug
    this.track.drawLoop();
    this.track.drawGrid(); // */Comment for No-Debug
    // Draw Face Mask
    // this.track.drawMask();//Comment for No-Mask
    // Draw 3D Objects
    this.track.getFaceData(); // Comment for No-3D-Objects
  }

  private loop = () => {
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
    console.log(error.name + ': ' + error.message);
  }

}
