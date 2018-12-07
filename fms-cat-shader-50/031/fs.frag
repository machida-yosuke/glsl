precision mediump float;

uniform vec2 resolution;
uniform vec2 mouse;
uniform float time;
uniform sampler2D prevScene;

// ------

void main( void ) {
    // uv定義
    vec2 uv = gl_FragCoord.xy / resolution;
    
    // 前フレームの内容を保持
    vec4 back = texture2D( prevScene, uv );
    vec3 col = back.xyz; // * 0.9;
    
    // マウスまでの距離に応じて円を描画
    float len = length( uv - mouse );
    float amp = smoothstep( 0.11, 0.1, len );
    col += vec3( 1.0 ) * amp;
    
    gl_FragColor = vec4( col, 1.0 );
}
