// 浮動小数点の精度の設定
precision mediump float;

// JSから渡される変数の定義
uniform vec2 resolution;
uniform vec2 mouse;
uniform float time;

// ------

mat2 rotate2d( float t ) {
    return mat2( cos( t ), sin( t ), -sin( t ), cos( t ) );
}

float sdTorus( vec3 p, vec2 t )
{
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float distFunc( vec3 _p ) {
    vec3 p = _p;
    p.yz = rotate2d( time ) * p.yz;
    p.xy = rotate2d( time * 0.3 ) * p.xy;
    return sdTorus( p, vec2( 2.0, 0.5 ) );
}

vec3 normalFunc( vec3 p ) {
    float delta = 0.001;
    return normalize( vec3(
        distFunc( p + vec3( delta, 0.0, 0.0 ) ) - distFunc( p - vec3( delta, 0.0, 0.0 ) ),
        distFunc( p + vec3( 0.0, delta, 0.0 ) ) - distFunc( p - vec3( 0.0, delta, 0.0 ) ),
        distFunc( p + vec3( 0.0, 0.0, delta ) ) - distFunc( p - vec3( 0.0, 0.0, delta ) )
    ) );
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec2 p = uv * 2.0 - vec2( 1.0, 1.0 );
    
    vec3 rayDir = normalize( vec3( p, -1.0 ) );
    vec3 rayOri = vec3( 0.0, 0.0, 5.0 );
    vec3 rayPos = rayOri;
    float rayLen = 0.0;
    float dist = 0.0;
    
    for ( int i = 0; i < 64; i ++ ) {
        dist = distFunc( rayPos );
        rayLen += dist;
        rayPos = rayOri + rayDir * rayLen;
    }
    
    if ( abs( dist ) < 0.01 ) {
        gl_FragColor = vec4( normalFunc( rayPos ) * 0.5 + 0.5, 1.0 );
    } else {
        gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
    }
}
