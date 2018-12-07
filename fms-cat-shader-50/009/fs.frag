// 浮動小数点の精度の設定
precision mediump float;

// JSから渡される変数の定義
uniform vec2 resolution;
uniform vec2 mouse;
uniform float time;
uniform sampler2D textureRandom;

// ------

vec3 noise( vec2 _uv ) {
    vec3 ret = vec3( 0.0 );
    
    // ノイズの生成
    for ( int i = 1; i < 6; i ++ ) {
        float mul = pow( 2.0, float( i ) );
        ret += texture2D( textureRandom, _uv * mul / 128.0 + 0.5 ).xyz / mul;
    }
    
    return ret;
}

void main() {
    // uv定義
    vec2 uv = gl_FragCoord.xy / resolution;

    // ノイズを出す
    vec3 ret = noise( uv + time * vec2( 0.04, 0.09 ) );
    
    // ノイズをさらに足す
    ret += noise( uv + time * vec2( 0.14, 0.08 ) );
    ret += noise( uv + time * vec2( 0.07, 0.02 ) );
    ret += noise( uv + time * vec2( 0.21, 0.16 ) );
    ret = ret * 0.25;
    
    // 空にする
    ret = mix(
        vec3( 0.2, 0.6, 0.9 ),
        vec3( 0.9, 0.9, 0.9 ),
        smoothstep( 0.45, 0.55, ret ).x
    );
    
    gl_FragColor = vec4( ret, 1.0 );
}
