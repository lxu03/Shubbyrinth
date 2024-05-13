var VSHADER_SOURCE =
  `attribute vec4 a_Position;
  uniform float u_Size;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`;

var FSHADER_SOURCE =
  `precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    }
    else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV,1.0,1.0);
    }
    else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    }
    else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    }
    else {
      gl_FragColor = vec4(1,0.2,0.2,1);
    }
  }`

let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_whichTexture;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_Sampler1;

function setupWebGL() {
  canvas = document.getElementById('webgl')
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if(!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if(!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if(a_UV<0) {
    console.log('Failed to get the storage location of a_UV');
    return false;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if(!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if(!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if(!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return false;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if(!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if(!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }
}

let g_globalAngleY = 0;
let g_globalAngleX = 0;
let cam;

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  cam = new Camera();
  
  canvas.onmousedown=click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) }}
  document.onkeydown = keydown;
  initTextures(0);
  initTextures(1);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  gl.clear(gl.COLOR_BUFFER_BIT);
  requestAnimationFrame(tick);
}

var mapo = [
  [[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1]],
  [[1,1],[1],[0],[1],[1],[1],[1],[0],[1],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[1,1]],
  [[1,1],[1],[0],[1],[1],[1],[1],[0],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1,1]],
  [[1,1],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[1,1]],
  [[1,1],[1],[0],[1],[1],[1],[1],[0],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[0],[1],[0],[1],[0],[1,1]],
  [[1,1],[1],[0],[1],[0],[0],[1],[0],[1],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[1],[0],[1],[0],[1],[0],[1,1]],
  [[1,1],[1],[0],[1],[0],[0],[1],[0],[1],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[1],[0],[1],[0],[1],[0],[1,1]],
  [[1,1],[1],[0],[1],[1],[1],[1],[0],[1],[1],[1],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[1],[0],[0],[0],[0],[0],[1,1]],
  [[1,1],[0],[0],[0],[0],[0],[0],[0],[0],[0],[1],[0],[0],[0],[0],[0],[1],[1],[1],[1],[1],[1],[1],[0],[0],[1],[0],[1],[0],[1],[0],[1,1]],
  [[1,1],[1],[1],[1],[0],[1],[1],[1],[1],[0],[1],[0],[0],[0],[0],[0],[1],[0],[0],[0],[0],[0],[1],[0],[0],[1],[0],[1],[0],[1],[0],[1,1]],
  [[1,1],[0],[0],[1],[0],[1],[0],[0],[1],[0],[1],[1],[1],[1],[1],[1],[1],[0],[1],[1],[1],[0],[1],[0],[0],[1],[0],[1],[0],[1],[0],[1,1]],
  [[1,1],[0],[0],[1],[0],[1],[0],[0],[1],[0],[0],[0],[0],[0],[0],[0],[0],[0],[1],[0],[1],[0],[1],[1],[1],[1],[0],[1],[0],[1],[0],[1,1]],
  [[1,1],[0],[0],[1],[0],[1],[0],[0],[1],[1],[1],[1],[1],[0],[1],[1],[1],[1],[1],[0],[1],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[1,1]],
  [[1,1],[0],[0],[1],[0],[1],[0],[0],[0],[0],[0],[0],[1],[0],[1],[0],[0],[0],[0],[0],[1],[0],[1],[1],[1],[1],[0],[1],[1],[1],[1],[1,1]],
  [[1,1],[0],[0],[1],[0],[1],[0],[0],[0],[0],[0],[0],[1],[0],[1],[1],[1],[1],[1],[1],[1],[0],[1],[0],[0],[1],[0],[1],[0],[0],[0],[1,1]],
  [[1,1],[0],[0],[1],[0],[1],[1],[1],[1],[1],[1],[1],[1],[0],[0],[0],[0],[0],[0],[0],[0],[0],[1],[0],[0],[1],[0],[1],[0],[0],[0],[1,1]],
  [[1,1],[0],[0],[1],[0],[0],[0],[0],[0],[0],[0],[0],[1],[1],[1],[1],[1],[0],[1],[1],[1],[1],[1],[0],[0],[1],[0],[1],[0],[0],[0],[1,1]],
  [[1,1],[0],[0],[1],[0],[1],[1],[1],[1],[1],[1],[0],[0],[0],[0],[0],[1],[0],[1],[0],[0],[0],[0],[0],[0],[1],[0],[1],[0],[0],[0],[1,1]],
  [[1,1],[0],[0],[1],[0],[0],[0],[0],[0],[0],[0],[0],[1],[0],[0],[0],[0],[0],[1],[0],[0],[0],[0],[0],[0],[1],[0],[1],[0],[0],[0],[1,1]],
  [[1,1],[0],[0],[1],[0],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[0],[1],[0],[0],[0],[0],[0],[0],[1],[0],[1],[0],[0],[0],[1,1]],
  [[1,1],[0],[0],[1],[0],[1],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[1],[0],[1],[0],[0],[0],[0],[0],[0],[1],[0],[1],[0],[0],[0],[1,1]],
  [[1,1],[1],[1],[1],[0],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[0],[1],[1],[1],[1],[1],[1],[1],[1],[0],[1],[1],[1],[1],[1,1]],
  [[1,1],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[1],[0],[1,1]],
  [[1,1],[1],[1],[0],[1],[1],[1],[1],[1],[1],[0],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[0],[1],[0],[1],[0],[1,1]],
  [[1,1],[0],[1],[0],[1],[0],[0],[0],[0],[1],[0],[1],[0],[0],[0],[0],[0],[1],[0],[0],[0],[0],[1],[0],[0],[1],[0],[1],[0],[1],[0],[1,1]],
  [[1,1],[0],[1],[0],[0],[0],[0],[0],[0],[1],[0],[1],[0],[0],[0],[0],[0],[1],[0],[0],[1],[0],[1],[0],[0],[1],[0],[1],[0],[1],[0],[1,1]],
  [[1,1],[0],[1],[0],[1],[1],[1],[0],[0],[1],[0],[0],[0],[0],[0],[0],[0],[1],[0],[0],[1],[0],[1],[0],[0],[1],[0],[1],[0],[1],[0],[1,1]],
  [[1,1],[1],[1],[1],[1],[0],[1],[0],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[0],[0],[1],[0],[0],[0],[0],[0],[0],[0],[0],[1],[0],[1,1]],
  [[1,1],[0],[0],[0],[1],[0],[1],[0],[1],[0],[0],[0],[0],[0],[0],[0],[0],[1],[0],[1],[1],[1],[1],[1],[1],[1],[0],[1],[1],[1],[1],[1,1]],
  [[1,1],[0],[2],[0],[0],[0],[1],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[1],[0],[0],[0],[0],[1],[0],[0],[0],[0],[0],[0],[1,1]],
  [[1,1],[0],[0],[0],[1],[0],[0],[0],[1],[0],[0],[0],[0],[0],[0],[0],[0],[1],[0],[1],[0],[0],[0],[0],[1],[0],[0],[0],[0],[0],[0],[1,1]],
  [[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1]]
]

let prev_x = 0;
let prev_y = 0;
function click(ev) {
  let [x, y] = convertCoordinatesEventToGL(ev);
  change_x = x - prev_x;
  if(change_x < 0) {
    cam.panRight(1)
  }
  else if (change_x > 0) {
    cam.panLeft(1)
  }
  change_y = y - prev_y;
  if(change_y < 0) {
    cam.panUp()
  }
  else if(change_y > 0) {
    cam.panDown()
  }
  prev_x = x;
  prev_y = y;
}

function keydown(ev) {
  if(ev.keyCode==68) {
    cam.moveRight()
  }
  else if(ev.keyCode==65) {
    cam.moveLeft()
  }
  else if(ev.keyCode==87) {
    cam.moveForward()
  }
  else if (ev.keyCode==83) {
    cam.moveBackward()
  }
  else if (ev.keyCode==32) {
    cam.moveUp()
  }
  else if (ev.keyCode==16) {
    cam.moveDown()
  }
  else if (ev.keyCode==81) {
    cam.panLeft(5)
  }
  else if (ev.keyCode==69) {
    cam.panRight(5)
  }
  else if (ev.keyCode==71) {
    deleteBlock()
  }
  else if (ev.keyCode==70) {
    placeBlock()
  }
  renderScene();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; 
  var y = ev.clientY; 
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return ([x, y]);
}

function initTextures(index) {
  if(index == 0) {
    var image = new Image();
    if(!image) {
      console.log('Failed to create the image object');
      return false;
    }
    image.onload = function() {sendTextureToGLSL(image);}
    image.src = 'shu.png';
    return true;
  }
  else if(index == 1) {
    var image = new Image();
    if(!image) {
      console.log('Failed to create the image object');
      return false;
    }
    image.onload = function() {sendTextureToGLSL2(image);}
    image.src = 'sky.jpg';
    return true;
  }
}

function sendTextureToGLSL(img) {
    var texture = gl.createTexture();
    if(!texture) {
      console.log('Failed to create the texture object');
      return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.uniform1i(u_Sampler0, 0);
    console.log('finished loadTexture');
}

function sendTextureToGLSL2(image) {
  var texture = gl.createTexture();
  if(!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler1, 1);
  console.log('finished loadTexture2');
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {
  g_seconds = performance.now()/1000.0 - g_startTime;
  renderScene();
  requestAnimationFrame(tick);
}

function drawMap() {
  for(x=0; x<32; x++) {
    for (z=0; z<32; z++){
      for (y=0; y<mapo[x][z].length; y++) {
        if(mapo[x][z][y] == 1) {
          var body = new Cube();
          body.textureNum = 0
          body.color = [0, 1.0, 1.0, 1.0];
          body.matrix.translate(x-16, -0.75, z-16);
          body.matrix.translate(0, y, 0)
          body.renderFaster();
        }
        if(mapo[x][z][y] == 2) {
          var body = new Cube();
          body.textureNum = -2
          body.color = [1.0, 0.84, 0, 1.0];
          body.matrix.translate(x-16, -0.75, z-16);
          body.matrix.translate(0, y, 0)
          body.renderFaster();
        }
      }
    }
  }
}

function deleteBlock() {
  for(x=0; x<32; x++) {
    for (z=0; z<32; z++){
      for (y=0; y<mapo[x][z].length; y++) {
        if(mapo[x][z][y] == 1) {
          var body = new Cube();
          body.textureNum = 0
          body.color = [0, 1.0, 1.0, 1.0];
          body.matrix.translate(x-16, -0.75, z-16);
          body.matrix.translate(0, y, 0)
          if((cam.at.elements[0]+1 >= (x-16) && cam.at.elements[0]-1 <= (x-16)) && (cam.at.elements[2]<=(z-16) && cam.at.elements[2]+5 >= (z-16))) {
            mapo[x][z][y] = 0
          }
          body.renderFaster();
        }
      }
    }
  }
}

function placeBlock() {
  for(x=0; x<32; x++) {
    for (z=0; z<32; z++){
      for (y=0; y<mapo[x][z].length; y++) {
        if(mapo[x][z][y] == 0) {
          var body = new Cube();
          body.textureNum = 0
          body.color = [0, 1.0, 1.0, 1.0];
          body.matrix.translate(x-16, -0.75, z-16);
          body.matrix.translate(0, y, 0)
          if((cam.at.elements[0]+1 >= (x-16) && cam.at.elements[0]-1 <= (x-16)) && (cam.at.elements[2]<=(z-16) && cam.at.elements[2]+5 >= (z-16))) {
            mapo[x][z][y] = 1
          }
          body.renderFaster();
        }
      }
    }
  }
}

function renderScene() {
  var startTime = performance.now();
  var globalRotMat = new Matrix4().rotate(-g_globalAngleY, 0, 1, 0);
  globalRotMat.rotate(g_globalAngleX, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.uniformMatrix4fv(u_ViewMatrix, false, cam.viewMatrix.elements);

  gl.uniformMatrix4fv(u_ProjectionMatrix, false, cam.projectionMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  var floor = new Cube([1,1,1,1]);
  floor.textureNum = 0;
  floor.color = [0.5, 0.5, 0.5, 1.0]
  floor.matrix.translate(0, -0.75, 0);
  floor.matrix.scale(32,0,32);
  floor.matrix.translate(-0.5, 0, -0.5);
  floor.renderFaster();

  var sky = new Cube();
  sky.color = [1, 0, 0, 1];
  sky.textureNum = 1;
  sky.matrix.scale(50, 50, 50);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.renderFaster();

  /*var test = new Cube();
  test.color = [1,0,0,1];
  test.textureNum = 0;
  test.matrix.translate(-1, -0.75, -1)
  test.renderFaster();*/
  drawMap();
  
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}