#define MARCH_ITER 100
#define INIT_LEN 0.01

#define V vec2(0.,1.)
#define PI 3.14159265
#define saturate(i) clamp(i,0.,1.)
#define lofi(i,d) floor(i/d)*d

// ------

// 浮動小数点の精度の設定
precision mediump float;

// JSから渡される変数の定義
uniform vec2 resolution;
uniform vec2 resoTextureRandom;
uniform sampler2D textureRandom;

// ------

// 指定区間でループするテクスチャ取得
vec4 texF( vec2 _p, float _intrv ) {
    vec4 t00 = texture2D( textureRandom, ( mod( floor( _p + vec2( -0.5, -0.5 ) ) + 0.5, _intrv ) ) / resoTextureRandom );
    vec4 t01 = texture2D( textureRandom, ( mod( floor( _p + vec2( -0.5,  0.5 ) ) + 0.5, _intrv ) ) / resoTextureRandom );
    vec4 t10 = texture2D( textureRandom, ( mod( floor( _p + vec2(  0.5, -0.5 ) ) + 0.5, _intrv ) ) / resoTextureRandom );
    vec4 t11 = texture2D( textureRandom, ( mod( floor( _p + vec2(  0.5,  0.5 ) ) + 0.5, _intrv ) ) / resoTextureRandom );
    return mix(
        mix( t00, t10, fract( _p.x + 0.5 ) ),
        mix( t01, t11, fract( _p.x + 0.5 ) ),
        fract( _p.y + 0.5 )
    );
}

// ノイズの生成
vec3 noise( vec2 _uv ) {
    vec3 ret = vec3( 0.0 );
    
    for ( int i = 1; i < 9; i ++ ) {
        float mul = pow( 2.0, float( i ) );
        float intrv = mul * 4.0;
        ret += texF( _uv * intrv, intrv ).xyz / mul;
    }
    
    return ret;
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    gl_FragColor = vec4( noise( uv ), 1.0 );
}
