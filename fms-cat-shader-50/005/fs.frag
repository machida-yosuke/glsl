#define PI 3.14159265

// 浮動小数点の精度の設定
precision mediump float;

// JSから渡される変数の定義
uniform vec2 resolution;
uniform vec2 mouse;
uniform float time;
uniform sampler2D textureCat;

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

void main() {
    // 中心からの距離を計算
    vec2 uv = gl_FragCoord.xy / resolution;
    vec2 puv = ( floor( uv * 20.0 ) + 0.5 ) / 20.0;
    float len = length( puv - 0.5 );
    
    // テクスチャ
    float zoom = 0.8 + 0.1 * sin( time * 6.0 );
    vec2 tuv = 0.5 + ( vInvert( uv ) - 0.5 ) / zoom;
    vec4 tex = (
        abs( tuv.x - 0.5 ) < 0.5 && abs( tuv.y - 0.5 ) < 0.5 ?
        texture2D( textureCat, tuv ) :
        vec4( 0.0 )
    );
    
    // 色の決定
    vec3 col = mix(
        catColor( len * 20.0 - time * 10.0 ),
        tex.xyz,
        tex.w
    );
    gl_FragColor = vec4( col, 1.0 );
}
