function Scene(obj) {
    var obj = obj
    var gl = obj.gl
    var mvMatrix = mat4.create()
    var pMatrix = mat4.create()
  
    this.mvMatrix = mvMatrix
    this.pMatrix = pMatrix
  
    this.obj = obj
    var shaderProgram = obj.shaderProgram
    this.shaderProgram = shaderProgram
  
    function setMatrixUniforms(shaderProgram,n) {
      gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix)
      gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix)  
    }
    
    this.defaultDrawScene = function(){
  
      gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);
      gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute)
      gl.vertexAttrib4f(shaderProgram.vertexColorAttribute, 1, 1, 1, 1);
  
      gl.bindBuffer(gl.ARRAY_BUFFER, obj.cubeVertexPositionBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.cube.positions), gl.STATIC_DRAW)
      gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, obj.cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0)
  
      gl.bindBuffer(gl.ARRAY_BUFFER, obj.cubeTextureCoordBuffer)
      gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, obj.cubeTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0)
  
      
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, obj.crateTextures[2])
      gl.uniform1i(shaderProgram.samplerUniform, 0)
  
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.cubeVertexIndexBuffer)
      setMatrixUniforms(shaderProgram)
  
      gl.drawElements(gl.TRIANGLES, obj.cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0)
      
      let whiteTex = gl.createTexture();
      gl.disableVertexAttribArray(shaderProgram.textureCoordAttribute);
      gl.bindTexture(gl.TEXTURE_2D, whiteTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([1, 1, 1, 1]));
  
      
      gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
      gl.bindBuffer(gl.ARRAY_BUFFER, obj.SVertexPositionBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.SLetter.positions), gl.STATIC_DRAW)
      gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, obj.SVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0)
  
      setMatrixUniforms(shaderProgram)
      gl.drawArrays(gl.TRIANGLES, 0, obj.SVertexPositionBuffer.numItems)
  
    }
  
  
    this.setGlViewPort = function(sx,sy,w,h){
      gl.viewport(sx,sy,w,h)
    }
    //please override this  
    this.drawScene = function(sx,sy,w,h){
      this.setGlViewPort(sx,sy,w,h)
      this.defaultDrawScene()
    }
  
  }