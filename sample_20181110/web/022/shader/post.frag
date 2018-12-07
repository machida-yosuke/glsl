precision mediump float;
uniform sampler2D texture;    // フレームバッファに描画したレンダリング結果
uniform float     time;       // 時間の経過
uniform vec2      resolution; // スクリーン解像度

const float size = 20.0;      // モザイク模様ひとつあたりのサイズ @@@

void main(){
    // スクリーン座標をサイズで割ってからサイズを掛ける @@@
    vec2 texCoord = floor(gl_FragCoord.st / size) * size;

    // フレームバッファの描画結果をテクスチャから読み出す @@@
    vec4 samplerColor = texture2D(texture, texCoord / resolution);

    // テクスチャの色にノイズの値を掛ける
    gl_FragColor = samplerColor;
}
