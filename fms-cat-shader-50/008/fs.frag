// 浮動小数点の精度の設定
precision mediump float;

// JSから渡される変数の定義
uniform vec2 resolution;
uniform vec2 mouse;
uniform float time;
uniform sampler2D textureRandom;

// ------

void main() {
    // uv定義
    vec2 uv = gl_FragCoord.xy / resolution;

    // 最終出力
    vec3 ret = vec3( 0.0 );

    // ノイズの生成
    for ( int i = 1; i < 6; i ++ ) {
        float mul = pow( 2.0, float( i ) );
        ret += texture2D( textureRandom, uv * mul / 64.0 + 0.5 ).xyz / mul;
    }
    
    gl_FragColor = vec4( ret, 1.0 );
}
