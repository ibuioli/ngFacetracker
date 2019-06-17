import { ElementRef } from '@angular/core';
import { FaceDeformer } from './facedeformation';
import { FaceModel } from './model_spca_20_svm';

declare var clm: any;

export class FaceTracker {
  // Internal Constructor Params
  private _video: ElementRef;
  private _overlay: ElementRef;
  private _webgl: ElementRef;
  private _imageMask: ElementRef;
  private _videoReady = false;

  // CLM object
  private _clm: any;

  // Face Deformation
  private _defor: any;
  private _faceModel: any;
  private _points: any;

  // Canvas & Context
  private _canvas: any;
  private _cc: any;
  private _webglCanvas: any;
  private _webglCC: any;

  // Params from Face
  public _scaleX = 1;
  public _scaleY = 1;
  public _rotationY = 0;
  public _rotationZ = 0;
  public _rotationX = 0;
  public _posx = 0;
  public _posy = 0;

  constructor(video: ElementRef, overlay: ElementRef, webgl: ElementRef, imageMask: ElementRef, videoReady: boolean) {
    this._video = video;
    this._overlay = overlay;
    this._webgl = webgl;
    this._imageMask = imageMask.nativeElement;
    this._videoReady = videoReady;
    //////////////////////////////
    this._clm = new clm.tracker({useWebGL: true, searchWindow : 14});
    this._defor = new FaceDeformer();
    this._faceModel = new FaceModel();
    this._points = [
      [54.132994582809886, 330.2447406482356], [53.94983737338171, 411.6786947731232],
      [59.50117090734213, 485.54290769879117], [69.05631570910228, 577.6685769791815], [80.73400747239302, 669.2047081882876],
      [156.52267192878207, 721.5706883991684], [224.03761978834723, 739.1269072358452], [301.4803537679236, 738.2366874355024],
      [373.4196207112528, 736.6185556997145], [445.4373067968218, 720.1452812831552], [517.3056114476371, 670.5474614197833],
      [531.7799053755264, 574.1779931382804], [540.681172219442, 487.967223266098], [542.4032150608897, 399.64595333584305],
      [541.5099369565868, 318.2177239885218], [484.00763535360403, 311.3318445452918], [436.57616449858205, 326.12885038303966],
      [386.214847801106, 333.2043197182652], [344.39911403378784, 336.7706741289662], [115.84864343665006, 313.35525243241443],
      [152.60840318917894, 322.7145050535586], [201.39783835228144, 332.29526724516336], [249.58724826191298, 336.53976562323317],
      [116.48023640991207, 348.8633768136441], [167.9642886955806, 350.9962302246727], [231.6749647028165, 359.48349174177827],
      [168.11831577303042, 375.4865728177492], [170.07462103025938, 361.76575290725043], [480.7831200700384, 348.57719399476593],
      [423.78106882269736, 353.08381522791285], [369.5853199174605, 360.3348770905004], [429.2517105029677, 374.978498189726],
      [428.4672557696136, 361.0310278167258], [298, 363], [253.70821429640165, 456.1515630753871], [232.81854206254127, 493.52915431030885],
      [250.27449264190767, 519.2760705851281], [294.9905749783811, 522.6580485667231], [340.00710866420684, 520.8077271147647],
      [357.28424845402884, 493.1349774295837], [336.03221275387335, 457.7253897416814], [296, 407], [270.69780042635847, 507.2277260957476],
      [320.8265507066314, 506.90809731554305], [219.49207600124322, 603.6108989555861], [236.4148918469843, 589.8509195222699],
      [267.0123175575189, 590.2653879517876], [302.37639394449644, 589.4456339021824], [337.18338067155105, 591.0755705685021],
      [366.9537080661368, 591.1696362146871], [383.17030058050824, 601.5027761622135], [366.07822563380967, 614.8268645173376],
      [336.20759244137867, 615.427540755917], [304.12597029775543, 615.4777558918809], [270.01910167830954, 615.9331065732697],
      [240.4271869365151, 614.9063722445486], [255.5183417994636, 603.9175341052295], [302.81892822034536, 605.4895650711086],
      [350.74058301633727, 604.2225054756758], [350.6655959742464, 603.528118265738], [303.78446463916174, 604.3090513544694],
      [256.409865954666, 603.8790201634539], [298.25175247557996, 482.7822436696597], [141.22182216936852, 346.4270057321846],
      [206.31948949078424, 356.7387529836485], [202.39427275621864, 368.9872676086593], [136.2964448024117, 368.67555898584044],
      [454.78000220898934, 348.3276075895992], [398.6821272555564, 355.2080431875895], [398.9194910642594, 369.6579535284187],
      [466.01878775359233, 368.7792910743897]
    ];
  }

  public clmInit() {
    // Tracking Init
    this._clm.init(this._faceModel.model());
    // Start FaceTracking
    this.clmStart();
    ////////////////////////////
    // Init canvas
    this._canvas = this._overlay.nativeElement;
    this._cc = this._canvas.getContext('2d');
    // Init 3D Canvas
    this._webglCanvas = this._webgl.nativeElement; // */
    ////////////////////////////
    // Init Face facedeformation
    this._defor.init(this._webglCanvas);
    this._defor.load(this._imageMask, this._points, this._faceModel.model());
  }

  public clmStart() {
    this._clm.start(this._video.nativeElement);
  }

  public clmStop() {
    this._clm.stop();
  }

  public drawLoop = () => {
    if (this._clm.getCurrentPosition()) {
      if (this._clm.getScore() > 0.5) {
        this._cc.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this._clm.draw(this._canvas);
      } else {
        this._cc.clearRect(0, 0, this._canvas.width, this._canvas.height);
      }
    }

    requestAnimationFrame(this.drawLoop);
  }

  public drawGrid = () => {
    if (this._clm.getCurrentPosition()) {
      if (this._clm.getScore() > 0.5) {
        this._defor.drawGrid(this._clm.getCurrentPosition());
      } else {
        this._defor.clear();
      }
    }

    requestAnimationFrame(this.drawGrid);
  }

  public drawMask = () => {
    if (this._clm.getCurrentPosition()) {
      if (this._clm.getScore() > 0.5) {
        this._defor.load(this._imageMask, this._points, this._faceModel.model());
        this._defor.draw(this._clm.getCurrentPosition());
      } else {
        this._defor.clear();
      }
    }

    requestAnimationFrame(this.drawMask);
  }

  public getFaceData = () => {
    if (this._clm.getCurrentPosition()) {
      if (this._clm.getScore() > 0.5) {
        this._scaleX = (this._clm.getCurrentPosition()[14][0] - this._clm.getCurrentPosition()[0][0]) / 80;
        this._scaleY = (this._clm.getCurrentPosition()[7][1] - this._clm.getCurrentPosition()[33][1]) / 60;
        this._rotationY = (this._clm.getCurrentPosition()[3][0] - this._clm.getCurrentPosition()[44][0]) -
        (this._clm.getCurrentPosition()[50][0] - this._clm.getCurrentPosition()[11][0]);
        this._rotationZ = this._clm.getCurrentPosition()[0][1] - this._clm.getCurrentPosition()[14][1];
        this._rotationX = this._clm.getCurrentPosition()[0][1] - this._clm.getCurrentPosition()[23][1];
        this._posx = this._clm.getCurrentPosition()[62][0];
        this._posy = this._clm.getCurrentPosition()[62][1];
      }
    }

    requestAnimationFrame(this.getFaceData);
  }
  // --END FACETRACK.TS
}
