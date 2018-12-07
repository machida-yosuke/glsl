precision mediump float;

uniform vec2 resolution;
uniform vec2 mouse;
uniform float time;
uniform sampler2D prevScene;
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

void main( void ) {
    // uv定義
    vec2 uv = gl_FragCoord.xy / resolution;
    
    // 前フレームの内容を保持
    vec2 tra = vec2( 0.5 );
    float rot = 0.0; // 0.02;
    float zoom = 1.03;
    vec2 puv = tra + rotate2D( rot ) / zoom * ( uv - 0.5 );
    vec4 back = texture2D( prevScene, puv );
    vec3 col = back.xyz * vec3( 0.9 );
    
    // マウス位置に応じて猫を描画
    vec2 tuv = ( uv - mouse ) * 2.0 + vec2( 0.5, 0.1 );
    vec4 tex = (
        abs( tuv.x - 0.5 ) < 0.5 && abs( tuv.y - 0.5 ) < 0.5 ?
        texture2D( textureCat, vInvert( tuv ) ) :
        vec4( 0.0 )
    );
    col = mix( col, tex.xyz, tex.w );
    
    gl_FragColor = vec4( col, 1.0 );
}
