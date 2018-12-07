#define V vec2(0.,1.)
#define PI 3.14159265
#define saturate(i) clamp(i,0.,1.)
#define lofi(i,d) floor(i/d)*d

// 浮動小数点の精度の設定
precision mediump float;

// JSから渡される変数の定義
uniform float time;
uniform vec2 resolution;
uniform sampler2D texture;

// ------

// テクスチャロード用にyを逆向きにするやつ
vec2 vInvert( vec2 _uv ) {
    return vec2( 0.0, 1.0 ) + vec2( 1.0, -1.0 ) * _uv;
}

// 距離テクスチャの色を距離数値に変換
float distTexToDist( vec4 _tex ) {
    return _tex.x - _tex.y;
}

// ------

void main() {
    // uvを計算
    vec2 uv = gl_FragCoord.xy / resolution;
    
    // テクスチャを取得
    vec4 tex = texture2D( texture, vInvert( uv ) );
    gl_FragColor = tex;

    // 距離を出して，文字内側であれば白く塗る
    // float dist = distTexToDist( tex );
    // float thr = 0.0;
    // // thr = 0.05 * sin( time * PI );
    // vec3 col = V.yyy * smoothstep( thr - 0.005, thr + 0.005, -dist );
    // gl_FragColor = vec4( col, 1.0 );
}
