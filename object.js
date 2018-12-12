function ObjectGen(GL,shader){
    var gl = GL
    this.gl = gl
  
    this.shaderProgram = shader.getShaderProgram()
    var shaderProgram = this.shaderProgram
    var SVertexPositionBuffer
    var SVertexColorBuffer
    var cubeVertexPositionBuffer
    var cubeVertexNormalBuffer
    var cubeTextureCoordBuffer
    var cubeVertexIndexBuffer
    
    function matRotate(matrix,degree,xCenter,yCenter,xColumnIndex,yColumnIndex,x_speed,y_speed){
      var cos_t = Math.cos(degree)
      var sin_t = Math.sin(degree)
      for(var i = 0; i < matrix.length; i+=3){
        var x = matrix[i+xColumnIndex] - xCenter
        var y = matrix[i+yColumnIndex] - yCenter
        matrix[i+xColumnIndex] = x*cos_t - y*sin_t + xCenter
        matrix[i+yColumnIndex] = x*sin_t + y*cos_t + yCenter
      }
      var sx = x_speed
      var sy = y_speed
      x_speed = sx*cos_t - sy*sin_t
      y_speed = sx*sin_t + sy*cos_t
    }
    
    function matTranslate(object){
      
      object.x+=object.x_speed
      object.y+=object.y_speed
      object.z+=object.z_speed
      for(var i=0;i<object.positions.length;i+=3){
        object.positions[i]+=object.x_speed
        object.positions[i+1]+=object.y_speed
        object.positions[i+2]+=object.z_speed
      }
    }
    
    function randNumber(low,high){
      return (Math.random() * (high - low) + low)
    }
  
    function handleLoadedTexture(textures) {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
      // Sampler 1
      gl.bindTexture(gl.TEXTURE_2D, textures[0])
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures[0].image)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
      // Sampler 2
      gl.bindTexture(gl.TEXTURE_2D, textures[1])
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures[1].image)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      // Sampler 3
      gl.bindTexture(gl.TEXTURE_2D, textures[2])
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures[2].image)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST)
      gl.generateMipmap(gl.TEXTURE_2D)
  
      gl.bindTexture(gl.TEXTURE_2D, null)
    }
  
    var crateTextures = Array()
    this.crateTextures = crateTextures
    function initTexture () {
      var crateImage = new Image()
      for (var i = 0; i < 3; i++) {
        var texture = gl.createTexture()
        texture.image = crateImage
        crateTextures.push(texture)
      }
      crateImage.onload = function () {
        handleLoadedTexture(crateTextures)
      }
      crateImage.src = 'Crate.jpg'
    }
  
    initTexture()
  
    var attrs = this
    var SLetter = {
      positions:[],colors:[],
      x:0.0,y:0.0,z:0.0,
      x_speed:0.0,y_speed:0.0,z_speed:0.0,
      rot:true,
      vec:[1,1,0]
    }
    SLetter.positions = [
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
  
    SLetter.x =-0.375       
    SLetter.y = -0.125
    SLetter.z = -1.1
    SLetter.yRotation = 0
  
    SLetter.updatePosition = function(){
      this.x+=this.x_speed
      this.y+=this.y_speed
      this.z+=this.z_speed
    }
  
    SLetter.collisionDetection = function(){
      var positions = this.positions
      for(var i=0;i<positions.length;i+=3){
        if(positions[i] <= -1.5 && this.x_speed < 0.0){
          this.rot = !this.rot
          return {collide:"left"}
        }
        else if(positions[i] >= 1.5 && this.x_speed > 0.0){
          this.rot = !this.rot
          return {collide:"right"}
        }
        else if(positions[i+1] <= -1.5 && this.y_speed < 0.0){
          this.rot = !this.rot
          return {collide:"bottom"}
        }
        else if(positions[i+1] >= 1.5 && this.y_speed > 0.0){
          this.rot = !this.rot
          return {collide:"top"}
        }
        else if(positions[i+2] <= -1.5 && this.z_speed < 0.0){
          this.rot = !this.rot
          return {collide:"back"}
        }
        else if(positions[i+2] >= 1.5 && this.z_speed > 0){
          this.rot = !this.rot
          return {collide:"front"}
        }
      }
      return {collide:"none"}
    }
    
    var cube = {positions:[],colors:[],x:0.0,y:0.0,z:0.0,x_speed:0.0,y_speed:0.0,z_speed:0.0,vec:[1.0,0.0,1.0]}
  
    SLetter.x_speed = randNumber(-0.008,0.008)
    SLetter.y_speed = randNumber(-0.008,0.008)
    SLetter.z_speed = randNumber(-0.008,0.008)
    
    cube.positions = [
      //back
      -1.5,-1.5,-1.5,
      1.5,-1.5,-1.5,
      1.5,1.5,-1.5,
      -1.5,1.5,-1.5,
      //left
      -1.5,-1.5,1.5,
      -1.5,-1.5,-1.5,
      -1.5,1.5,-1.5,
      -1.5,1.5,1.5,
      //bottom
      1.5,-1.5,-1.5,
      1.5,-1.5,1.5,
      -1.5,-1.5,1.5,
      -1.5,-1.5,-1.5,
    ]
    cube.z = 0
  
    
    this.initBuffers = function() {
      SVertexPositionBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, SVertexPositionBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(SLetter.positions), gl.STATIC_DRAW)
      SVertexPositionBuffer.itemSize = 3
      SVertexPositionBuffer.numItems = SLetter.positions.length/3
      SVertexColorBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, SVertexColorBuffer)
      SLetter.colors = []
      for (var i=0; i < SVertexPositionBuffer.numItems; i++) {
        SLetter.colors = SLetter.colors.concat([232, 69, 4, 1.0])
      }
      SVertexColorBuffer.itemSize = 4
      SVertexColorBuffer.numItems = 18
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(SLetter.colors), gl.STATIC_DRAW)
      gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, SVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0)
  
  
      // shaderManager = this.shaderManager.getAndSwitchShader('texture-shader')
  
      cubeVertexPositionBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.positions), gl.STATIC_DRAW)
      cubeVertexPositionBuffer.itemSize = 3
      cubeVertexPositionBuffer.numItems = cube.positions.length/3
      
      cubeTextureCoordBuffer = gl.createBuffer()
  
      gl.bindBuffer(gl.ARRAY_BUFFER, cubeTextureCoordBuffer)
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
      cubeTextureCoordBuffer.itemSize = 2
      cubeTextureCoordBuffer.numItems = 12
  
      // Cube Indices
      cubeVertexIndexBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer)
      var cubeVertexIndices = [
        0, 1, 2, 0, 2, 3,    // Front face
        4, 5, 6, 4, 6, 7,    // Back face
        8, 9, 10, 8, 10, 11  // Top face
      ]
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW)
      cubeVertexIndexBuffer.itemSize = 1
      cubeVertexIndexBuffer.numItems = 18
  
  
      // Cube Normals
      cubeVertexNormalBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer)
      var vertexNormals = [
        // Left face
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        
        // Bottom face
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        
        // Back face
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0
      ]
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW)
      cubeVertexNormalBuffer.itemSize = 3
      cubeVertexNormalBuffer.numItems = vertexNormals.length/3
  
      attrs.SVertexPositionBuffer = SVertexPositionBuffer
      attrs.SVertexColorBuffer = SVertexColorBuffer
  
      attrs.cubeVertexPositionBuffer = cubeVertexPositionBuffer
      attrs.cubeTextureCoordBuffer = cubeTextureCoordBuffer
      attrs.cubeVertexIndexBuffer = cubeVertexIndexBuffer
      attrs.cubeVertexNormalBuffer = cubeVertexNormalBuffer
  
      attrs.SLetter = SLetter
      attrs.cube = cube
    }
  
    this.update = function(){
  
      var collision = SLetter.collisionDetection().collide
      if(collision != "none"){
        switch(collision){
          case "left":
          case "right":
            SLetter.x_speed*=-1       
            break
          case "top":
          case "bottom":
            SLetter.y_speed*=-1       
            break
          case "front":
          case "back":
            SLetter.z_speed*=-1       
            break
        }
      }
  
      matTranslate(SLetter)
      matRotate(SLetter.positions,toRadians(
        SLetter.rot?1:-1
      ),SLetter.x,SLetter.z,0,2,SLetter.x_speed,SLetter.y_speed)
      SLetter.yRotation+=SLetter.rot?1:-1
    }
  }