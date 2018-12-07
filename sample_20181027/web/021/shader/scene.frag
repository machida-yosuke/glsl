precision mediump float;
uniform vec4      globalColor; // グローバルカラー
uniform sampler2D textureUnit; // テクスチャユニット
varying vec2      vTexCoord;   // 頂点シェーダから送られてきたテクスチャ座標
void main(){
    // テクスチャから色を読み出し利用する
    vec4 samplerColor = texture2D(textureUnit, vTexCoord);
    gl_FragColor = samplerColor * globalColor;
}
