#define KSK 1.1

precision mediump float;

uniform vec2 resolution;
uniform vec4 keyState;
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
    
    // 各種変数を読み出す
    float p1y = colorToValue( texture2D( prevScene, vec2( 0.5, 0.5 ) / resolution ).xyz ) / 65536.0 - 1.0;
    float p2y = colorToValue( texture2D( prevScene, vec2( 1.5, 0.5 ) / resolution ).xyz ) / 65536.0 - 1.0;
    float p1score = colorToValue( texture2D( prevScene, vec2( 2.5, 0.5 ) / resolution ).xyz );
    float p2score = colorToValue( texture2D( prevScene, vec2( 3.5, 0.5 ) / resolution ).xyz );
    vec2 ballPos = vec2(
        colorToValue( texture2D( prevScene, vec2( 4.5, 0.5 ) / resolution ).xyz ) / 65536.0 - 1.0,
        colorToValue( texture2D( prevScene, vec2( 5.5, 0.5 ) / resolution ).xyz ) / 65536.0 - 1.0
    );
    vec2 ballVel = vec2(
        colorToValue( texture2D( prevScene, vec2( 6.5, 0.5 ) / resolution ).xyz ) / 65536.0 - 1.0,
        colorToValue( texture2D( prevScene, vec2( 7.5, 0.5 ) / resolution ).xyz ) / 65536.0 - 1.0
    );
    float fx = colorToValue( texture2D( prevScene, vec2( 8.5, 0.5 ) / resolution ).xyz ) / 65536.0 - 1.0;
    
    // 初期化
    if ( p1y == -1.0 ) {
        p1y = 0.5;
        p2y = 0.5;
        p1score = 0.0;
        p2score = 0.0;
        ballPos = vec2( 0.5, 0.5 );
        ballVel = vec2( 0.004, 0.002 );
        fx = 0.0;
    }
    
    p1y += ( keyState.x - keyState.y ) * 0.015;
    p1y = min( max( p1y, 0.2 ), 0.8 );
    p2y += ( keyState.z - keyState.w ) * 0.015;
    p2y = min( max( p2y, 0.2 ), 0.8 );
    
    // p1パドル衝突時の処理
    if ( abs( ballPos.x - 0.1 ) < 0.025 && abs( ballPos.y - p1y ) < 0.06 ) {
        ballPos.x = 0.125;
        float velR = min( length( ballVel ) * KSK, 0.05 );
        float velT = -atan( ballVel.y / ballVel.x );
        velT -= ( p1y - ballPos.y ) * 8.0;
        velT = min( max( velT, -1.0 ), 1.0 );
        ballVel = vec2( cos( velT ), sin( velT ) ) * velR;
        fx = 0.2;
    }
    
    // p2パドル衝突時の処理
    if ( abs( ballPos.x - 0.9 ) < 0.025 && abs( ballPos.y - p2y ) < 0.06 ) {
        ballPos.x = 0.875;
        float velR = min( length( ballVel ) * KSK, 0.05 );
        float velT = -atan( ballVel.y / ballVel.x );
        velT += ( p2y - ballPos.y ) * 8.0;
        velT = min( max( velT, -1.0 ), 1.0 );
        ballVel = vec2( -cos( velT ), -sin( velT ) ) * velR;
        fx = 0.2;
    }
    
    // 1pゴール到達時の処理
    if ( ballPos.x < -0.1 ) {
        p2score += 1.0;
        ballPos = vec2( 0.5, 0.5 );
        ballVel = vec2( -0.004, 0.002 );
        fx = 1.0;
    }
    
    // 2pゴール到達時の処理
    if ( 1.1 < ballPos.x ) {
        p1score += 1.0;
        ballPos = vec2( 0.5, 0.5 );
        ballVel = vec2( 0.004, 0.002 );
        fx = 1.0;
    }
    
    // 壁衝突時の処理
    if ( ballPos.y < 0.125 ) { ballPos.y = 0.125; ballVel.y *= -1.0; fx = 0.2; }
    if ( 0.875 < ballPos.y ) { ballPos.y = 0.875; ballVel.y *= -1.0; fx = 0.2; }
    
    // 位置と速度の更新
    ballPos += ballVel;
    
    // エフェクト
    uv += vec2( sin( time * 117.0 ), cos( time * 141.0 ) ) * 0.03 * fx;
    fx *= 0.9;
    
    vec3 col = vec3( 0.0 );
    
    { // ball
        float len = length( ballPos - uv );
        col += vec3( len < 0.01 ? 1.0 : 0.0 );
    }
    
    { // p1pad
        col += vec3( abs( uv.x - 0.1 ) < 0.01 && abs( uv.y - p1y ) < 0.05 ? 1.0 : 0.0 );
    }
    
    { // p2pad
        col += vec3( abs( uv.x - 0.9 ) < 0.01 && abs( uv.y - p2y ) < 0.05 ? 1.0 : 0.0 );
    }
    
    { // wall
        col += vec3( abs( uv.x - 0.5 ) < 0.4 && abs( uv.y - 0.1 ) < 0.01 ? 1.0 : 0.0 );
        col += vec3( abs( uv.x - 0.5 ) < 0.4 && abs( uv.y - 0.9 ) < 0.01 ? 1.0 : 0.0 );
    }
    
    { // p1score
        col += 0.1 < uv.x && uv.x - 0.1 < p1score * 0.01 && abs( uv.y - 0.07 ) < 0.005 ? 1.0 : 0.0;
        col += uv.x < 0.9 && -p1score * 0.01 < uv.x - 0.9 && abs( uv.y - 0.95 ) < 0.005 ? 1.0 : 0.0;
    }
    
    { // p2score
        col += 0.1 < uv.x && uv.x - 0.1 < p2score * 0.01 && abs( uv.y - 0.05 ) < 0.005 ? 1.0 : 0.0;
        col += uv.x < 0.9 && -p2score * 0.01 < uv.x - 0.9 && abs( uv.y - 0.93 ) < 0.005 ? 1.0 : 0.0;
    }
    
    // 色を決定
    col = (
        gl_FragCoord.xy == vec2( 0.5, 0.5 ) ? valueToColor( ( p1y + 1.0 ) * 65536.0 ) :
        gl_FragCoord.xy == vec2( 1.5, 0.5 ) ? valueToColor( ( p2y + 1.0 ) * 65536.0 ) :
        gl_FragCoord.xy == vec2( 2.5, 0.5 ) ? valueToColor( p1score ) :
        gl_FragCoord.xy == vec2( 3.5, 0.5 ) ? valueToColor( p2score ) :
        gl_FragCoord.xy == vec2( 4.5, 0.5 ) ? valueToColor( ( ballPos.x + 1.0 ) * 65536.0 ) :
        gl_FragCoord.xy == vec2( 5.5, 0.5 ) ? valueToColor( ( ballPos.y + 1.0 ) * 65536.0 ) :
        gl_FragCoord.xy == vec2( 6.5, 0.5 ) ? valueToColor( ( ballVel.x + 1.0 ) * 65536.0 ) :
        gl_FragCoord.xy == vec2( 7.5, 0.5 ) ? valueToColor( ( ballVel.y + 1.0 ) * 65536.0 ) :
        gl_FragCoord.xy == vec2( 8.5, 0.5 ) ? valueToColor( ( fx + 1.0 ) * 65536.0 ) :
        col
    );
    gl_FragColor = vec4( col, 1.0 );
}
