attribute vec3  position;  // 頂点座標
attribute vec4  color;     // 頂点カラー
uniform   mat4  mvpMatrix; // 座標変換行列
varying   vec4  vColor;    // フラグメントシェーダへ送る色
void main(){
    vColor = color;
    gl_Position = mvpMatrix * vec4(position, 1.0);
    gl_PointSize = 64.0;
}

