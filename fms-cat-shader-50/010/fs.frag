// 浮動小数点の精度の設定
precision mediump float;

// JSから渡される変数の定義
uniform vec2 resolution;
uniform vec2 mouse;
uniform float time;
uniform sampler2D textureRandom;
uniform sampler2D textureCat;

// ------

// テクスチャロード用にyを逆向きにするやつ
vec2 vInvert( vec2 _uv ) {
    return vec2( 0.0, 1.0 ) + vec2( 1.0, -1.0 ) * _uv;
}

// 二次元回転行列
mat2 rotate2D( float _t ) {
    return mat2(
        cos( _t ), sin( _t ),
        -sin( _t ), cos( _t )
    );
}

// ノイズの生成
vec3 noise( vec2 _uv ) {
    vec3 ret = vec3( 0.0 );
    
    for ( int i = 1; i < 6; i ++ ) {
        float mul = pow( 2.0, float( i ) );
        ret += texture2D( textureRandom, _uv * mul / 128.0 + 0.5 ).xyz / mul;
    }
    
    return ret;
}

void main() {
    // uv定義
    vec2 uv = gl_FragCoord.xy / resolution;

    // 猫を描画
    float phase = time * 2.0; // + sin( time * 6.0 ) * 0.4;
    vec2 tra = 0.5 + ( noise( phase * vec2( 0.04, 0.09 ) ).xy - 0.5 ) * 4.0;
    float rot = 0.0; // ( noise( phase * vec2( 0.08, 0.07 ) ).x - 0.5 ) * 12.0;
    float scale = 0.4; // noise( phase * vec2( 0.01, 0.13 ) ).x * 2.0;
    vec2 tuv = tra + rotate2D( rot ) / scale * ( uv - 0.5 );
    vec3 ret = (
        abs( tuv.x - 0.5 ) < 0.5 && abs( tuv.y - 0.5 ) < 0.5 ?
        texture2D( textureCat, vInvert( tuv ) ).xyz :
        vec3( 0.0 )
    );
    
    gl_FragColor = vec4( ret, 1.0 );
}
