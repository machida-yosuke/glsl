#define PI 3.14159265
#define SAMPLES 80

// ------

// 浮動小数点の精度の設定
precision mediump float;

// JSから渡される変数の定義
uniform vec2 resolution;
uniform vec2 mouse;
uniform bool isVert;
uniform sampler2D textureLenna;

// ------

// テクスチャロード用にyを逆向きにするやつ
vec2 vInvert( vec2 _uv ) {
    return vec2( 0.0, 1.0 ) + vec2( 1.0, -1.0 ) * _uv;
}

// ガウス関数
float gaussian( float _x, float _v ) {
    return 1.0 / sqrt( 2.0 * PI * _v ) * exp( - _x * _x / 2.0 / _v );
}

// ------

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    uv = isVert ? vInvert( uv ) : uv;
    vec2 bv = ( isVert ? vec2( 0.0, 1.0 ) : vec2( 1.0, 0.0 ) ) / resolution;
    float gaussVar = mouse.x * 400.0 + 1.0;
    
    vec3 sum = vec3( 0.0 );
    for ( int i = -SAMPLES; i <= SAMPLES; i ++ ) {
        vec3 tex = texture2D( textureLenna, uv + bv * float( i ) ).xyz;
        float mul = gaussian( float( i ), gaussVar );
        sum += tex * mul;
    }

  gl_FragColor = vec4( sum, 1.0 );
}
