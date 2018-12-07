precision mediump float;

uniform vec2 resolution;
uniform vec2 mouse;
uniform vec2 mouseDown;
uniform float time;
uniform sampler2D prevScene;

// ------

void main( void ) {
    // uv定義
    vec2 uv = gl_FragCoord.xy / resolution;
    
    // 現在のピクセル状態を取得
    float tex = texture2D( prevScene, uv ).x;
    
    if ( tex == 0.0 ) { // 現在のピクセル状態が0なら
        // 左下のピクセルが1であれば1に
        vec2 puv = uv - vec2( 1.0 ) / resolution;
        float ptex = texture2D( prevScene, puv ).x;
        tex = max( tex, ptex );
        
        // 現在のピクセル上でマウスが押されていれば1に
        if ( mouse + 0.5 / resolution == uv && mouseDown.x == 1.0 ) {
            tex = 1.0;
        }
    }
    
    gl_FragColor = vec4( vec3( tex ), 1.0 );
}
