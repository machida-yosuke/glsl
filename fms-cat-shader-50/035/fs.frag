precision mediump float;

uniform vec2 resolution;
uniform vec2 mouse;
uniform float time;
uniform sampler2D prevScene;
uniform sampler2D textureCat;
uniform sampler2D textureRandom;

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

void main( void ) {
    // uv定義
    vec2 uv = gl_FragCoord.xy / resolution;
    
    // 前フレームの内容を保持
    vec2 tra = 0.5 + vec2( sin( time ), cos( time ) ) * 0.02;
    float rot = 0.04 * sin( time * 2.1 );
    float zoom = 1.02;
    vec2 puv = tra + rotate2D( rot ) / zoom * ( uv - 0.5 );
    puv.x += sin( uv.y * 20.0 + time * 10.0 ) * 0.02;
    vec4 back = texture2D( prevScene, puv );
    vec3 col = back.xyz * vec3( 0.999, 0.97, 0.99 ) * ( 0.8 + mouse.y * 0.3 );
    
    // 猫を描画
    float phase = time * 3.0;
    vec2 ttra = 0.5 + ( noise( phase * vec2( 0.04, 0.09 ) ).xy - 0.5 ) * 6.0;
    float trot = ( noise( phase * vec2( 0.08, 0.07 ) ).x - 0.5 ) * 12.0;
    float scale = noise( phase * vec2( 0.01, 0.13 ) ).x * 1.0;
    vec2 tuv = mix(
        0.5 + ( uv - 0.5 ) / 0.7,
        ttra + rotate2D( trot ) / scale * ( uv - 0.5 ),
        mouse.x
    );
    vec4 tex = (
        abs( tuv.x - 0.5 ) < 0.5 && abs( tuv.y - 0.5 ) < 0.5 ?
        texture2D( textureCat, vInvert( tuv ) ) :
        vec4( 0.0 )
    );
    col = mix( col, 1.0 - tex.xyz, tex.w );
    
    gl_FragColor = vec4( col, 1.0 );
}
