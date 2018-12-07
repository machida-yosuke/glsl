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

// mandelbulbを描画
// http://blog.hvidtfeldts.net/index.php/2011/09/distance-estimated-3d-fractals-v-the-mandelbulb-different-de-approximations/
vec3 distFuncMandelbulb( vec3 _p, float _power, int _iter ) {
	vec3 p = _p.xzy;
	vec3 z = p;
	float dr = 1.0;
	float r = 0.0;
	float power = _power;
	float bailout = 2.0;

	float t0 = 1.0;

	for( int i = 0; i < 20; i ++ ) {
	    if ( _iter == i ) { break; }
	    
		r = length( z );
		if( bailout < r ) { break; }
		
		float theta = atan( z.y / z.x );
		float phi = asin( z.z / r );
		dr = pow( r, power - 1.0 ) * dr * power + 1.0;

		r = pow( r, power );
		theta = theta * power;
		phi = phi * power;

		z = r * vec3(
		    cos( theta ) * cos( phi ),
		    sin( theta ) * cos( phi ),
		    sin( phi )
		) + p;

		t0 = min( t0, r );
	}
	return vec3( 0.5 * log( r ) * r / dr, t0, 0.0 );
}

// 距離関数
float distFunc( vec3 _p ) {
    vec3 p = _p;
    p.zx = rotate2D( time ) * p.zx;
    p.yz = rotate2D( time * 0.7 ) * p.yz;
    float dist = distFuncMandelbulb( p * 2.0, 8.0, 4 ).x / 2.0;
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
