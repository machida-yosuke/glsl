#define REFLECT 3
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

// smooth minimum : http://iquilezles.org/www/articles/smin/smin.htm
float smin( float _a, float _b, float _k ){
    float h = clamp( 0.5 + 0.5 * ( _b - _a ) / _k, 0.0, 1.0 );
    return mix( _b, _a, h ) - _k * h * ( 1.0 - h );
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

// 箱の距離関数
float distFuncBox( vec3 _p, vec3 _s ) {
    vec3 d = abs( _p ) - _s;
    return min( max( d.x, max( d.y, d.z ) ), 0.0 ) + length( max( d, 0.0 ) );
}

// [ Type ] のアレ
vec3 ifs( vec3 _p, vec3 _rot, vec3 _shift ) {
    vec3 pos = _p;

    vec3 shift = _shift;

    for ( int i = 0; i < 5; i ++ ) {
        float intensity = pow( 2.0, -float( i ) );
    
        pos.y -= 0.0;
    
        pos = abs( pos ) - shift * intensity;
    
        shift.yz = rotate2D( _rot.x ) * shift.yz;
        shift.zx = rotate2D( _rot.y ) * shift.zx;
        shift.xy = rotate2D( _rot.z ) * shift.xy;
    
        if ( pos.x < pos.y ) { pos.xy = pos.yx; }
        if ( pos.x < pos.z ) { pos.xz = pos.zx; }
        if ( pos.y < pos.z ) { pos.yz = pos.zy; }
    }

    return pos;
}

// 距離関数
float distFunc( vec3 _p ) {
    vec3 p = _p;
    p = ifs(
        p,
        vec3( 0.14, 0.02, 0.01 ),
        vec3( 3.0, 3.23, 3.56 )
    );
    float dist = distFuncBox( p, vec3( 0.1 ) );
    return dist;
    
}

// 距離関数から法線を求める
vec3 normalFunc( in vec3 _p, in float _d ) {
    vec2 d = V * _d;
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
    vec3 camDir = vec3(
        -sin( 1.0 - 2.0 * mouse.x ) * cos( 2.0 * mouse.y - 1.0 ),
        sin( 2.0 * mouse.y - 1.0 ),
        -cos( 1.0 - 2.0 * mouse.x ) * cos( 2.0 * mouse.y - 1.0 )
    );
    Camera cam = camInit(
        vec3( 0.0, 0.0, 0.0 ),
        camDir,
        50.0
    );
    Ray ray = rayFromCam( p, cam );

    // ------

    // 色の初期化
    vec3 colorAdd = vec3( 0.0 );
    vec3 colorMul = vec3( 1.0 );

    for ( int iTrace = 0; iTrace < REFLECT; iTrace ++ ) {
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
            // 各ベクトルを求める
            vec3 normal = normalFunc( rayPos, 1E-4 );
            float edge = length( normalFunc( rayPos, 1E-4 ) - normalFunc( rayPos, 4E-3 ) );
            vec3 camDir = normalize( rayPos - cam.pos );
            vec3 ligPos = vec3( 1.0, 2.0, 5.0 );
            vec3 ligDir = normalize( rayPos - ligPos );
            
            // 拡散反射・光源の鏡面反射を求める
            float dif = 0.5 + 0.5 * dot( -normal, ligDir );
            float spe = pow( dot( normalize( camDir - normal ), ligDir ), 20.0 );
            
            // 材質の決定
            vec3 mtlCol = vec3( 0.6 );
            float mtlReflective = 0.7;
            
            // 色を足し掛けする
            colorAdd += dif * mtlCol * ( 1.0 - mtlReflective ) * colorMul;
            colorAdd += spe * 0.5 * colorMul;
            colorAdd += edge * vec3( 1.0, 0.1, 0.4 ) * colorMul;
            colorMul *= dif * mtlCol * mtlReflective;
            
            // 次のレイを求める
            ray = rayInit( rayPos, reflect( ray.dir, normal ) );
        }
    }
    
    gl_FragColor = vec4( colorAdd, 1.0 );
}
