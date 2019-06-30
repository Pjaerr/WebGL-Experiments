const canvas = document.getElementById('canvas');

/** @type {WebGLRenderingContext} */
const gl = canvas.getContext('webgl');

//Shaders

/* 
    * What is a Vertex Shader?
    Each time a shape is rendered, the vertex shader is run for each vertex in the shape. 
    Its job is to transform the input vertex from its original coordinate system into the 
    clipspace coordinate system used by WebGL, in which each axis has a range from -1.0 to 1.0, 
    regardless of aspect ratio, actual size, or any other factors.

    The vertex shader must perform the needed transforms on the vertex's position, make any other 
    adjustments or calculations it needs to make on a per-vertex basis, then return the transformed 
    vertex by saving it in a special variable provided by GLSL, called gl_Position.

    * What does the Vertex Shader below do?
    Our vertex shader below receives vertex position values from an attribute we define called 
    aVertexPosition. That position is then multiplied by two 4x4 matrices we provide called 
    uProjectionMatrix and uModelViewMatrix; gl_Position is set to the result.
*/
const vertexShader = `
    attribute vec4 aVertexPosition;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
`;

/* 
    * What is a Fragment Shader?
    The fragment shader is called once for every pixel on each shape to be drawn, after the shape's 
    vertices have been processed by the vertex shader. Its job is to determine the color of that 
    pixel by figuring out which texel (that is, the pixel from within the shape's texture) to apply 
    to the pixel, getting that texel's color, then applying the appropriate lighting to the color. 
    The color is then returned to the WebGL layer by storing it in the special variable gl_FragColor. 
    That color is then drawn to the screen in the correct position for the shape's corresponding pixel.

    * What does the Fragment Shader below do?
    In this case, we're simply returning white every time, since we're just drawing a white square, 
    with no lighting in use.
*/
const fragmentShader = `
    void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
`;

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {string} vertexShaderSource
 * @param {string} fragmentShaderSource
 */
function initShaderProgram(gl, vertexShaderSource, fragmentShaderSource) {
  const vertexShader = loadShaders(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = loadShaders(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  //Create the shader program, attaching the vertex/fragment shaders and linking the program
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    const error = `Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`;
    console.error(error);
    throw new Error(error);
  }

  return shaderProgram;
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {string} type
 * @param {string} source
 */
function loadShaders(gl, type, source) {
  const shader = gl.createShader(type);

  //Send the source to the shader object
  gl.shaderSource(shader, source);

  //Compile the shader program
  gl.compileShader(shader);

  //See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = `An error occured compiling the shaders: ${gl.getShaderInfoLog(shader)}`;
    console.error(error);
    gl.deleteShader(shader);
    throw new Error(error);
  }

  return shader;
}

/**
 *
 * @param {WebGLRenderingContext} gl
 */
function initBuffers(gl) {
  const positionBuffer = gl.createBuffer();

  //Tell WebGL that any operations from here on out apply to our positionBuffer
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  //Create an Array for a square
  const positions = [-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0];

  //Pass our list of positions to WebGL to be put into the positionBuffer
  //! Note how we need to tell WebGL the type of our array (FLoat32),
  //! this is because JavaScript isn't a statically typed language.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return {
    position: positionBuffer
  };
}

//Initialise the shader program
const shaderProgram = initShaderProgram(gl, vertexShader, fragmentShader);

//Store the global/uniform variables that WebGL assigned to our inputs
const programInfo = {
  program: shaderProgram,
  attribLocations: {
    vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition')
  },
  uniformLocations: {
    projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
    modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix')
  }
};
