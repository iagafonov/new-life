import '../assets/styles/index.scss'
import { createVertexBuffer, createProgram, createTexture, VertexBuffer, Program, Texture } from './webgl-utils'

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

let dWidth: number
let dHeight: number

const resize = () => {
  dWidth = document.body.clientWidth
  dHeight = document.body.clientHeight
  canvas.setAttribute('width', dWidth.toString())
  canvas.setAttribute('height', dHeight.toString())
  gl.viewport(0, 0, dWidth, dHeight)
}
resize()
window.addEventListener('resize', resize)
let program: Program
let squareVertices: VertexBuffer
let vertexPositionAttribute: number
let viewTexture: Texture

const init = () => {
  gl.clearColor(0.0, 0.06, 0.1, 1.0)
}

const initTextures = () => {
  viewTexture = createTexture(gl, dWidth, dHeight)
}

const initBuffers = () => {
  squareVertices = createVertexBuffer(gl, [
    0, 0,
    0, dHeight,
    dWidth, 0,
    dWidth, dHeight
  ])
}

const initShaders = () => {
  program = createProgram(gl, vShader, fShader)
  gl.useProgram(program.prg)
  gl.uniform2f(gl.getUniformLocation(program.prg, 'uViewport'), dWidth, dHeight)
  vertexPositionAttribute = gl.getAttribLocation(program.prg, 'aVertexPosition')
  gl.enableVertexAttribArray(vertexPositionAttribute)
}

const draw = () => {
  requestAnimationFrame(draw)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertices.buf)
  gl.vertexAttribPointer(vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertices.len / 2)
}

init()
initBuffers()
initTextures()
initShaders()
requestAnimationFrame(draw)
