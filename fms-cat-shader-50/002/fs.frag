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
    // ピクセルの色にcatColorを代入
    gl_FragColor = vec4( catColor( time ), 1.0 );
}
