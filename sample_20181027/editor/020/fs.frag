precision mediump float;
uniform vec4      globalColor; // グローバルカラー
uniform sampler2D textureUnit; // テクスチャユニット
varying vec4      vColor;      // 頂点シェーダから送られてきた色
void main(){
    // テクスチャから色を読み出し利用する @@@
    vec4 samplerColor = texture2D(textureUnit, gl_PointCoord.st);
    gl_FragColor = vColor * samplerColor * globalColor;
}
