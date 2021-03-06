// JavaScript から VBO 経由で送られてきた頂点座標
attribute float vertex;
// JavaScript から送られてくる値を受け取る uniform 変数
uniform vec2 mouse;

void main(){
    // 仮に頂点が0だったら
    // マウスカーソル X 値が距離に影響するように
    float dist = vertex * mouse.x;

    // マウスカーソル Y 値が回転量に影響するように
    float rad = vertex * mouse.y * 3.14;

    // サインとコサインを求める
    float s = sin(rad);
    float c = cos(rad);

    gl_Position = vec4(vec2(c, s) * dist, 0.0, 1.0);

    // 頂点の大きさは頂点シェーダで設定する
    gl_PointSize = 8.0;
}
