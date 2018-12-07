precision mediump float;
uniform vec4 globalColor; // グローバルカラー
varying vec4 vColor;      // 頂点シェーダから送られてきた色
void main(){
    // 色同士を掛け合わせて出力
    gl_FragColor = vColor * globalColor;
}
