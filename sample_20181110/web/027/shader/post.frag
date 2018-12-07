precision highp float;
uniform sampler2D texture;    // フレームバッファに描画したレンダリング結果
uniform float     time;       // 時間の経過
uniform vec2      resolution; // スクリーン解像度 @@@
varying vec2      vTexCoord;  // テクスチャ座標

const   vec4      greenColor = vec4(0.2, 1.0, 0.5, 1.0);

// ホワイトノイズを生成する乱数生成関数
float rnd(vec2 n){
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

// ホワイトノイズを生成する乱数生成関数（その２）
float rnd2(vec2 n){
    float a = 12.9898;
    float b = 78.233;
    float c = 43758.5453;
    float dt= dot(n ,vec2(a, b));
    float sn= mod(dt, 3.14);
    return fract(sin(sn) * c);
}

void main(){
    // スクリーン上の座標（0.0 ~ resolution）を正規化（-1.0 ~ 1.0）する @@@
    vec2 p = (gl_FragCoord.st / resolution) * 2.0 - 1.0;

    // フレームバッファの描画結果をテクスチャから読み出す
    vec4 samplerColor = texture2D(texture, vTexCoord);

    // 簡単なモノクロ化 @@@
    float dest = (samplerColor.r + samplerColor.g + samplerColor.b) / 3.0;

    // ビネット（四隅が暗くなるような演出） @@@
    float vignette = 1.5 - length(p);
    dest *= vignette;

    // ホワイトノイズを生成 @@@
    float noise = rnd(gl_FragCoord.st + mod(time, 10.0));
    dest *= noise * 0.5 + 0.5;

    // ブラウン管モニタのような走査線 @@@
    float scanLine = abs(sin(p.y * 200.0 + time * 5.0)) * 0.5 + 0.5;
    dest *= scanLine;

    // 様々なポストプロセスを乗算して出力する
    gl_FragColor = greenColor * vec4(vec3(dest), 1.0);
}
