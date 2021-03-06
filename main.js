var gl

function initGL(canvas) {
  try {
    gl = canvas.getContext('webgl')
    gl.viewportWidth = canvas.width
    gl.viewportHeight = canvas.height
  } catch (e) {}
  if (!gl) {
    alert('Tidak bisa menginisialisasi WebGL')
  }
}

function getShader(gl, id) {
  var shaderScript = document.getElementById(id)
  if (!shaderScript) {
    return null
  }
  var str = ''
  var k = shaderScript.firstChild
  while (k) {
    if (k.nodeType == 3) {
      str += k.textContent
    }
    k = k.nextSibling
  }
  var shader
  if (shaderScript.type == 'x-shader/x-fragment') {
    shader = gl.createShader(gl.FRAGMENT_SHADER)
  } else if (shaderScript.type = 'x-shader/x-vertex') {
    shader = gl.createShader(gl.VERTEX_SHADER)
  } else {
    return null
  }
  gl.shaderSource(shader, str)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader))
    return null
  }
  return shader
}

var shaderProgram

function initShaders() {
  var fragmentShader = getShader(gl, 'shader-fs')
  var vertexShader = getShader(gl, 'shader-vs')
  shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, fragmentShader)
  gl.attachShader(shaderProgram, vertexShader)
  gl.linkProgram(shaderProgram)
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Tidak bisa menginisialisasi shaders')
  }
  gl.useProgram(shaderProgram)
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition')
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute)
  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, 'aTextureCoord')
  gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute)
  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, 'uPMatrix')
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, 'uMVMatrix')
  shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler")
}

function handleLoadedTexture(texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
}
var crateTexture

function initTextures() {
  crateTexture = gl.createTexture()
  crateTexture.image = new Image()
  crateTexture.image.onload = function () {
    handleLoadedTexture(crateTexture)
  }
  crateTexture.image.src = 'Crate.jpg';
}
var mvMatrix = mat4.create()
var mvMatrixStack = []
var pMatrix = mat4.create()
//console.log(mvMatrix)
function mvPushMatrix() {
  var copy = mat4.create()
  mat4.copy(copy, mvMatrix)
  mvMatrixStack.push(copy)
}

function mvPopMatrix() {
  if (mvMatrixStack.length == 0) {
    throw "Tumpukan matriks kosong"
  }
  mvMatrix = mvMatrixStack.pop()
}

function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix)
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix)
}

var SVertexPositionBuffer
var SVertexColorBuffer
var cubeVertexPositionBuffer
var cubeVertexTextureCoordBuffer
var cubeVertexIndexBuffer

function matTranslate(mat,x,y,z) {
 for(var i=0; i<mat.length/3; i++) {
   mat[i*3] += x
   mat[i*3 + 1] += y
   mat[i*3 + 2] += z
 }
 return mat
}

function matScale(mat,size) {
 for(var i=0; i<mat.length; i++) mat[i] *= size
 return mat
}

function matRotate(mat,deg,xCore,yCore) {
 degRad = deg * (Math.PI / 180)
 for(var i=0; i<mat.length/3; i++) {
   var x = mat[i*3] - xCore
   var y = mat[i*3+2] - yCore
   mat[i*3] = Math.cos(degRad)*(x) - Math.sin(degRad)*(y) + xCore
   mat[i*3+2] = Math.sin(degRad)*(x) + Math.cos(degRad)*(y) + yCore
 }
 return mat
}

var SVerticesCount = 0
var cubeVerticesCount = 0
var SLetter = []
var cube = []

function initBuffers() {
  SVertexPositionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER,SVertexPositionBuffer)
  SLetter = [
    1, 1, 0,
    -0.5, 1, 0,
    1, 0.6, 0,
    -1, 0.6, 0,

    -1, 0.6, 0,
    -0.5, 0.6, 0,
    -1, 0.2, 0,
    -0.5, -0.2, 0,

    -0.5, -0.2, 0,
    -0.5, 0.2, 0,
    1, -0.2, 0,
    0.5, 0.2, 0,

    0.5, -0.2, 0,
    1, -0.2, 0,
    0.5, -1, 0,
    1, -0.6, 0,

    0.5, -0.6, 0,
    -1, -0.6, 0,
    0.5, -1, 0,
    -1, -1, 0,


 ]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(SLetter), gl.STATIC_DRAW)
  SVerticesCount = SLetter.length / 3
  SVertexPositionBuffer.itemSize = 3
  SVertexPositionBuffer.numItems = SVerticesCount

  SVertexColorBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER,SVertexColorBuffer)
  var color = []
  for (var i=0; i < SVerticesCount; i++) {
    color = color.concat([0.25,0.5,0.75,1])
  }
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(color), gl.STATIC_DRAW)
  SVertexColorBuffer.itemSize = 4
  SVertexColorBuffer.numItems = SVerticesCount

  cubeVertexPositionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer)
  cube = [
      1.0, 1.0, 1.0,
      1.0, -1.0, 1.0,
      -1.0, 1.0, 1.0,
      -1.0, -1.0, 1.0,
      -1.0, -1.0, 1.0,
      1.0, -1.0, 1.0,
      1.0, 1.0, 1.0,
      -1.0, 1.0, 1.0,
      1.0, 1.0, -1.0,
      1.0, -1.0, -1.0,
      -1.0, 1.0, -1.0,
      -1.0, -1.0, -1.0,
      -1.0, -1.0, -1.0,
      1.0, -1.0, -1.0,
      1.0, 1.0, -1.0,
      -1.0, 1.0, -1.0,
      1.0, 1.0, 1.0,
      1.0, 1.0, -1.0,
      1.0, -1.0, 1.0,
      1.0, -1.0, -1.0,
      -1.0, 1.0, 1.0,
      -1.0, 1.0, -1.0,
      -1.0, -1.0, 1.0,
      -1.0, -1.0, -1.0
  ]

  cube = matScale(cube,3)

  cubeVerticesCount = cube.length / 3
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube),gl.STATIC_DRAW)
  cubeVertexPositionBuffer.itemSize = 3
  cubeVertexPositionBuffer.numItems = cubeVerticesCount

  cubeVertexTextureCoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer)
  var textureCoords = [
    // Front face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,

      // Bottom face
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,

      // Left face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0
  ]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW)
  cubeVertexTextureCoordBuffer.itemSize = 2
  cubeVertexTextureCoordBuffer.numItems = 12

  cubeVertexIndexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer)
  var cubeVertexIndices = [
      0, 1, 2, 0, 2, 3,
      4, 5, 6, 4, 6, 7,
      8, 9, 10, 8, 10, 11,
  ]
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW)
  cubeVertexIndexBuffer.itemSize = 1
  cubeVertexIndexBuffer.numItems = 18
  
}

var rS = 0
var rCube = 0

var temp
var last

var xMov = 0.0
var yMov = 0.0
var zMov = 0.25
var turn = [1,1,1]
var lrTurn = 1.0
function letterMove() {

 gl.bindBuffer(gl.ARRAY_BUFFER, SVertexPositionBuffer)
 SLetter = matTranslate(SLetter,turn[0]*0.01, turn[1]*0.01, turn[2]*0.01)
 xMov += (turn[0]*0.01)
 yMov += (turn[1]*0.01)
 zMov += (turn[2]*0.01)
 SLetter = matRotate(SLetter,lrTurn * 1.5, xMov, zMov)
 //console.log(SLetter)
 gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(SLetter), gl.STATIC_DRAW)
}

var point = [0,3,6,9,12,15,18,21,24,27,30,33,36,39,42,45,48,51,54,57]
function collisionDetect() {
 for(var i=0; i<turn.length; i++) {
   for(var k=0; k<point.length; k++) {
     if(Math.abs(SLetter[point[k]+i])>=3) {
       turn[i] *= -1
       lrTurn *= -1
       break
     }
   }
 }
}

function drawScene() {
 //changeCubeColor()
 gl.viewport(0,0,gl.viewportWidth,gl.viewportHeight);
 gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
 mat4.perspective(pMatrix, glMatrix.toRadian(60),gl.viewportWidth / gl.viewportHeight, 0.1, 100.0)
 mat4.identity(mvMatrix)
 mat4.translate(mvMatrix, mvMatrix, [0.0,0.0, -10.0])
 //console.log(SLetter)
 letterMove()
 //console.log(cubeVertexPositionBuffer.numItems)
 collisionDetect()
 gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,SVertexPositionBuffer.itemSize,gl.FLOAT,false,0,0)
 gl.bindBuffer(gl.ARRAY_BUFFER,SVertexColorBuffer)
 gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,SVertexColorBuffer.itemSize,gl.FLOAT,false,0,0)
 gl.drawArrays(gl.TRIANGLE_STRIP,0,SVertexPositionBuffer.numItems)

 mat4.translate(mvMatrix,mvMatrix,[0.0,0,0.0])
 gl.bindBuffer(gl.ARRAY_BUFFER,cubeVertexPositionBuffer)
 gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0)
 gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer)
 gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0)
 gl.activeTexture(gl.TEXTURE0)
 gl.bindTexture(gl.TEXTURE_2D,crateTexture)
 gl.uniform1i(shaderProgram.samplerUniform, 0);

 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer)
 setMatrixUniforms()
 gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

var lastTime = 0
function animate() {
 var timeNow = new Date().getTime()
 if(lastTime != 0) {
   var elapsed = timeNow - lastTime
   rS += (90 * elapsed) / 1000.0
   rCube += (75 * elapsed) / 1000.0
 }
 lastTime = timeNow
}

function tick() {
    requestAnimationFrame(tick)
    drawScene()
    animate()
}

function webGLStart() {
    var canvas = document.getElementById('mycanvas')
    initGL(canvas)
    initShaders()
    initBuffers()
    initTextures()
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.enable(gl.DEPTH_TEST)
    tick()
}

