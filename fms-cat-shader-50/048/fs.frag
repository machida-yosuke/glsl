#define PI 3.14159265
#define saturate(i) clamp(i,0.,1.)

// ------

// 浮動小数点の精度の設定
precision mediump float;

// JSから渡される変数の定義
uniform float sampleStart;
uniform float bufferSize;
uniform float bspsr;
uniform sampler2D textureRick;

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

void main( void ) {
    // ピクセルの担当する時間を計算
    float time = ( sampleStart + gl_FragCoord.x / bufferSize ) * bspsr;
    
    vec2 ret = vec2( 0.0 );
    
    { // amen
        float pos = time;
        // pos = ( 1.0 - exp( -time * 0.2 ) ) * 5.0;
        vec2 sample = readSample( textureRick, pos );
        float amp = 0.5;
        ret += amp * sample;
    }
    
    gl_FragColor = signalToColor( vec2( ret ) );
}
