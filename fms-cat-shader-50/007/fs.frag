#define PI 3.14159265

// 浮動小数点の精度の設定
precision mediump float;

// JSから渡される変数の定義
uniform vec2 resolution;
uniform vec2 mouse;
uniform float time;
uniform sampler2D textureCat;

// ------

// テクスチャロード用にyを逆向きにするやつ
vec2 vInvert( vec2 _uv ) {
    return vec2( 0.0, 1.0 ) + vec2( 1.0, -1.0 ) * _uv;
}

// 色をグレーに変換
float gray( vec3 _c ) {
  return _c.x * 0.299 + _c.y * 0.587 + _c.z * 0.114;
}

// にじいろ！
vec3 catColor( float _p ) {
    return 0.5 + 0.5 * vec3(
        cos( _p ),
        cos( _p + PI / 3.0 * 2.0 ),
        cos( _p + PI / 3.0 * 4.0 )
    );
}

// 二次元回転行列
mat2 rotate2D( float _t ) {
    return mat2(
        cos( _t ), sin( _t ),
        -sin( _t ), cos( _t )
    );
}

void main() {
    // uv定義
    vec2 uv = gl_FragCoord.xy / resolution;

    // テクスチャ
    float zoom = 0.8 + 0.8 * sin( time * 3.2 );
    float rot = sin( time ) * 8.0;
    vec2 tuv = 0.5 + rotate2D( rot ) * ( vInvert( uv ) - 0.5 ) / zoom;
    vec4 tex = (
        abs( tuv.x - 0.5 ) < 0.5 && abs( tuv.y - 0.5 ) < 0.5 ?
        texture2D( textureCat, tuv ) :
        vec4( 0.0 )
    );
    vec3 texcol = tex.xyz * tex.w;
    
    // 波を何個か作る
    float wave1 = sin( uv.x * 10.0 + time * 10.0 );
    float wave2 = sin( length( uv - 0.5 + 0.4 * vec2( sin( time ), sin( time / 0.87 ) ) ) * 16.0 + time * 8.0 );
    float wave3 = sin( ( uv.y * sin( time / 0.43 ) + uv.x * sin( time / 0.74 ) ) * 8.0 + time * 5.0 );
    float wave4 = gray( texcol ) * 8.0 + time * 10.0;
    
    // 波を足し合わせる
    float waveSum = wave1 + wave2 + wave3 + wave4;
    
    // catColorに波を代入
    vec3 color = sqrt( catColor( waveSum ) );
    
    gl_FragColor = vec4( color, 1.0 );
}
