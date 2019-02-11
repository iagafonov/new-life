attribute vec2 aVertexPosition;
attribute vec2 aTextureCoordinate;

uniform vec2 uViewport;

varying vec2 vTextureCoordinate;

void main(void) {
    gl_Position = vec4(((aVertexPosition / uViewport) * 2.0 - 1.0), 0.0, 1.0);
    vTextureCoordinate = aTextureCoordinate;
}
