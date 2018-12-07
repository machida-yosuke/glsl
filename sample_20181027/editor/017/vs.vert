attribute vec3  position;  // 頂点座標
attribute vec4  color;     // 頂点カラー
attribute vec2  texCoord;  // 頂点のテクスチャ座標 @@@
uniform   mat4  mvpMatrix; // 座標変換行列
uniform   float  time; // 座標変換行列
varying   vec4  vColor;    // フラグメントシェーダへ送る色
varying   vec2  vTexCoord; // フラグメントシェーダへ送るテクスチャ座標 @@@
void main(){
    vColor = color;
    vTexCoord = texCoord;
    float s = sin(time);
    // 求めたサインの影響力を頂点にアタッチ
    vec3 p = vec3(position.x, position.y, position.z);
    
    gl_Position = mvpMatrix * vec4(p, 1.0);
    gl_PointSize = 8.0;
}