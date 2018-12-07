precision highp float;          // 頂点シェーダと uniform を共有するために highp にする
uniform vec4      globalColor;  // グローバルカラー
uniform sampler2D textureUnit0; // テクスチャユニット
uniform sampler2D textureUnit1; // テクスチャユニット
uniform float     time;         // 時間の経過
uniform vec2      mouse;        // マウスカーソル正規化済み座標 @@@
varying vec4      vColor;       // 頂点シェーダから送られてきた色
varying vec2      vTexCoord;    // 頂点シェーダから送られてきたテクスチャ座標
void main(){
    // テクスチャから色を読み出し利用する
    vec4 samplerColor0 = texture2D(textureUnit0, vTexCoord);
    vec4 samplerColor1 = texture2D(textureUnit1, vTexCoord);

    // テクスチャ座標（0.0 ~ 1.0）を変換して -1.0 ～ 1.0 にする @@@
    vec2 p = vTexCoord * 2.0 - 1.0;
    // 変換した値とマウスカーソルの位置ベクトルとの距離を測る @@@
    float len = length(p - mouse);
    // 距離が 0.5 より小さい場合とそれ以外で出力カラーを分ける @@@
    float t1 = step(len, 0.5);
    float t0 = 1.0 - t1;
    vec4 dest = samplerColor0 * t0 + samplerColor1 * t1;
    gl_FragColor = vColor * dest * globalColor;
}
