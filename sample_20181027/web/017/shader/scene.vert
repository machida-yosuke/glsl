attribute vec3  position;  // 頂点座標
attribute vec4  color;     // 頂点カラー
attribute vec2  texCoord;  // 頂点のテクスチャ座標 @@@
uniform   mat4  mvpMatrix; // 座標変換行列
varying   vec4  vColor;    // フラグメントシェーダへ送る色
varying   vec2  vTexCoord; // フラグメントシェーダへ送るテクスチャ座標 @@@
void main(){
    vColor = color;
    vTexCoord = texCoord;
    gl_Position = mvpMatrix * vec4(position, 1.0);
    gl_PointSize = 8.0;
}

