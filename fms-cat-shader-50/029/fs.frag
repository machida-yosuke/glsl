#define PI 3.14159265
#define saturate(i) clamp(i,0.,1.)

// 浮動小数点の精度の設定
precision mediump float;

// JSから渡される変数の定義
uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;
uniform bool isVert;
uniform sampler2D textureChroma;
uniform sampler2D textureBg;

// ------

// テクスチャロード用にyを逆向きにするやつ
vec2 vInvert( vec2 _uv ) {
    return vec2( 0.0, 1.0 ) + vec2( 1.0, -1.0 ) * _uv;
}

// にじいろ！
vec3 catColor( float _p ) {
    return 0.5 + 0.5 * vec3(
        cos( _p ),
        cos( _p + PI / 3.0 * 2.0 ),
        cos( _p + PI / 3.0 * 4.0 )
    );
}

// アレ
vec3 catWave( vec2 _uv ) {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec2 puv = ( floor( uv * 20.0 ) + 0.5 ) / 20.0;
    float len = length( puv - 0.5 );
    return catColor( len * 20.0 - time * 10.0 );
}

// ------

void main() {
    // uv定義
    vec2 uv = gl_FragCoord.xy / resolution; // ピクセル位置
    vec4 tex = texture2D( textureChroma, vInvert( uv ) );
    
    float key = mix( 1.0, smoothstep( -0.4, 0.0, tex.x + tex.y - tex.z * 2.0 ), mouse.x );
    vec3 col = mix(
        texture2D( textureBg, vInvert( uv ) ).xyz, // catWave( uv ),
        tex.xyz,
        key
    );
    
    gl_FragColor = vec4( col, 1.0 );
}
