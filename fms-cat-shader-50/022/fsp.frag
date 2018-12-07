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

// にじいろ！
vec3 catColor( float _phase ) {
    return 0.5 + 0.5 * vec3(
        cos( _phase ),
        cos( _phase - PI / 3.0 * 2.0 ),
        cos( _phase - PI / 3.0 * 4.0 )
    );
}

void main() {
    // uvを計算
    vec2 uv = gl_FragCoord.xy / resolution;
    
    // テクスチャを取得，距離を出す
    vec4 tex = texture2D( texture, vInvert( uv ) );
    float len = distTexToDist( tex );
    
    // 距離に応じて虹色にする
    vec3 col = mix(
        V.yyy,
        catColor( lofi( len * 20.0 - time * 20.0, 1.0 ) ),
        smoothstep( -0.01, 0.01, len )
    );
    
    gl_FragColor = vec4( col, 1.0 );
}
