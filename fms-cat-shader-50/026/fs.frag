#define saturate(i) clamp(i,0.,1.)

// 浮動小数点の精度の設定
precision mediump float;

// JSから渡される変数の定義
uniform vec2 resolution;
uniform vec2 mouse;
uniform bool isVert;
uniform sampler2D textureCam;

// ------

// テクスチャロード用にyを逆向きにするやつ
vec2 vInvert( vec2 _uv ) {
    return vec2( 0.0, 1.0 ) + vec2( 1.0, -1.0 ) * _uv;
}

// 色をグレーに変換
float gray( vec3 _c ) {
  return _c.x * 0.299 + _c.y * 0.587 + _c.z * 0.114;
}

// ------

void main() {
    // uv定義
    vec2 uv = gl_FragCoord.xy / resolution; // ピクセル位置
    vec4 tex = texture2D( textureCam, vInvert( uv ) );
    vec3 col = vec3( 1.0 ) * gray( tex.xyz );
    
    gl_FragColor = vec4( col, 1.0 );
}
