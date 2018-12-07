// JavaScript から VBO 経由で送られてきた頂点座標 @@@
// 第一要素は 0.0 ～ 1.0 を正規化した値
// 第二要素は 1.0 か -1.0 が順番に入っている
attribute vec2 vertex;
// JavaScript から送られてくる値を受け取る uniform 変数
uniform vec2 mouse;
// フラグメントシェーダに渡す色
varying vec3 vColor;

// 定数として円周率を定義
const float PI = 3.1415926;

void main(){
    // vertex から X 座標を作る
    float x = vertex.x * 2.0 - 1.0;

    // マウスカーソル X 値が周期に影響するように
    float wave = (mouse.x + 1.0) * 2.0; // 0.0 < wave < 4.0

    // マウスカーソル Y 値が強さに影響するように
    float height = mouse.y;

    // 係数からサイン波の値を得る
    float s = sin(vertex.x * 2.0 * PI * wave) * height;

    // 係数が色に影響するように
    vColor = vec3(height, 1.0, wave);

    // vertex の第二要素を乗算することで上下に振り分ける @@@
    gl_Position = vec4(x, s * vertex.y, 0.0, 1.0);

    // 頂点の大きさは頂点シェーダで設定する
    gl_PointSize = 8.0;
}
