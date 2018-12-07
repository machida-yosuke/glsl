// JavaScript から VBO 経由で送られてきた頂点座標
attribute float vertex;
// JavaScript から送られてくる値を受け取る uniform 変数
uniform vec2 mouse;
// フラグメントシェーダに渡す色
varying vec3 vColor;

// 定数として円周率を定義
const float PI = 3.1415926;

void main(){
    // vertex から X 座標を作る
    float x = vertex * 2.0 - 1.0;

    // マウスカーソル X 値が周期に影響するように
    // float wave = (mouse.x + 1.0) * 0.5; // 0.0 < wave < 1.0
    float wave = (mouse.x + 1.0) * 2.0; // 0.0 < wave < 4.0

    // マウスカーソル Y 値が強さに影響するように
    float height = mouse.y;

    // 係数からサイン波の値を得る
    float s = sin(vertex * 2.0 * PI * wave) * height;

    // 係数が色に影響するように
    vColor = vec3(wave, height, 1.0);

    gl_Position = vec4(x, s, 0.0, 1.0);

    // 頂点の大きさは頂点シェーダで設定する
    gl_PointSize = 8.0;
}
