precision highp float;          // 頂点シェーダと uniform を共有するために highp にする @@@
uniform vec4      globalColor;  // グローバルカラー
uniform sampler2D textureUnit0; // テクスチャユニット
uniform sampler2D textureUnit1; // テクスチャユニット
uniform float     time;         // 時間の経過 @@@
varying vec4      vColor;       // 頂点シェーダから送られてきた色
varying vec2      vTexCoord;    // 頂点シェーダから送られてきたテクスチャ座標
void main(){
    // テクスチャから色を読み出し利用する
    vec4 samplerColor0 = texture2D(textureUnit0, vTexCoord);
    vec4 samplerColor1 = texture2D(textureUnit1, vTexCoord);

    // sin を使って状態を二値化する @@@
    float t0 = step(0.0, sin(time));
    float t1 = 1.0 - t0;

    // 二値化したフラグを用いて出力する色を決める @@@
    vec4 dest = samplerColor0 * t0 + samplerColor1 * t1;

    gl_FragColor = vColor * dest * globalColor;
}
