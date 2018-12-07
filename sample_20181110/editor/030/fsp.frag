precision highp float;
uniform sampler2D texture;         // フレームバッファに描画したレンダリング結果
uniform float     time;            // 時間の経過
uniform vec2      resolution;      // スクリーン解像度
varying vec2      vTexCoord;       // テクスチャ座標
const   int       oct = 8;         // オクターブ
const   float     per = 0.5;       // パーセンテージ
const   float     PI  = 3.1415926; // 円周率

// 補間関数
float interpolate(float a, float b, float x){
    float f = (1.0 - cos(x * PI)) * 0.5;
    return a * (1.0 - f) + b * f;
}
// 乱数生成器
float rnd(vec2 p){
    return fract(sin(dot(p ,vec2(12.9898,78.233))) * 43758.5453);
}
// 乱数生成気（その２）
float rnd2(vec2 n){
    float a = 12.9898;
    float b = 78.233;
    float c = 43758.5453;
    float dt= dot(n ,vec2(a, b));
    float sn= mod(dt, 3.14);
    return fract(sin(sn) * c);
}
// 補間乱数
float irnd(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec4 v = vec4(rnd(vec2(i.x,       i.y      )),
                  rnd(vec2(i.x + 1.0, i.y      )),
                  rnd(vec2(i.x,       i.y + 1.0)),
                  rnd(vec2(i.x + 1.0, i.y + 1.0)));
    return interpolate(interpolate(v.x, v.y, f.x), interpolate(v.z, v.w, f.x), f.y);
}
// 補間乱数をオクターブ分だけ重ね合わせる
float noise(vec2 p){
    float t = 0.0;
    for(int i = 0; i < oct; i++){
        float freq = pow(2.0, float(i));
        float amp  = pow(per, float(oct - i));
        t += irnd(vec2(p.x / freq, p.y / freq)) * amp;
    }
    return t;
}
// シームレスに上下左右を補間してつなげる
float snoise(vec2 p, vec2 q, vec2 r){
    return noise(vec2(p.x,       p.y      )) *        q.x  *        q.y  +
           noise(vec2(p.x,       p.y + r.y)) *        q.x  * (1.0 - q.y) +
           noise(vec2(p.x + r.x, p.y      )) * (1.0 - q.x) *        q.y  +
           noise(vec2(p.x + r.x, p.y + r.y)) * (1.0 - q.x) * (1.0 - q.y);
}

const vec3 RED_COLOR = vec3(0.8, 0.5, 0.1);

void main(){
    // スクリーン上の座標（0.0 ~ resolution）を正規化（-1.0 ~ 1.0）する
    vec2 p = (gl_FragCoord.st / resolution) * 2.0 - 1.0;
    // アスペクト比を計算
    float aspect = resolution.x / resolution.y;
    p.x *= aspect;

    // サイン波を使って波打つラインを描く
    float line = 0.1 / abs(p.y + sin(p.x * 1.0 + time/0.3) * 0.05);
    float line1 = 0.001 / abs(p.y + sin(p.x * 1.0 + time/0.3) * 0.05);
    float line2 = 0.002 / abs(p.y + sin(p.x * 2.0 + time/0.3) * 0.025);
    float line3 = 0.006 / abs(p.y + sin(p.x * 3.0 + time/0.3) * 0.03);
    // gl_FragColor = vec4(vec3(line + line2 + line3), 1.0);
    
    // ノイズ模様を作る
    vec2 rVector = gl_FragCoord.st - vec2(time * 5.0);
    float rNoise = snoise(rVector, gl_FragCoord.st / resolution, resolution);
    vec3 rColor  = RED_COLOR * line * pow(rNoise + 0.25, 5.0);

    // フレームバッファの描画結果をテクスチャから読み出す
    vec4 samplerColor = texture2D(texture, vTexCoord);

    // テクスチャの色にノイズの値を乗算する
    gl_FragColor = samplerColor * vec4(rColor, 1.0);
}
