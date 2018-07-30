import { err, loadFile } from './utils'

export function createShader (gl: WebGLRenderingContext, str: string, type: number) {
  const shader = gl.createShader(type)
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
  if (program == null) throw new Error('Can not create program')
  const vShader = createShader(gl, vSource, gl.VERTEX_SHADER)
  const fShader = createShader(gl, fSource, gl.FRAGMENT_SHADER)
  gl.attachShader(program, vShader)
  gl.attachShader(program, fShader)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
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
  }, err)
}

export class VertexBuffer {
  public buf: WebGLBuffer
  public len: number

  constructor (buf: WebGLBuffer, len: number) {
    this.buf = buf
    this.len = len
  }
}

export function createVertexBuffer (gl: WebGLRenderingContext, vertices: Array<number>): VertexBuffer {
  const buf = gl.createBuffer()
  if (buf == null) throw new Error('Can not create buffer')
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
  return new VertexBuffer(buf, vertices.length)
}
