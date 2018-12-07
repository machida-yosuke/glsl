attribute vec3  position;  // 頂点座標
attribute vec4  color;     // 頂点カラー
attribute vec2  texCoord;  // 頂点のテクスチャ座標
uniform   mat4  mvpMatrix; // 座標変換行列
uniform   float time;      // 時間の経過 @@@
varying   vec4  vColor;    // フラグメントシェーダへ送る色
varying   vec2  vTexCoord; // フラグメントシェーダへ送るテクスチャ座標
void main(){
    // 時間の経過と sin を利用して係数を作る @@@
    float s = abs(sin(time));

    // 係数を頂点のアルファに掛ける
    vColor = color * vec4(vec3(1.0), s);

    vTexCoord = texCoord;
    gl_Position = mvpMatrix * vec4(position, 1.0);

    // ポイントサイズにも係数が影響するようにする
    gl_PointSize = 8.0 * s;
}

