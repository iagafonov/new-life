import '../assets/styles/index.scss'
import {createVertexBuffer, createProgram, createTexture, VertexBuffer, Program, Texture} from './webgl-utils'

const vShader = require('../shaders/vshader.glsl')
const fShader = require('../shaders/fshader.glsl')

const canvas: HTMLCanvasElement = document.createElement('canvas')
document.body.appendChild(canvas)
const ctx = canvas.getContext('webgl')
if (ctx == null) {
  const msg = 'WebGL is not supperted by your system'
  document.body.innerText = msg
  throw new Error(msg)
}
const gl: WebGLRenderingContext = ctx
;(window as any).gl = gl

let documentWidth: number
let documentHeight: number

const matrixWidth = 1 << 10
const matrixHeight = 1 << 9

const resize = () => {
  documentWidth = document.body.clientWidth
  documentHeight = document.body.clientHeight
  canvas.setAttribute('width', documentWidth.toString())
  canvas.setAttribute('height', documentHeight.toString())
  gl.viewport(0, 0, documentWidth, documentHeight)
}
resize()
window.addEventListener('resize', resize)

let program: Program
let squareVertices: VertexBuffer
let squareTextureCoordinates: VertexBuffer
let vertexPositionAttribute: number
let viewTexture: Texture

const init = () => {
  gl.clearColor(0.0, 0.06, 0.1, 1.0)
}

const initTextures = () => {
  viewTexture = createTexture(gl, matrixWidth, matrixHeight)
}

const initShaders = () => {
  program = createProgram(gl, vShader, fShader)
  gl.useProgram(program.prg)

  gl.uniform2f(gl.getUniformLocation(program.prg, 'uViewport'), documentWidth, documentHeight)

  const dWidth = documentWidth - matrixWidth
  const dHeight = documentHeight - matrixHeight

  const x0 = Math.round(dWidth / 2)
  const x1 = x0 + matrixWidth
  const y0 = Math.round(dHeight / 2)
  const y1 = y0 + matrixHeight

  squareVertices = createVertexBuffer(gl, new Float32Array([
    x0, y0,
    x0, y1,
    x1, y0,
    x1, y1
  ]))

  vertexPositionAttribute = gl.getAttribLocation(program.prg, 'aVertexPosition')
  gl.enableVertexAttribArray(vertexPositionAttribute)
  gl.vertexAttribPointer(vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0)

  squareTextureCoordinates = createVertexBuffer(gl, new Float32Array([
    0.0, 0.0,
    0.0, 1.0,
    1.0, 0.0,
    1.0, 1.0
  ]))

  const textureCoordinateAttribute = gl.getAttribLocation(program.prg, 'aTextureCoordinate')
  gl.enableVertexAttribArray(textureCoordinateAttribute)
  gl.vertexAttribPointer(textureCoordinateAttribute, 2, gl.FLOAT, false, 0, 0)
}

const draw = () => {
  requestAnimationFrame(draw)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const len = 100
  for (let i = 0; i < len; ++i) {
    viewTexture.arr[Math.ceil(Math.random() * matrixHeight * matrixWidth * 3)] = Math.ceil(Math.random() * 256)
  }
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, viewTexture.width, viewTexture.height, 0, gl.RGB, gl.UNSIGNED_BYTE, viewTexture.arr)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertices.len / 2)
}

init()
initTextures()
initShaders()
requestAnimationFrame(draw)
