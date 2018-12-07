#define PIX 2.0

#define saturate(i) clamp(i,0.,1.)

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

// ディザリング
float dither( vec2 _coord ) {
    vec2 k0 = mod( floor( _coord / 2.0 ), 2.0 );
    float v0 = (
        k0 == vec2( 0.0, 0.0 ) ? 0.0 :
        k0 == vec2( 1.0, 1.0 ) ? 1.0 :
        k0 == vec2( 1.0, 0.0 ) ? 2.0 :
        3.0
    );
    
    vec2 k1 = mod( floor( _coord ), 2.0 );
    float v1 = (
        k1 == vec2( 0.0, 0.0 ) ? 0.0 :
        k1 == vec2( 1.0, 1.0 ) ? 1.0 :
        k1 == vec2( 1.0, 0.0 ) ? 2.0 :
        3.0
    );
    
    return ( v0 + v1 * 4.0 ) / 16.0;
}

// ------

void main() {
    // uv定義
    vec2 p = floor( gl_FragCoord.xy / PIX ); // ピクセル位置
    vec2 uv = ( p * PIX + 0.5 ) / resolution; // uv
    
    float d = dither( p );
    vec4 tex = texture2D( textureLenna, vInvert( uv ) );
    vec3 col = vec3(
        tex.x < d ? 0.0 : 1.0,
        tex.y < d ? 0.0 : 1.0,
        tex.z < d ? 0.0 : 1.0
    );
    
    gl_FragColor = vec4( col, 1.0 );
}
