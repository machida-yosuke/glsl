precision mediump float;
uniform sampler2D texture;    // フレームバッファに描画したレンダリング結果
uniform float     time;       // 時間の経過
uniform vec2      resolution; // スクリーン解像度

const float size = 20.0;           // モザイク模様ひとつあたりのサイズ
const float halfSize = size * 0.5; // モザイク模様のサイズの半分

void main(){
    // スクリーン座標を均等に分割し範囲を size の領域に限定する（-size / 2 ～ size / 2） @@@
    // 除算のあまり
    // gl_FragCoordをsizeでわったあまり
    // size= 20の時
    // 0>20に必ずなる　0-19.9999
    // 0-19.9999 - halfsize => -10 - 9.9999
    vec2 p = mod(gl_FragCoord.st, size) - halfSize;
    // gl_FragColor = vec4(vec2(p) ,0.0, 1.0);
    
    // ベクトルの長さを測り二値化する @@@
    // 0 or 1しか入らない
    float len = step(length(p), halfSize - 1.0);
    gl_FragColor = vec4(len,len ,len, 1.0);
    
    // アンチエイリアスする場合の例
    // 第一引数　最小値　
    // 第二引数　最大値
    // 第三引数　対象になる値
    // return 0 ~ 1
    // もし長さが５なら０
    // もし長さが１０なら１
    // float edge = 1.0 - smoothstep(halfSize - 2.5, halfSize, length(p));
    // len *= edge;

    // スクリーン座標をサイズで割ってからサイズを掛ける
    // vec2 texCoord = floor(gl_FragCoord.st / size) * size;

    // フレームバッファの描画結果をテクスチャから読み出す
    // vec4 samplerColor = texture2D(texture, texCoord / resolution);

    // テクスチャの色にノイズの値を掛ける
    // gl_FragColor = samplerColor * vec4(vec3(len), 1.0);
}
