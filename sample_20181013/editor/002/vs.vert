// JavaScript から VBO 経由で送られてきた頂点座標
attribute vec3 position;
// JavaScript から送られてくる値を受け取る uniform 変数 @@@
uniform vec2 mouse;
uniform float nowTime;
varying float vNowTime;
void main(){
    vNowTime = nowTime;
    // マウスカーソルの値を反映してみる（その１） @@@
    // vec3 v = vec3(mouse, 0.0);
    // vec3 r = vec3(cos(vNowTime), sin(vNowTime), 0.0);
    // gl_Position = vec4(position + v + r, 1.0);

    // マウスカーソルの値を反映してみる（その２） @@@
    // float f = abs(mouse.x);
    // gl_Position = vec4(position * f, 1.0);

    // マウスカーソルの値を反映してみる（その３） @@@
    float f = min(length(mouse), 1.0);
    gl_Position = vec4(position * f, 1.0);

    // 頂点の大きさは頂点シェーダで設定する
    // gl_PointSize = abs(sin(nowTime) * 255.0);
    gl_PointSize = 30.0;
}
