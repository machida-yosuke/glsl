#define BPM 140.0

#define PI 3.14159265
#define saturate(i) clamp(i,0.,1.)

// ------

precision mediump float;

uniform float sampleStart;
uniform float bufferSize;
uniform float bspsr;

// ------

// 疑似乱数を生成
float random( float _i ) {
    return fract( sin( _i * 8571.44 + 683.03 ) * 18455.35 );
}

// ノート番号を周波数に変換
float noteToFreq( float _n ) {
    return 440.0 * pow( 2.0, ( _n - 69.0 ) / 12.0 );
}

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

// アルペジオを生成
float sushi( float _noteTime ) {
    float chord = mod( floor( _noteTime / 16.0 ), 4.0 ); // どのコード？
    float randomv = random( floor( _noteTime ) ) * 3.0; // どのノート？
    
    // ノートを選択
    float note = (
        chord < 1.0 ? ( randomv < 1.0 ? 60.0 : randomv < 2.0 ? 64.0 : 69.0 ) :
        chord < 2.0 ? ( randomv < 1.0 ? 62.0 : randomv < 2.0 ? 65.0 : 70.0 ) :
        chord < 3.0 ? ( randomv < 1.0 ? 60.0 : randomv < 2.0 ? 64.0 : 69.0 ) :
        ( randomv < 1.0 ? 59.0 : randomv < 2.0 ? 64.0 : 68.0 )
    );
    
    // 乱数に応じてオクターブを上げる
    float randomv2 = random( randomv ) * 3.0;
    // note += floor( randomv2 ) * 12.0;
    
    return note;
}

// ------

void main() {
    // ピクセルの担当する時間を計算
    float time = ( sampleStart + gl_FragCoord.x / bufferSize ) * bspsr;
    
    // アルペジオを生成
    float noteTime = time * BPM / 60.0 * 4.0;
    float amp = exp( -mod( noteTime, 1.0 ) * 3.0 );
    float freq = noteToFreq( sushi( noteTime ) );
    float sine2 = sin( time * freq * 3.0 * 2.0 * PI ) * amp * 0.8;
    vec2 sine = sin( time * freq * vec2( 0.99, 1.01 ) * 2.0 * PI + sine2 ) * amp * 0.8;
    
    gl_FragColor = signalToColor( vec2( sine ) );
}
