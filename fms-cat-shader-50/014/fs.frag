#define MARCH_ITER 100
#define INIT_LEN 0.01

#define material int
#define MTL_NONE 0
#define MTL_RED 1
#define MTL_BLUE 2
#define MTL_GREEN 3

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

// 箱の距離関数
float distFuncBox( vec3 _p, vec3 _s ) {
    vec3 d = abs( _p ) - _s;
    return min( max( d.x, max( d.y, d.z ) ), 0.0 ) + length( max( d, 0.0 ) );
}

float distFuncTorus( vec3 _p, float _r, float _R ) {
  vec2 q = vec2( length( _p.xz ) - _R, _p.y );
  return length( q ) - _r;
}

// 距離関数
float distFunc( vec3 _p, out material mtl ) {
    vec3 p = _p;
    float dist = HUGE;
    
    {
        vec3 p = p - vec3( 0.0, 0.0, 0.0 );
        float distt = distFuncSphere( p, 0.2 );
        mtl = distt < dist ? MTL_GREEN : mtl;
        dist = min( dist, distt );
    }
    
    {
        vec3 p = p - vec3( -0.5, 0.0, 0.0 );
        p.yz = rotate2D( time ) * p.yz;
        p.zx = rotate2D( time * 1.3 ) * p.zx;
        float distt = distFuncBox( p, vec3( 0.14 ) );
        mtl = distt < dist ? MTL_BLUE : mtl;
        dist = min( dist, distt );
    }
    
    {
        vec3 p = p - vec3( 0.5, 0.0, 0.0 );
        p.yz = rotate2D( time ) * p.yz;
        p.xy = rotate2D( time * 1.3 ) * p.xy;
        float distt = distFuncTorus( p, 0.07, 0.15 );
        mtl = distt < dist ? MTL_RED : mtl;
        dist = min( dist, distt );
    }
    
    return dist;
}

// オーバーライド
float distFunc( vec3 _p ) {
    material dummy = MTL_NONE;
    return distFunc( _p, dummy );
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
    material mtl = MTL_NONE;

    // raymarch
    for ( int i = 0; i < MARCH_ITER; i ++ ) {
        rayDist = distFunc( rayPos, mtl );
        rayLen += rayDist;
        rayPos = ray.ori + rayLen * ray.dir;
    }

    vec3 col = V.xxx; // 出力する色
    if ( rayDist < 1E-2 ) { // もし物体に衝突したなら
        // 各ベクトルを求める
        vec3 normal = normalFunc( rayPos );
        vec3 camDir = normalize( rayPos - cam.pos );
        vec3 ligPos = vec3( 1.0, 2.0, 3.0 );
        vec3 ligDir = normalize( rayPos - ligPos );

        // 拡散反射・光源の鏡面反射を求める
        float dif = 0.5 + 0.5 * dot( -normal, ligDir );
        float spe = pow( dot( normalize( camDir - normal ), ligDir ), 20.0 );
        
        // 材質に応じて色と反射率を変化させる
        if ( mtl == MTL_RED ) {
            col = vec3( 1.0, 0.0, 0.0 );
        } else if ( mtl == MTL_BLUE ) {
            col = vec3( 0.0, 0.0, 1.0 );
        } else if ( mtl == MTL_GREEN ) {
            col = vec3( 0.0, 1.0, 0.0 );
        }

        // 色を決定
        col *= dif;
        col += spe;
    }
    
    gl_FragColor = vec4( col, 1.0 );
}
