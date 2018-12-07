// 浮動小数点の精度の設定
precision mediump float;

// JSから渡される変数の定義
uniform vec2 resolution;
uniform vec2 mouse;
uniform vec2 mouseP;
uniform bvec2 mouseDown;
uniform float time;
uniform sampler2D prevScene;

// ------

void main( void ) {
    vec2 uv = gl_FragCoord.xy / resolution; // uvを定義
    vec3 col = vec3( 0.0 ); // 最終出力
    
    if ( 0.9 < uv.y ) { // UI
        col = vec3( 0.75 ); // 背景色
        
        if ( 0.92 < uv.y && uv.y < 0.98 ) {
            if ( 0.05 < uv.x && uv.x < 0.15 ) { // 現在色
                if ( mouseDown.y && 0.92 < mouse.y && mouse.y < 0.98 && 0.20 < mouse.x && mouse.x < 0.95 ) {
                    col = texture2D( prevScene, mouse ).xyz; // マウスがパレット上でクリックされていれば色変更
                } else {
                    col = texture2D( prevScene, uv ).xyz; // そうでなければ現在色を保持
                }
            } else if ( 0.20 < uv.x && uv.x < 0.95 ) { // パレット
                col = ( // 色リスト
                    uv.x < 0.25 ? vec3( 1.00, 0.00, 0.00 ) :
                    uv.x < 0.30 ? vec3( 1.00, 0.50, 0.00 ) :
                    uv.x < 0.35 ? vec3( 1.00, 1.00, 0.00 ) :
                    uv.x < 0.40 ? vec3( 0.00, 1.00, 0.00 ) :
                    uv.x < 0.45 ? vec3( 0.00, 0.50, 0.25 ) :
                    uv.x < 0.50 ? vec3( 0.00, 1.00, 1.00 ) :
                    uv.x < 0.55 ? vec3( 0.00, 0.00, 1.00 ) :
                    uv.x < 0.60 ? vec3( 0.75, 0.25, 0.12 ) :
                    uv.x < 0.65 ? vec3( 0.50, 0.37, 0.00 ) :
                    uv.x < 0.70 ? vec3( 1.00, 0.75, 0.50 ) :
                    uv.x < 0.75 ? vec3( 0.75, 0.00, 0.75 ) :
                    uv.x < 0.80 ? vec3( 0.00, 0.00, 0.00 ) :
                    uv.x < 0.85 ? vec3( 0.50, 0.50, 0.50 ) :
                    uv.x < 0.90 ? vec3( 0.75, 0.75, 0.75 ) :
                    vec3( 1.0, 1.0, 1.0 )
                );
            }
        }
        
    } else { // キャンバス
        if ( mouseDown.y && 0.92 < mouse.y && mouse.y < 0.98 && 0.05 < mouse.x && mouse.x < 0.15 ) {
            col = vec3( 1.0, 1.0, 1.0 ); // 現在色の上でクリックされていればクリア
        } else {
            vec4 back = texture2D( prevScene, uv ); // そうでなければ前の状態を保持
            col = back.xyz; // * 0.99;
        }
        
        if ( mouseDown.x ) { // お絵かき
            float len = 1E9; // マウスまでの距離
            for ( int i = 0; i < 32; i ++ ) { // bruteforce!!
                float k = float( i ) / 32.0;
                vec2 p = mix( mouse, mouseP, k );
                len = min( len, length( uv - p ) );
            }
            
            // マウスまでの距離に応じて上書き描画
            float amp = smoothstep( 0.02, 0.01, len );
            vec3 paintCol = texture2D( prevScene, vec2( 0.1, 0.95 ) ).xyz;
            col = mix( col, paintCol, amp );
        }
    }
    
    gl_FragColor = vec4( col, 1.0 );
}
