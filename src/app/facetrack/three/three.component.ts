import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'layer-3d',
  templateUrl: './three.component.html',
  styleUrls: ['./three.component.css']
})
export class ThreeComponent implements AfterViewInit {
  private camera: THREE.OrthographicCamera;

  @ViewChild('canvas3D') private canvas3D: ElementRef;
  private get canvas() : HTMLCanvasElement {
    return this.canvas3D.nativeElement;
  }
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;

  /* PROPERTIES */
  @Input() public width:number = 400;
  @Input() public height:number = 300;
  @Input() public cameraZ:number = 400;
  @Input() public fieldOfView:number = 50;
  @Input('nearClipping') public nearClippingPane:number = 1;
  @Input('farClipping') public farClippingPane:number = 1000;

  @Input('scaleX') public scaleX:number = 1;
  @Input('scaleY') public scaleY:number = 1;

  @Input('rotationY') public rotationY:number = 0;
  @Input('rotationZ') public rotationZ:number = 0;
  @Input('rotationX') public rotationX:number = 0;

  @Input('posx') public posx:number = 0;
  @Input('posy') public posy:number = 0;

  constructor() { }

  private animate():void {
    this.scene.scale.set(this.scaleX, this.scaleY, this.scaleX);
    this.scene.position.x = ( (this.posx-(this.canvas.clientWidth/2) )*-1 );
    this.scene.position.y = ( (this.posy-(this.canvas.clientHeight/2) )*-1);
    this.scene.rotation.y = this.rotationY / 50;
    this.scene.rotation.z = this.rotationZ / 100*-1;
    this.scene.rotation.x = this.rotationX / 50*-1;
  }

  private create():void {
    //PreScene
    let preScene = new THREE.Scene();
    //Cube for Debug
    let material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    let geometry = new THREE.BoxBufferGeometry(100, 100, 100);
    let cube = new THREE.Mesh(geometry, material);
    preScene.add(cube);//Comment for hide Debug Cube*/

    let light = new THREE.AmbientLight( 0xffffff, 1 );

    this.scene.add(light);
    this.scene.add(preScene);
  }

  private createScene():void {
    /* Scene */
    this.scene = new THREE.Scene();

    /* Camera */
    let aspectRatio = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera = new THREE.OrthographicCamera(this.canvas.clientWidth / - 2, this.canvas.clientWidth / 2,
    this.canvas.clientHeight / 2, this.canvas.clientHeight / - 2, this.nearClippingPane, this.farClippingPane);
    this.camera.position.z = this.cameraZ;
  }

  /* LOOP */
  private startRenderingLoop():void {
    /* Renderer */
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, premultipliedAlpha: false});
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    let component: ThreeComponent = this;
    (function render() {
      requestAnimationFrame(render);
      component.animate();
      component.renderer.render(component.scene, component.camera);
    }());
  }

  /* EVENTS */
  public onResize():void {
    //this.camera.aspect = this.getAspectRatio();
    //this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
  }

  public ngAfterViewInit():void {
    this.createScene();
    this.create();
    this.startRenderingLoop();
  }

}
