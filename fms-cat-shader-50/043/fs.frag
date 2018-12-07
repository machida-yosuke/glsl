#define PI 3.14159265
#define saturate(i) clamp(i,0.,1.)

// ------

// 浮動小数点の精度の設定
precision mediump float;

// JSから渡される変数の定義
uniform float sampleStart;
uniform float bufferSize;
uniform float bspsr;

// ------

// 256段階だとだと精度が低いのでRGBAをフルに使い65536段階とする
vec4 signalToColor( vec2 _i ) {
    vec2 pre = floor( saturate( _i * 0.5 + 0.5 ) * 65536.0 );
    return vec4(
        floor( pre.x / 256.0 ) / 255.0,
        mod( pre.x, 256.0 ) / 255.0,
        floor( pre.y / 256.0 ) / 255.0,
        mod( pre.y, 256.0 ) / 255.0
    );
}

// ------

void main( void ) {
    // ピクセルの担当する時間を計算
    float time = ( sampleStart + gl_FragCoord.x / bufferSize ) * bspsr;
    
    // モジュレータ
    float decay2 = exp( -time * 6.0 );
    float sine2 = sin( time * 440.0 * 2.0 * 8.0 * PI ) * 0.8 * decay2;
    
    // キャリア
    float decay1 = exp( -time );
    float sine1 = sin( time * 440.0 * 2.0 * PI + sine2 ) * 0.8 * decay1;
    //                                           ^^^^^ ここ注目！
    
    gl_FragColor = signalToColor( vec2( sine1 ) );
}
