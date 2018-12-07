#define BPM 175.0
#define AMEN_BPM 137.8

#define PI 3.14159265
#define saturate(i) clamp(i,0.,1.)

// ------

// 浮動小数点の精度の設定
precision mediump float;

// JSから渡される変数の定義
uniform float sampleStart;
uniform float bufferSize;
uniform float bspsr;
uniform sampler2D textureRandom;
uniform sampler2D textureAmen;

// ------

// ノイズ
vec2 noise2( float _i ) {
    vec2 uv = _i * vec2( 1.79, 1.73 );
    return texture2D( textureRandom, uv ).xy * 2.0 - 1.0;
}

// ノート番号を周波数に変換
float noteToFreq( float _n ) {
    return 440.0 * pow( 2.0, ( _n - 69.0 ) / 12.0 );
}

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

// signalToColorの逆
vec2 colorToSignal( vec4 _c ) {
    return vec2(
        ( _c.x + 0.0 * _c.y / 256.0 ) * 2.0 - 1.0,
        ( _c.z + 0.0 * _c.w / 256.0 ) * 2.0 - 1.0
    );
}

// サンプルをロード
vec2 readSample( sampler2D _sample, float _time ) {
    float sampleRate = 44100.0;
    float reso = 512.0;
    
    float s = _time * sampleRate;
    vec2 uv = ( vec2(
        mod( s, reso ),
        floor( s / reso )
    ) + 0.5 ) / reso;
    return colorToSignal( texture2D( _sample, uv ) );
}

// ------

vec2 comp( vec2 _i ) {
    vec2 s = sign( _i );
    vec2 a = abs( _i );
    a = pow( a, vec2( 0.5 ) );
    return a * s;
}

// ------

// グリッチ！
float glitch( float _beat ) {
    float beat = _beat; // 最終的に出力するbeat
    float intrv = 0.5; // グリッチの区切り
    float dice = noise2( floor( beat / intrv ) ).x; // ランダム
    float pos = mod( beat, intrv ); // 区切り内の位置
    
    
    if ( dice < -0.7 ) { // retrigger
        float ret = 8.0;
        beat -= floor( pos * ret ) / ret;
    } else if ( dice < -0.5 ) { // stretch
        float fw = 0.2;
        float ret = 12.0;
        beat -= floor( pos * ret ) / ret * ( 1.0 - fw );
    } else if ( dice < -0.3 ) { // lofi
        float m = 0.002;
        beat -= mod( pos, m );
    } else if ( dice < -0.2 ) { // stop
        float m = 1.0;
        float p = 2.0;
        float stop = pow( 1.0 / m / p, 1.0 / ( p - 1.0 ) );
        beat -= pos * m < stop ? pow( pos * m, p ) : pos;
    } else if ( dice < -0.1 ) { // speeddown
        float s = 0.5;
        beat -= mod( beat, intrv ) * s;
    }
    return beat;
}

// ------

void main( void ) {
    // ピクセルの担当する時間を計算
    float time = ( sampleStart + gl_FragCoord.x / bufferSize ) * bspsr;
    float rawBeat = time * BPM / 60.0;
    float beat = glitch( rawBeat );
    
    vec2 ret = vec2( 0.0 );
    
    float kickTime = mod( beat + ( 1.5 < mod( beat, 8.0 ) ? 0.5 : 0.0 ), 2.0 );
    { // kick
        float noteTime = kickTime;
        float attackPhase = exp( -noteTime * 24.0 ) * 99.0;
        float decayPhase = -noteTime * 96.0;
        float amp = 0.8;
        float wave = sin( attackPhase + decayPhase );
        ret += vec2( amp ) * wave;
    }
    
    float snareTime = mod( beat + 2.0, 4.0 );
    { // snare
        float noteTime = snareTime;
        vec2 snap = noise2( noteTime * 40.0 );
        vec2 tune = sin( noteTime * 32.0 * vec2( 26.1, 25.9 ) - exp( -noteTime * 320.0 ) * 20.0 );
        float pamp = 2.0 * exp( -noteTime * 8.0 );
        float amp = 0.5;
        ret += amp * clamp( pamp * ( tune * 2.0 + snap ), -1.0, 1.0 );
    }
    
    float sidechain = clamp( min( kickTime, snareTime ), -1.0, 1.0 );
    
    { // hihat
        float noteTime = mod( beat, 0.5 );
        vec2 noisev = noise2( noteTime * 40.0 );
        float decay = exp( -noteTime * 42.0 );
        float amp = sidechain * 0.4;
        ret += amp * decay * noisev;
    }
    
    { // click
        float noteTime = mod( beat, 0.25 );
        float samp = exp( -noteTime * 300.0 );
        vec2 pos = noise2( beat );
        float amp = 0.8;
        ret += amp * sin( samp * pos );
    }
    
    { // amen
        float pos = mod( beat, 8.0 );
        vec2 sample = readSample( textureAmen, pos * 60.0 / AMEN_BPM );
        float amp = 0.4;
        ret += amp * comp( sample );
    }
    
    gl_FragColor = signalToColor( vec2( ret ) );
}
