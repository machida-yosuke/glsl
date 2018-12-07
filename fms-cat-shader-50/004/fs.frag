#define PI 3.14159265

// 浮動小数点の精度の設定
precision mediump float;

// JSから渡される変数の定義
uniform vec2 resolution;
uniform vec2 mouse;
uniform float time;

// ------

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
    float pSize = 20.0;
    vec2 puv = ( floor( uv * pSize ) + 0.5 ) / pSize;
    float len = length( puv - 0.5 );
    
    // ピクセルの色にcatColorを代入
    gl_FragColor = vec4( catColor( len * 20.0 - time * 10.0 ), 1.0 );
}
