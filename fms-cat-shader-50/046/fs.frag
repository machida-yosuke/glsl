#define BPM 140.0

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
    
    float kick;
    {
        float noteTime = mod( time, 60.0 / BPM );
        float attackPhase = -exp( -noteTime * 60.0 ) * 100.0;
        float decayPhase = noteTime * 50.0 * 2.0 * PI;
        float amp = 0.8 * exp( -noteTime * 6.0 );
        kick = amp * sin( attackPhase + decayPhase );
        //kick = 0.5 * clamp( kick * 1000.0, -1.0, 1.0 );
    }
    
    gl_FragColor = signalToColor( vec2( kick ) );
}
