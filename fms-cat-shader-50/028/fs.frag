#define saturate(i) clamp(i,0.,1.)

// 浮動小数点の精度の設定
precision mediump float;

// JSから渡される変数の定義
uniform vec2 resolution;
uniform vec2 mouse;
uniform bool isVert;
uniform sampler2D textureCam;

// ------

// テクスチャロード用にyを逆向きにするやつ
vec2 vInvert( vec2 _uv ) {
    return vec2( 0.0, 1.0 ) + vec2( 1.0, -1.0 ) * _uv;
}

// ------

// 画像にフィルターをかける
vec3 instagram( vec3 _col, vec2 _uv, float _v, float _c ) {
    vec3 col = _col;
    
    col *= mix( 1.0, smoothstep( 1.0, 0.3, length( _uv - 0.5 ) ), _v );
    col = mix(
        col,
        vec3(
            smoothstep( 0.0, 1.0, col.x ),
            smoothstep( 0.0, 1.0, col.y ),
            smoothstep( -0.3, 1.3, col.z )
        ),
        _c
    );
    
    return col;
}

// ------

void main() {
    // uv定義
    vec2 uv = gl_FragCoord.xy / resolution; // ピクセル位置
    vec4 tex = texture2D( textureCam, vInvert( uv ) );
    vec3 col = instagram( tex.xyz, uv, mouse.x, mouse.y );
    
    gl_FragColor = vec4( col, 1.0 );
}
