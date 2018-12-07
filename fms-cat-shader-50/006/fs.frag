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
    // uv定義
    vec2 uv = gl_FragCoord.xy / resolution;
    
    // 波を何個か作る
    float wave1 = sin( uv.x * 10.0 + time * 10.0 );
    float wave2 = sin( length( uv - 0.5 + 0.4 * vec2( sin( time ), sin( time / 0.87 ) ) ) * 16.0 + time * 8.0 );
    float wave3 = sin( ( uv.y * sin( time / 0.43 ) + uv.x * sin( time / 0.74 ) ) * 8.0 + time * 5.0 );
    
    // 波を足し合わせる
    float waveSum = wave1 + wave2 + wave3;
    
    // catColorに波を代入
    vec3 color = vec3( waveSum );
    // color = sqrt( catColor( waveSum ) );
    
    gl_FragColor = vec4( color, 1.0 );
}
