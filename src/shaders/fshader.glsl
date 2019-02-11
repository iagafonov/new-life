precision mediump float;

uniform sampler2D uImage;

varying vec2 vTextureCoordinate;

void main(void) {
    gl_FragColor = texture2D(uImage, vTextureCoordinate);
}
