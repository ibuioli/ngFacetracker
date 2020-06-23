import { AfterViewInit, Component, Directive, ElementRef, Input, ViewChild } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-layer-3d',
  templateUrl: './three.component.html',
  styleUrls: ['./three.component.css']
})
export class ThreeComponent implements AfterViewInit {
  private camera: THREE.OrthographicCamera;

  @ViewChild('canvas3D', {static: true}) private canvas3D: ElementRef;
  private get canvas(): HTMLCanvasElement {
    return this.canvas3D.nativeElement;
  }
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;

  /* PROPERTIES */
  @Input() public width = 400;
  @Input() public height = 300;
  @Input() public cameraZ = 400;
  @Input() public fieldOfView = 50;
  @Input() public nearClippingPane = 1;
  @Input() public farClippingPane = 1000;

  @Input() public scaleX = 1;
  @Input() public scaleY = 1;

  @Input() public rotationY = 0;
  @Input() public rotationZ = 0;
  @Input() public rotationX = 0;

  @Input() public posx = 0;
  @Input() public posy = 0;

  constructor() { }

  private animate(): void {
    this.scene.scale.set(this.scaleX, this.scaleY, this.scaleX);
    this.scene.position.x = ( (this.posx - (this.canvas.clientWidth / 2) ) * -1 );
    this.scene.position.y = ( (this.posy - (this.canvas.clientHeight / 2) ) * -1);
    this.scene.rotation.y = this.rotationY / 50;
    this.scene.rotation.z = this.rotationZ / 100 * -1;
    this.scene.rotation.x = this.rotationX / 50 * -1;
  }

  private create(): void {
    // PreScene
    const preScene = new THREE.Scene();
    // Cube for Debug
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    const geometry = new THREE.BoxBufferGeometry(100, 100, 100);
    const cube = new THREE.Mesh(geometry, material);
    preScene.add(cube); // Comment for hide Debug Cube*/

    const light = new THREE.AmbientLight( 0xffffff, 1 );

    this.scene.add(light);
    this.scene.add(preScene);
  }

  private createScene(): void {
    /* Scene */
    this.scene = new THREE.Scene();

    /* Camera */
    const aspectRatio = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera = new THREE.OrthographicCamera(this.canvas.clientWidth / - 2, this.canvas.clientWidth / 2,
    this.canvas.clientHeight / 2, this.canvas.clientHeight / - 2, this.nearClippingPane, this.farClippingPane);
    this.camera.position.z = this.cameraZ;
  }

  /* LOOP */
  private startRenderingLoop(): void {
    /* Renderer */
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, premultipliedAlpha: false});
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    const component: ThreeComponent = this;
    (function render() {
      requestAnimationFrame(render);
      component.animate();
      component.renderer.render(component.scene, component.camera);
    }());
  }

  /* EVENTS */
  public onResize(): void {
    // this.camera.aspect = this.getAspectRatio();
    // this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
  }

  public ngAfterViewInit(): void {
    this.createScene();
    this.create();
    this.startRenderingLoop();
  }

}
