import { loadFile } from './utils'

export function createShader (gl: WebGLRenderingContext, str: string, type: number) {
  const shader = gl.createShader(type)
  if (shader == null) {
    throw new Error('Can not create shader')
  }
  gl.shaderSource(shader, str)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    let typeStr = 'Shader'
    if (type === gl.VERTEX_SHADER) {
      typeStr = 'Vertex shader'
    } else if (type === gl.FRAGMENT_SHADER) {
      typeStr = 'Fragment shader'
    }
    throw new Error(typeStr + ' compilation error: ' + gl.getShaderInfoLog(shader))
  }
  return shader
}

export class Program {
  public prg: WebGLProgram
  public vSource: string
  public fSource: string

  constructor (buf: WebGLProgram, vSource: string, fSource: string) {
    this.prg = buf
    this.vSource = vSource
    this.fSource = fSource
  }
}

export function createProgram (gl: WebGLRenderingContext, vSource: string, fSource: string): Program {
  const program = gl.createProgram()
  if (program == null) {
    throw new Error('Can not create program')
  }
  const vShader = createShader(gl, vSource, gl.VERTEX_SHADER)
  const fShader = createShader(gl, fSource, gl.FRAGMENT_SHADER)
  gl.attachShader(program, vShader)
  gl.attachShader(program, fShader)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    throw new Error('Shader linkage error: ' + gl.getProgramInfoLog(program))
  }
  return new Program(program, vSource, fSource)
}

export function loadProgram (gl: WebGLRenderingContext, vFileName: string, fFileName: string): Promise<Program> {
  return Promise.all([
    loadFile(vFileName, true),
    loadFile(fFileName, true)
  ]).then(sources => {
    const vStr = sources[0]
    const fStr = sources[1]
    return createProgram(gl, vStr, fStr)
  })
}

export class VertexBuffer {
  public buf: WebGLBuffer
  public len: number

  constructor (buf: WebGLBuffer, len: number) {
    this.buf = buf
    this.len = len
  }
}

export function createVertexBuffer (gl: WebGLRenderingContext, vertices: Float32Array): VertexBuffer {
  const buf = gl.createBuffer()
  if (buf == null) {
    throw new Error('Can not create buffer')
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
  return new VertexBuffer(buf, vertices.length)
}

export class Texture {
  public tex: WebGLTexture
  public arr: Uint8Array
  public width: number
  public height: number

  constructor (tex: WebGLTexture, width: number, height: number, arr: Uint8Array) {
    this.tex = tex
    this.arr = arr
    this.width = width
    this.height = height
  }
}

export function createTexture (gl: WebGLRenderingContext, width: number, height: number): Texture {
  const tex = gl.createTexture()
  if (tex == null) {
    throw new Error('Can not create texture')
  }
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
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, arr)
  return new Texture(tex, width, height, arr)
}
