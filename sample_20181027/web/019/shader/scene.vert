attribute vec3  position;  // 頂点座標
attribute vec4  color;     // 頂点カラー
attribute vec2  texCoord;  // 頂点のテクスチャ座標
uniform   mat4  mvpMatrix; // 座標変換行列
uniform   float time;      // 時間の経過
uniform   vec2  mouse;     // マウスカーソル正規化済み座標 @@@
varying   vec4  vColor;    // フラグメントシェーダへ送る色
varying   vec2  vTexCoord; // フラグメントシェーダへ送るテクスチャ座標
void main(){
    // テクスチャ座標（0.0 ~ 1.0）を変換して -1.0 ～ 1.0 にする @@@
    vec2 p = texCoord * 2.0 - 1.0;
    // 変換した値とマウスカーソルの位置ベクトルとの距離を測る @@@
    float len = length(p - mouse);
    // 距離が 0.5 より小さいならポイントサイズを大きくする @@@
    float size = 8.0 * (1.0 + step(len, 0.5));

    vColor = color;
    vTexCoord = texCoord;
    gl_Position = mvpMatrix * vec4(position, 1.0);
    gl_PointSize = size;
}

