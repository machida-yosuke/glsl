precision mediump float;
uniform sampler2D texture;    // フレームバッファに描画したレンダリング結果
uniform float     time;       // 時間の経過
uniform vec2      resolution; // スクリーン解像度

const float size = 20.0;           // モザイク模様ひとつあたりのサイズ
const float halfSize = size * 0.5; // モザイク模様のサイズの半分

void main(){
    // スクリーン座標を均等に分割し範囲を size の領域に限定する（-size / 2 ～ size / 2） @@@
    vec2 p = mod(gl_FragCoord.st, size) - halfSize;

    // ベクトルの長さを測り二値化する @@@
    float len = step(length(p), halfSize - 1.0);
    // アンチエイリアスする場合の例
    // float edge = 1.0 - smoothstep(halfSize - 2.5, halfSize, length(p));
    // len *= edge;

    // スクリーン座標をサイズで割ってからサイズを掛ける
    vec2 texCoord = floor(gl_FragCoord.st / size) * size;

    // フレームバッファの描画結果をテクスチャから読み出す
    vec4 samplerColor = texture2D(texture, texCoord / resolution);

    // テクスチャの色にノイズの値を掛ける
    gl_FragColor = samplerColor * vec4(vec3(len), 1.0);
}
