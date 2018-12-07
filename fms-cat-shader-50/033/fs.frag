#define PI 3.14159265

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

// 二次元回転行列
mat2 rotate2D( float _t ) {
    return mat2(
        cos( _t ), sin( _t ),
        -sin( _t ), cos( _t )
    );
}

// にじいろ！
vec3 catColor( float _p ) {
    return 0.5 + 0.5 * vec3(
        cos( _p ),
        cos( _p + PI / 3.0 * 2.0 ),
        cos( _p + PI / 3.0 * 4.0 )
    );
}

// ------

void main( void ) {
    vec2 uv = gl_FragCoord.xy / resolution; // uvを定義
    vec3 col = vec3( 0.0 ); // 最終出力
    
    col = texture2D( prevScene, uv ).xyz;
        
    if ( mouseDown.x ) { // お絵かき
        float len = 1E9; // マウスまでの距離
        for ( int i = 0; i < 32; i ++ ) { // bruteforce!!
            float k = float( i ) / 32.0;
            vec2 p = mix( mouse, mouseP, k );
            
            for ( int iSym = 0; iSym < 6; iSym ++ ) {
                vec2 puv = rotate2D( float( iSym ) * PI / 3.0 ) * ( uv - 0.5 );
                len = min( len, length( 0.5 + puv - p ) );
                len = min( len, length( 0.5 + puv * vec2( -1.0, 1.0 ) - p ) );
            }
        }
        
        // マウスまでの距離に応じて上書き描画
        float amp = smoothstep( 0.005, 0.001, len );
        col = mix( col, catColor( time ), amp );
    }
    
    gl_FragColor = vec4( col, 1.0 );
}
