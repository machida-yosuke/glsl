attribute vec3  position;  // 頂点座標
attribute vec4  color;     // 頂点カラー
uniform   mat4  mvpMatrix; // 座標変換行列
uniform   float time;      // 経過時間 @@@
varying   vec4  vColor;    // フラグメントシェーダへ送る色
void main(){
    /* パターンその１ */
    // 時間の経過と座標からサインを求める（サイン波）
    float s = sin(position.x + time);
    // 求めたサインを頂点の Y 座標にアタッチしてみる
    vec3 p = vec3(position.x, s, position.z);

    /* パターンその２ */
    // 座標を X だけでなく Z にも依存するようにしてみる
    // float s = sin(position.x + time);
    // float c = cos(position.z + time);
    // vec3 p = vec3(position.x, s + c, position.z);

    /* パターンその３ */
    // 原点からの距離を測ってそれを元にサインコサインを求める
    // float dist = length(position.xz);
    // float s = sin(dist + time);
    // float c = cos(dist + time);
    // vec3 p = vec3(position.x, s + c, position.z);

    vColor = color;
    gl_Position = mvpMatrix * vec4(p, 1.0);
    gl_PointSize = 8.0;
}

