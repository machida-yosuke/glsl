#define PI 3.14159265

// 浮動小数点の精度の設定
precision mediump float;

// JSから渡される変数の定義
uniform vec2 resolution;
uniform vec2 mouse;
uniform float time;

// ------

float circle( vec2 _uv, vec2 _pos ) {
    return length( _pos - _uv ) < 0.03 ? 1.0 : 0.0;
}

void main() {
    // uv定義
    vec2 uv = gl_FragCoord.xy / resolution;
    
    vec3 col = vec3( 0.0 );
    
    float phase = fract( time );
    
    float pmin = 0.4;
    float pmax = 0.6;
    
    { // linear
        vec2 pos = vec2(
            mix( pmin, pmax, 1.0 - phase ),
            0.2
        );
        col += vec3( 1.0, 1.0, 1.0 ) * circle( uv, pos );
    }
    
    { // cos
        vec2 pos = vec2(
            mix( pmin, pmax, cos( phase * PI ) * 0.5 + 0.5 ),
            0.3
        );
        col += vec3( 1.0, 0.0, 0.5 ) * circle( uv, pos );
    }
    
    { // pow
        vec2 pos = vec2(
            mix( pmin, pmax, 1.0 - pow( phase, 0.5 ) ),
            0.4
        );
        col += vec3( 1.0, 0.5, 0.0 ) * circle( uv, pos );
    }
    
    { // exp
        vec2 pos = vec2(
            mix( pmin, pmax, exp( -phase * 7.0 ) ),
            0.5
        );
        col += vec3( 0.5, 1.0, 0.0 ) * circle( uv, pos );
    }
    
    { // sinexp
        vec2 pos = vec2(
            mix( pmin, pmax, sin( exp( -phase * 7.0 ) * PI ) ),
            0.6
        );
        col += vec3( 0.0, 1.0, 0.5 ) * circle( uv, pos );
    }
    
    { // spring
        vec2 pos = vec2(
            mix( pmin, pmax, cos( phase * 30.0 ) * exp( -phase * 5.0 ) ),
            0.7
        );
        col += vec3( 0.0, 0.5, 1.0 ) * circle( uv, pos );
    }
    
    { // weird pseudo bounce
        vec2 pos = vec2(
            mix( pmin, pmax, 3.7 * abs( sin( 4.0 * phase * exp( 2.0 * phase ) ) ) / exp( 7.0 * phase ) ),
            0.8
        );
        col += vec3( 0.5, 0.0, 1.0 ) * circle( uv, pos );
    }
    
    // ピクセルの色を赤に
    gl_FragColor = vec4( col, 1.0 );
}
