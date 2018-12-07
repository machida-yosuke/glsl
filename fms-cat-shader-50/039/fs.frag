precision mediump float;

uniform vec2 resolution;
uniform vec2 mouse;
uniform vec2 mouseP;
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
    
    // posとvelを読み出す
    vec2 pos = vec2(
        colorToValue( texture2D( prevScene, vec2( 0.5, 0.5 ) / resolution ).xyz ),
        colorToValue( texture2D( prevScene, vec2( 1.5, 0.5 ) / resolution ).xyz )
    ) / 65536.0 - 1.0;
    vec2 vel = vec2(
        colorToValue( texture2D( prevScene, vec2( 2.5, 0.5 ) / resolution ).xyz ),
        colorToValue( texture2D( prevScene, vec2( 3.5, 0.5 ) / resolution ).xyz )
    ) / 65536.0 - 1.0;
    
    // 初期化
    if ( pos == vec2( -1.0 ) ) {
        pos = vec2( 0.5 );
        vel = vec2( 0.0 );
    }
    
    // マウスが押されたらボールをワープさせる，離すと投げる
    if ( mouseDown.x == 1.0 ) {
        pos = mouse;
        vel = mouse - mouseP;
    }
    
    // 壁衝突時の処理
    if ( pos.x < 0.0 ) { pos.x = 0.0; vel.x *= -0.7; }
    if ( 1.0 < pos.x ) { pos.x = 1.0; vel.x *= -0.7; }
    if ( pos.y < 0.0 ) { pos.y = 0.0; vel.y *= -0.7; }
    if ( 1.0 < pos.y ) { pos.y = 1.0; vel.y *= -0.7; }
    
    // 位置と速度の更新
    pos += vel;
    vel.y -= 0.001;
    
    if ( gl_FragCoord.xy == vec2( 0.5, 0.5 ) ) {
        gl_FragColor = vec4( valueToColor( ( pos.x + 1.0 ) * 65536.0 ), 1.0 );
    } else if ( gl_FragCoord.xy == vec2( 1.5, 0.5 ) ) {
        gl_FragColor = vec4( valueToColor( ( pos.y + 1.0 ) * 65536.0 ), 1.0 );
    } else if ( gl_FragCoord.xy == vec2( 2.5, 0.5 ) ) {
        gl_FragColor = vec4( valueToColor( ( vel.x + 1.0 ) * 65536.0 ), 1.0 );
    } else if ( gl_FragCoord.xy == vec2( 3.5, 0.5 ) ) {
        gl_FragColor = vec4( valueToColor( ( vel.y + 1.0 ) * 65536.0 ), 1.0 );
    } else {
        float len = length( pos - uv );
        gl_FragColor = vec4(
            vec3( len < 0.1 ? 1.0 : 0.0 ),
            1.0
        );
    }
}
