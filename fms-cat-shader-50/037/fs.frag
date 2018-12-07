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
    
    // マウス位置が0.1より下なら動作
    if ( mouse.y < 0.1 ) {
        // 周囲のピクセルの1の数を取得
        float count = 0.0;
        for ( int iy = -1; iy <= 1; iy ++ ) {
            for ( int ix = -1; ix <= 1; ix ++ ) {
                if ( ix == 0 && iy == 0 ) { continue; } // 現在のピクセルはスキップ
                vec2 puv = uv + vec2( float( ix ), float( iy ) ) / resolution;
                float ptex = texture2D( prevScene, puv ).x;
                count += ptex;
            }
        }
        
        if ( tex == 0.0 ) { // 現在のピクセル状態が0なら
            tex = count == 3.0 ? 1.0 : 0.0; // 周囲のピクセルの1が3つなら「誕生」
        } else { // 現在のピクセル状態が1なら
            tex = 2.0 <= count && count <= 3.0 ? 1.0 : 0.0; // 周囲のピクセルの1が2-3つなら「生存」
        }
    } else {
        // 現在のピクセル上でマウスが押されていれば1に
        if ( mouse + 0.5 / resolution == uv && mouseDown.x == 1.0 ) {
            tex = 1.0;
        }
    }
    
    vec3 col = vec3( tex );
    
    // uvが0.1より下なら動作位置を表示（ライフゲームの動作に影響するのは赤成分のみ）
    if ( uv.y < 0.1 ) {
        col += mouse.y < 0.1 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 0.0, 1.0, 0.0 );
    }
    
    gl_FragColor = vec4( col, 1.0 );
}
