precision mediump float;
uniform sampler2D texture;    // フレームバッファに描画したレンダリング結果
uniform float     time;       // 時間の経過
uniform vec2      resolution; // スクリーン解像度

const float size = 10.0;      // モザイク模様ひとつあたりのサイズ @@@

void main(){
    // スクリーン座標をサイズで割ってからサイズを掛ける @@@
    // gl_FragCoord 描画してる画面のピクセルの座標原点は左下
    // floor 小数点以下切り捨て
    // テクスチャ座標は0-1だから解像度でわる
    vec2 texCoord = floor(gl_FragCoord.st / size) * size / resolution;
    
    // フレームバッファの描画結果をテクスチャから読み出す @@@
    vec4 samplerColor = texture2D(texture, texCoord);

    // テクスチャの色にノイズの値を掛ける
    gl_FragColor = samplerColor;
}
