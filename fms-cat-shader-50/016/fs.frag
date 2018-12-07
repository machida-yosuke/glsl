#define MARCH_ITER 100
#define INIT_LEN 0.01

#define V vec2(0.,1.)
#define PI 3.14159265
#define HUGE 1E9
#define saturate(i) clamp(i,0.,1.)
#define lofi(i,d) floor(i/d)*d

// ------

// 浮動小数点の精度の設定
precision mediump float;

// JSから渡される変数の定義
uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;

// ------

// 二次元回転行列
mat2 rotate2D( float _t ) {
    return mat2(
        cos( _t ), sin( _t ),
        -sin( _t ), cos( _t )
    );
}

// ------

// カメラの構造体
struct Camera {
    vec3 pos;
    vec3 dir;
    vec3 sid;
    vec3 top;
    float fov;
};

// レイの構造体
struct Ray {
    vec3 dir;
    vec3 ori;
};

// ------

// カメラの初期化
Camera camInit( in vec3 _pos, in vec3 _tar, in float _fov ) {
    Camera cam;
    cam.pos = _pos;
    cam.dir = normalize( _tar - _pos );
    cam.sid = normalize( cross( cam.dir, V.xyx ) );
    cam.top = normalize( cross( cam.sid, cam.dir ) );
    cam.fov = _fov;

    return cam;
}

// レイの初期化
Ray rayInit( in vec3 _ori, in vec3 _dir ) {
    Ray ray;
    ray.dir = _dir;
    ray.ori = _ori;
    return ray;
}

// カメラから出るレイを求める
Ray rayFromCam( in vec2 _p, in Camera _cam ) {
    vec3 dir = normalize(
        _p.x * _cam.sid
        + _p.y * _cam.top
        + _cam.dir / tan( _cam.fov * PI / 360.0 ) // Is this correct?
    );
    return rayInit( _cam.pos, dir );
}

// ------

// http://iquilezles.org/www/articles/distfunctions/distfunctions.htm

// 球体の距離関数
float distFuncSphere( vec3 _p, float _r ) {
    return length( _p ) - _r;
}

// 距離関数
float distFunc( vec3 _p ) {
    vec3 p = _p;
    float dist = HUGE;
    for ( int i = 0; i < 6; i ++ ) {
        float size = 0.1; // 0.3 / pow( 2.0, float( i ) );
        dist = min( distFuncSphere( p, size ), dist );
        
        p.xy = rotate2D( time ) * p.xy;
        p.yz = rotate2D( time * 0.7 ) * p.yz;
        p = abs( p );
        p -= vec3( 0.2 ) / pow( 2.0, float( i ) );
    }
    return dist;
    
}

// 距離関数から法線を求める
vec3 normalFunc( in vec3 _p ) {
    vec2 d = V * 1E-4;
    return normalize( vec3(
        distFunc( _p + d.yxx ) - distFunc( _p - d.yxx ),
        distFunc( _p + d.xyx ) - distFunc( _p - d.xyx ),
        distFunc( _p + d.xxy ) - distFunc( _p - d.xxy )
    ) );
}

// ------

void main() {
    // カメラとレイを定義
    vec2 p = ( gl_FragCoord.xy * 2.0 - resolution ) / resolution.x;
    Camera cam = camInit(
        vec3( 0.0, 0.0, 1.5 ),
        vec3( 0.0, 0.0, 0.0 ),
        50.0
    );
    Ray ray = rayFromCam( p, cam );

    // ------

    float rayLen = INIT_LEN; // 探索レイの長さ
    vec3 rayPos = ray.ori + rayLen * ray.dir; // 探索レイの位置
    float rayDist = 0.0; // 探索レイ到達点から物体までの距離

    // raymarch
    for ( int i = 0; i < MARCH_ITER; i ++ ) {
        rayDist = distFunc( rayPos );
        rayLen += rayDist;
        rayPos = ray.ori + rayLen * ray.dir;
    }

    vec3 col = V.xxx; // 出力する色
    if ( rayDist < 1E-2 ) { // もし物体に衝突したなら
        vec3 normal = normalFunc( rayPos );
        col = normal * 0.5 + 0.5;
    }
    
    gl_FragColor = vec4( col, 1.0 );
}
