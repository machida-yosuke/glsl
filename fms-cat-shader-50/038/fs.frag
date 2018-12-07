precision mediump float;

uniform vec2 resolution;
uniform vec2 mouse;
uniform vec2 mouseDown;
uniform float time;
uniform sampler2D prevScene;

// ------

// 数値を色に変換
vec3 valueToColor( float _i ) {
    return vec3(
        mod( floor( _i ), 256.0 ),
        mod( floor( _i / 256.0 ), 256.0 ),
        floor( _i / 256.0 / 256.0 )
    ) / 255.0;
}

// 色を数値に変換
float colorToValue( vec3 _c ) {
    return (
        _c.x * 255.0 +
        _c.y * 255.0 * 256.0 +
        _c.z * 255.0 * 256.0 * 256.0
    );
}

// ------

void main( void ) {
    // uv定義
    vec2 uv = gl_FragCoord.xy / resolution;
    float value = colorToValue( texture2D( prevScene, uv ).xyz );
    gl_FragColor = vec4( valueToColor( value + uv.x * resolution.x ), 1.0 );
}
