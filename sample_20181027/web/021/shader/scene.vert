attribute vec3  position;       // 頂点座標
attribute vec3  positionOffset; // 頂点のオフセット移動量
attribute vec2  texCoord;       // 頂点のテクスチャ座標
uniform   mat4  mvpMatrix;      // 座標変換行列
uniform   float time;           // 時間の経過
varying   vec2  vTexCoord;      // フラグメントシェーダへ送るテクスチャ座標
const     float PI = 3.1415926; // PI
void main(){
    // 時間の経過から回転行列を生成する
    float s = sin(time * 2.0 * position.z - PI);
    float c = cos(time * 2.0 * position.z - PI);
    mat2 m = mat2(c, s, -s, c);

    // 回転行列を使って頂点を回転してから移動する
    vec2 p = m * position.xy + positionOffset.xy;
    vec3 pos = vec3(p, positionOffset.z);

    // 回転等を行ったあとの座標で MVP 変換する
    gl_Position = mvpMatrix * vec4(pos, 1.0);
    vTexCoord = texCoord;
}

