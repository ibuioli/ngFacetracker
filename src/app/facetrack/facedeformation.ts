import { WebGLUtils } from './webgl_utils';

export class FaceDeformer {
  private gl: any;
  private verticeMap: any;
  private numTriangles: number;
  private maxx: number;
  private minx: number;
  private maxy: number;
  private miny: number;
  private width: number;
  private height: number;
  private first = true;
  private textureVertices: any;
  private gridVertices: any;
  private texCoordBuffer: any;
  private gridCoordbuffer: any;
  private texCoordLocation: any;
  private pdmModel: any;

  private usegrid = false;
  private drawProgram: any;
  private gridProgram: any;

  private webgl_utils: any;

  constructor() {
    this.webgl_utils = new WebGLUtils();
  }

  public init(canvas: any): void {
    // ready a webgl element
    this.gl = this.webgl_utils.getWebGLContext(canvas);
    this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  }

  public load(element: any, points: any, pModel: any, vertices: any): void {
    this.pdmModel = pModel;
    if (vertices) {
      this.verticeMap = vertices;
    } else {
      this.verticeMap = this.pdmModel.path.vertices;
    }
    this.numTriangles = this.verticeMap.length;

    // get cropping
    this.maxx = 0;
    this.minx = element.width;
    this.maxy = 0;
    this.miny = element.height;
    for (let i = 0; i < points.length; i++) {
      if (points[i][0] > this.maxx) { this.maxx = points[i][0]; }
      if (points[i][0] < this.minx) { this.minx = points[i][0]; }
      if (points[i][1] > this.maxy) { this.maxy = points[i][1]; }
      if (points[i][1] < this.miny) { this.miny = points[i][1]; }
    }
    this.minx = Math.floor(this.minx);
    this.maxx = Math.ceil(this.maxx);
    this.miny = Math.floor(this.miny);
    this.maxy = Math.ceil(this.maxy);
    this.width = this.maxx - this.minx;
    this.height = this.maxy - this.miny;

    // tslint:disable-next-line: prefer-const
    let cc: any;

    if (element.tagName === 'VIDEO' || element.tagName === 'IMG') {
      const ca = document.createElement('canvas');
      ca.width = element.width;
      ca.height = element.height;
      // tslint:disable-next-line: no-shadowed-variable
      cc = ca.getContext('2d');
      cc.drawImage(element, 0, 0, element.width, element.height);
    } else if (element.tagName === 'CANVAS') {
      // tslint:disable-next-line: no-shadowed-variable
      cc = element.getContext('2d');
    }
    const image = cc.getImageData(this.minx, this.miny, this.width, this.height);

    // correct points
    const nupoints = [];
    for (let i = 0; i < points.length; i++) {
      nupoints[i] = [];
      nupoints[i][0] = points[i][0] - this.minx;
      nupoints[i][1] = points[i][1] - this.miny;
    }

    // create vertices based on points
    const textureVertices = [];
    for (let i = 0; i < this.verticeMap.length; i++) {
      textureVertices.push(nupoints[this.verticeMap[i][0]][0] / this.width);
      textureVertices.push(nupoints[this.verticeMap[i][0]][1] / this.height);
      textureVertices.push(nupoints[this.verticeMap[i][1]][0] / this.width);
      textureVertices.push(nupoints[this.verticeMap[i][1]][1] / this.height);
      textureVertices.push(nupoints[this.verticeMap[i][2]][0] / this.width);
      textureVertices.push(nupoints[this.verticeMap[i][2]][1] / this.height);
    }

    if (this.first) {
      // create program for drawing grid
      const gridVertexShaderProg = [
        'attribute vec2 a_position;',
        '',
        'uniform vec2 u_resolution;',
        '',
        'void main() {',
        '  vec2 zeroToOne = a_position / u_resolution;',
        '  vec2 zeroToTwo = zeroToOne * 2.0;',
        '  vec2 clipSpace = zeroToTwo - 1.0;',
        '  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);',
        '}'
      ].join('\n');

      const gridFragmentShaderProg = [
        'void main() {',
        '  gl_FragColor = vec4(0.2, 0.2, 0.2, 1.0);',
        '}'
      ].join('\n');

      const gridVertexShader = this.webgl_utils.loadShader(this.gl, gridVertexShaderProg, this.gl.VERTEX_SHADER);
      const gridFragmentShader = this.webgl_utils.loadShader(this.gl, gridFragmentShaderProg, this.gl.FRAGMENT_SHADER);
      try {
        this.gridProgram = this.webgl_utils.loadProgram(this.gl, [gridVertexShader, gridFragmentShader]);
      } catch (err) {
        alert('There was a problem setting up the webGL programs. Maybe you should try it in another browser.');
      }

      this.gridCoordbuffer = this.gl.createBuffer();

      // create program for drawing deformed face
      const vertexShaderProg = [
        'attribute vec2 a_texCoord;',
        'attribute vec2 a_position;',
        '',
        'varying vec2 v_texCoord;',
        '',
        'uniform vec2 u_resolution;',
        '',
        'void main() {',
        '  vec2 zeroToOne = a_position / u_resolution;',
        '  vec2 zeroToTwo = zeroToOne * 2.0;',
        '  vec2 clipSpace = zeroToTwo - 1.0;',
        '  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);',
        '  ',
        '  v_texCoord = a_texCoord;',
        '}'
      ].join('\n');

      const fragmentShaderProg = [
        'precision mediump float;',
        '',
        'uniform sampler2D u_image;',
        '',
        'varying vec2 v_texCoord;',
        '',
        'void main() {',
        '  gl_FragColor = texture2D(u_image, v_texCoord);',
        '}'
      ].join('\n');

      const vertexShader = this.webgl_utils.loadShader(this.gl, vertexShaderProg, this.gl.VERTEX_SHADER);
      const fragmentShader = this.webgl_utils.loadShader(this.gl, fragmentShaderProg, this.gl.FRAGMENT_SHADER);
      this.drawProgram = this.webgl_utils.loadProgram(this.gl, [vertexShader, fragmentShader]);

      this.texCoordBuffer = this.gl.createBuffer();

      this.first = false;
    }

    // load program for drawing grid
    this.gl.useProgram(this.gridProgram);

    // set the resolution for grid program
    let resolutionLocation = this.gl.getUniformLocation(this.gridProgram, 'u_resolution');
    this.gl.uniform2f(resolutionLocation, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

    // load program for drawing deformed face
    this.gl.useProgram(this.drawProgram);

    // look up where the vertex data needs to go.
    this.texCoordLocation = this.gl.getAttribLocation(this.drawProgram, 'a_texCoord');

    // provide texture coordinates for face vertices (i.e. where we're going to copy face vertices from).
    this.gl.enableVertexAttribArray(this.texCoordLocation);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(textureVertices), this.gl.STATIC_DRAW);

    this.gl.vertexAttribPointer(this.texCoordLocation, 2, this.gl.FLOAT, false, 0, 0);

    // Create the texture.
    const texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

    // Upload the image into the texture.
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);

    // set the resolution for draw program
    resolutionLocation = this.gl.getUniformLocation(this.drawProgram, 'u_resolution');
    this.gl.uniform2f(resolutionLocation, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
  }

  public draw(points: any): void {

    if (this.usegrid) {
      // switch program if needed
      this.gl.useProgram(this.drawProgram);

      // texCoordLocation = gl.getAttribLocation(drawProgram, "a_texCoord");

      this.gl.enableVertexAttribArray(this.texCoordLocation);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
      this.gl.vertexAttribPointer(this.texCoordLocation, 2, this.gl.FLOAT, false, 0, 0);

      this.usegrid = false;
    }

    // create drawvertices based on points
    const vertices = [];
    for (let i = 0; i < this.verticeMap.length; i++) {
      vertices.push(points[this.verticeMap[i][0]][0]);
      vertices.push(points[this.verticeMap[i][0]][1]);
      vertices.push(points[this.verticeMap[i][1]][0]);
      vertices.push(points[this.verticeMap[i][1]][1]);
      vertices.push(points[this.verticeMap[i][2]][0]);
      vertices.push(points[this.verticeMap[i][2]][1]);
    }

    const positionLocation = this.gl.getAttribLocation(this.drawProgram, 'a_position');

    // Create a buffer for the position of the vertices.
    const drawPosBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, drawPosBuffer);
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

    // Draw the face vertices
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.numTriangles * 3);
  }

  public drawGrid(points: any): void {

    if (!this.usegrid) {
      this.gl.useProgram(this.gridProgram);

      this.usegrid = true;
    }

    // create drawvertices based on points
    const vertices = [];
    // create new texturegrid
    if (this.verticeMap) {
      for (let i = 0; i < this.verticeMap.length; i++) {
        vertices.push(points[this.verticeMap[i][0]][0]);
        vertices.push(points[this.verticeMap[i][0]][1]);
        vertices.push(points[this.verticeMap[i][1]][0]);
        vertices.push(points[this.verticeMap[i][1]][1]);

        vertices.push(points[this.verticeMap[i][1]][0]);
        vertices.push(points[this.verticeMap[i][1]][1]);
        vertices.push(points[this.verticeMap[i][2]][0]);
        vertices.push(points[this.verticeMap[i][2]][1]);

        vertices.push(points[this.verticeMap[i][2]][0]);
        vertices.push(points[this.verticeMap[i][2]][1]);
        vertices.push(points[this.verticeMap[i][0]][0]);
        vertices.push(points[this.verticeMap[i][0]][1]);
      }

      const positionLocation = this.gl.getAttribLocation(this.gridProgram, 'a_position');

      // Create a buffer for position of the vertices (lines)
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gridCoordbuffer);
      this.gl.enableVertexAttribArray(positionLocation);
      this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

      // Draw the lines
      this.gl.drawArrays(this.gl.LINES, 0, this.numTriangles * 6);
    }
  }

  public clear(): void {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  public calculatePositions(parameters: any, useTransforms: any): any {
    let x: number, y: number, a: number, b: number;
    const numParameters = parameters.length;
    const positions = [];
    for (let i = 0; i < this.pdmModel.patchModel.numPatches; i++) {
      x = this.pdmModel.shapeModel.meanShape[i][0];
      y = this.pdmModel.shapeModel.meanShape[i][1];
      for (let j = 0; j < numParameters - 4; j++) {
        x += this.pdmModel.shapeModel.eigenVectors[(i * 2)][j] * parameters[j + 4];
        y += this.pdmModel.shapeModel.eigenVectors[(i * 2) + 1][j] * parameters[j + 4];
      }
      if (useTransforms) {
        a = parameters[0] * x - parameters[1] * y + parameters[2];
        b = parameters[0] * y + parameters[1] * x + parameters[3];
        x += a;
        y += b;
      }
      positions[i] = [x, y];
    }

    return positions;
  }
  // --END FACEDEFORMATION.TS
}
