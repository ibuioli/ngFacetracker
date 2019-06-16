// Migration to TS and modification by Ignacio Buioli, ibuioli.com.ar
//
// Based on webgl-utils.js authored by Gregg Tavares, license below:
/*
 * Copyright (c) 2011, Gregg Tavares
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 * * Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 *  * Neither the name of greggman.com nor the names of its contributors
 *   may be used to endorse or promote products derived from this software
 *   without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

declare let window: any;

export class WebGLUtils {
  private LOGGING_ENABLED = true;

  constructor() {}

  public log(msg): void {
    if (!this.LOGGING_ENABLED) { return; }
    if (window.console && window.console.log) {
      window.console.log(msg);
    }
  }

  public error(msg): void {
    if (!this.LOGGING_ENABLED) { return; }
    if (window.console) {
      if (window.console.error) {
        window.console.error(msg);
      } else if (window.console.log) {
        window.console.log(msg);
      }
    }
    throw msg;
  }

  public loggingOff(): void {
    this.LOGGING_ENABLED = false;
  }

  public isInIFrame(): boolean {
    return window !== window.top;
  }

  public glEnumToString(gl, value): string {
    for (const p in gl) {
      if (gl[p] === value) {
        return p;
      }
    }
    return '0x' + value.toString(16);
  }

  public makeFailHTML(msg): string {
    return '' +
      '<table style="background-color: #8CE; width: 100%; height: 100%;"><tr>' +
      '<td align="center">' +
      '<div style="display: table-cell; vertical-align: middle;">' +
      '<div style="">' + msg + '</div>' +
      '</div>' +
      '</td></tr></table>';
  }

  public setupWebGL(canvas, optAttribs): any {

    if (!window.WebGLRenderingContext) {
      return null;
    }

    const context = this.create3DContext(canvas, optAttribs);
    if (!context) {
      return null;
    }
    return context;
  }

  public create3DContext(canvas, optAttribs): any {
    const names = ['webgl', 'experimental-webgl'];
    let context = null;
    for (let ii = 0; ii < names.length; ++ii) {
      try {
        context = canvas.getContext(names[ii], optAttribs);
      } catch (e) {}
      if (context) {
        break;
      }
    }
    return context;
  }

  public updateCSSIfInIFrame(): void {
    if (this.isInIFrame()) {
      document.body.className = 'iframe';
    }
  }

  public getWebGLContext(canvas): any {
    if (this.isInIFrame()) {
      this.updateCSSIfInIFrame();

      // make the canvas backing store the size it's displayed.
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }

    const gl = this.setupWebGL(canvas, '');
    return gl;
  }

  public loadShader(gl, shaderSource, shaderType, optErrorCallback): any {
    const errFn = optErrorCallback || this.error;
    // Create the shader object
    const shader = gl.createShader(shaderType);

    // Load the shader source
    gl.shaderSource(shader, shaderSource);

    // Compile the shader
    gl.compileShader(shader);

    // Check the compile status
    const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
      // Something went wrong during compilation; get the error
      const lastError = gl.getShaderInfoLog(shader);
      errFn('*** Error compiling shader \'' + shader + '\':' + lastError);
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  public loadProgram(gl, shaders, optAttribs, optLocations): any {
    const program = gl.createProgram();
    for (let i = 0; i < shaders.length; ++i) {
      gl.attachShader(program, shaders[i]);
    }
    if (optAttribs) {
      for (let i = 0; i < optAttribs.length; ++i) {
        gl.bindAttribLocation(
            program,
            optLocations ? optLocations[i] : i,
            optAttribs[i]);
      }
    }
    gl.linkProgram(program);

    // Check the link status
    const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
      // something went wrong with the link
      const lastError = gl.getProgramInfoLog(program);
      this.error('Error in program linking:' + lastError);

      gl.deleteProgram(program);
      return null;
    }
    return program;
  }

  public createShaderFromScript(gl, scriptId, optShaderType, optErrorCallback): any {
    let shaderSource = '';
    let shaderType;
    const shaderScript = (<HTMLScriptElement>document.getElementById(scriptId));
    if (!shaderScript) {
      throw new Error('*** Error: unknown script element' + scriptId);
    }
    shaderSource = shaderScript.text;

    if (!optShaderType) {
      if (shaderScript.type === 'x-shader/x-vertex') {
        shaderType = gl.VERTEX_SHADER;
      } else if (shaderScript.type === 'x-shader/x-fragment') {
        shaderType = gl.FRAGMENT_SHADER;
      } else if (
        shaderType !== gl.VERTEX_SHADER &&
        shaderType !== gl.FRAGMENT_SHADER
      ) {
        throw new Error('*** Error: unknown shader type');
      }
    }

    return this.loadShader(
      gl,
      shaderSource,
      optShaderType || shaderType,
      optErrorCallback
    );
  }
  // --END WEBGL_UTILS.TS
}
