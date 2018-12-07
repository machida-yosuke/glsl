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

// ノート番号を周波数に変換
float noteToFreq( float _n ) {
    return 440.0 * pow( 2.0, ( _n - 69.0 ) / 12.0 );
}

// ------

void main( void ) {
    // ピクセルの担当する1時間を計算
    float time = ( sampleStart + gl_FragCoord.x / bufferSize ) * bspsr;
    
    // 発声タイミング
    float noteId = mod( floor( time * 2.0 ), 8.0 );
    float noteTime = mod( time, 0.5 );
    
    // ノート周波数
    float note = 60.0 + noteId;
    {
        note = (
            noteId == 0.0 ? 60.0 :
            noteId == 1.0 ? 62.0 :
            noteId == 2.0 ? 64.0 :
            noteId == 3.0 ? 65.0 :
            noteId == 4.0 ? 67.0 :
            noteId == 5.0 ? 69.0 :
            noteId == 6.0 ? 71.0 :
            noteId == 7.0 ? 72.0 : 0.0
        );
    }
    float freq = noteToFreq( note );
    
    // モジュレータ
    float decay2 = exp( -noteTime * 14.0 );
    float sine2 = sin( noteTime * freq * 2.0 * 8.0 * PI ) * 0.8 * decay2;
    float decay1 = exp( -noteTime * 6.0 );
    float sine1 = sin( noteTime * freq * 2.0 * PI + sine2 ) * 0.8 * decay1;
    
    gl_FragColor = signalToColor( vec2( sine1 ) );
}
