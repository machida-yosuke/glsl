attribute vec3  position;  // 頂点座標
attribute vec4  color;     // 頂点カラー
uniform   mat4  mvpMatrix; // 座標変換行列
uniform   float time;      // 経過時間
varying   vec4  vColor;    // フラグメントシェーダへ送る色
void main(){
    // 複数のサイン波のパターンを作る
    float s0 = sin(position.y * 1.25 + time * 2.5) * 0.25;
    float s1 = sin(position.y * 2.75 + time * 3.0) * 0.25;
    float s2 = sin(position.y * 3.75 + time * 3.5) * 0.25;
    float s3 = sin(position.y * 4.25 + time * 4.0) * 0.25;
    // サイン波の影響力を合成
    float s = s0 + s1 + s2 + s3 + 1.0;
    // 求めたサインの影響力を頂点にアタッチ
    vec3 p = vec3(position.x * s, position.y, position.z * s);

    vColor = color;
    gl_Position = mvpMatrix * vec4(p, 1.0);
    gl_PointSize = 8.0;
}

