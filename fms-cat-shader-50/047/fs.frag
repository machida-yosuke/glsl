#define BPM 175.0

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

// スケール
float pitch( float _i, float _j ) {
    return 12.0 * noteToFreq( (
        _i == 0.0 ? 0.0 :
        _i == 1.0 ? 7.0 :
        _i == 2.0 ? 10.0 :
        _i == 3.0 ? 17.0 :
        _i == 4.0 ? 26.0 : 0.0
    ) + _j * 12.0 );
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

// ------

void main( void ) {
    // ピクセルの担当する時間を計算
    float time = ( sampleStart + gl_FragCoord.x / bufferSize ) * bspsr;
    float beat = time * BPM / 60.0;
    
    vec2 ret = vec2( 0.0 );
    
    float kickTime = mod( beat + ( 1.5 < mod( beat, 8.0 ) ? 0.5 : 0.0 ), 2.0 );
    { // kick
        float noteTime = kickTime;
        float attackPhase = exp( -noteTime * 24.0 ) * 99.0;
        float decayPhase = -noteTime * 96.0;
        float amp = 0.8;
        ret += vec2( amp ) * sin( attackPhase + decayPhase );
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
        float noteTime = mod( beat, 0.25 );
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
    
    { // pad
        for ( int iLoop = 0; iLoop < 5; iLoop ++ ) { // chord loop
            float i = float( iLoop );
            for ( int j = 0; j < 5; j ++ ) { // unison loop
                vec2 freq = vec2( pitch( i, 0.0 ) );
                freq *= ( 4.0 + noise2( i ) * 0.1 + noise2( float( j ) ) * 0.03 );
                
                ret += sin(
                    beat * freq
                    + sin(
                        beat * 4.0 * freq
                        + sin(
                            beat * 12.0 * freq
                        )
                    ) * 0.2
                ) * 0.02 * sidechain;
            }
        }
    }
    
    { // arp
        float noteTime = mod( beat, 0.25 );
        float note = mod( floor( beat * 4.0 ), 6.0 );
        float oct = floor( noise2( floor( beat * 4.0 ) / 7.3 ).x * 3.0 );
        vec2 freq = vec2( pitch( note, oct ) );
        freq *= vec2( 8.01, 7.99 );
        ret += sin(
            beat * freq + sin(
                beat * 1.0 * freq
            ) * exp( -noteTime * 12.0 )
        ) * 0.1 * exp( -noteTime * 7.0 )
        * sidechain;
    }
    
    gl_FragColor = signalToColor( vec2( ret ) );
}
