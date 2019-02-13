import '../assets/styles/index.scss'
import { BufferInfo, ProgramInfo, createProgramInfo, createBufferInfoFromArrays, setBuffersAndAttributes, setUniforms, drawBufferInfo, createTexture, setTextureFromArray } from 'twgl.js'

const vShader = require('../shaders/vshader.glsl')
const fShader = require('../shaders/fshader.glsl')

const canvas: HTMLCanvasElement = document.createElement('canvas')
document.body.appendChild(canvas)
const ctx = canvas.getContext('webgl')
if (ctx == null) {
  const msg = 'WebGL is not supported by your system'
  document.body.innerText = msg
  throw new Error(msg)
}
const gl: WebGLRenderingContext = ctx
;(window as any).gl = gl

let documentWidth: number
let documentHeight: number

const resize = () => {
  documentWidth = document.body.clientWidth
  documentHeight = document.body.clientHeight
  canvas.setAttribute('width', documentWidth.toString())
  canvas.setAttribute('height', documentHeight.toString())
  gl.viewport(0, 0, documentWidth, documentHeight)
}
resize()
window.addEventListener('resize', resize)

const genMatrix = (width: number, height: number): Uint8Array => {
  const len = width * height
  const arr = new Uint8Array(len * 3)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (x + y * width) * 3
      arr[i] = (x / width) * 256
      arr[i + 1] = (y / height) * 256
      arr[i + 2] = (1 - (x / width)) * 256
    }
  }
  return arr
}

let programInfo: ProgramInfo
let bufferInfo: BufferInfo

const matrixWidth = 1 << 10
const matrixHeight = 1 << 9

const matrixArray = genMatrix(matrixWidth, matrixHeight)
let matrixTexture: WebGLTexture

const init = () => {
  gl.clearColor(0.0, 0.06, 0.1, 1.0)

  programInfo = createProgramInfo(gl, [vShader, fShader])
  gl.useProgram(programInfo.program)

  const dWidth = documentWidth - matrixWidth
  const dHeight = documentHeight - matrixHeight

  const x0 = Math.round(dWidth / 2)
  const x1 = x0 + matrixWidth
  const y0 = Math.round(dHeight / 2)
  const y1 = y0 + matrixHeight

  bufferInfo = createBufferInfoFromArrays(gl, {
    aVertexPosition: {
      numComponents: 2,
      data: new Float32Array([
        x0, y0,
        x0, y1,
        x1, y0,
        x1, y1
      ])
    },
    aTextureCoordinate: {
      numComponents: 2,
      data: new Float32Array([
        0.0, 0.0,
        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0
      ])
    }
  })

  matrixTexture = createTexture(gl, {
    format: gl.RGB,
    src: genMatrix(matrixWidth, matrixHeight),
    width: matrixWidth,
    height: matrixHeight
  })

  setBuffersAndAttributes(gl, programInfo, bufferInfo)
  setUniforms(programInfo, {
    uImage: matrixTexture,
    uViewport: [documentWidth, documentHeight]
  })
}

const draw = () => {
  requestAnimationFrame(draw)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const len = 100
  for (let i = 0; i < len; ++i) {
    matrixArray[Math.ceil(Math.random() * matrixHeight * matrixWidth * 3)] = Math.ceil(Math.random() * 256)
  }
  setTextureFromArray(gl, matrixTexture, matrixArray, {
    format: gl.RGB,
    width: matrixWidth,
    height: matrixHeight
  })
  drawBufferInfo(gl, bufferInfo, gl.TRIANGLE_STRIP)
}

init()
requestAnimationFrame(draw)
