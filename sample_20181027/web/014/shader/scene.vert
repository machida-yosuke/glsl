attribute vec3  position;  // 頂点座標
attribute vec4  color;     // 頂点カラー
uniform   mat4  mvpMatrix; // 座標変換行列
uniform   float time;      // 経過時間
varying   vec4  vColor;    // フラグメントシェーダへ送る色
void main(){
    // 時間の経過と座標からサインを求める（サイン波）
    float s = sin(position.y * 2.0 + time);
    // サイン波の影響力を補正する
    s = s * 0.5 + 1.0;
    // 求めたサインの影響力を頂点にアタッチ
    vec3 p = vec3(position.x * s, position.y, position.z * s);

    vColor = color;
    gl_Position = mvpMatrix * vec4(p, 1.0);
    gl_PointSize = 8.0;
}

