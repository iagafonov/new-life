attribute vec2 aVertexPosition;

uniform vec2 uViewport;

void main(void) {
    gl_Position = vec4(1.0 - ((aVertexPosition / uViewport) * 2.0), 0.0, 1.0);
}
