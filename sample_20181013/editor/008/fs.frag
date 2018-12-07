precision mediump float;

// 頂点シェーダから送られてくる色 @@@
varying vec3 vColor;

void main(){
    gl_FragColor = vec4(vColor, 1.0);
}
