// JavaScript から VBO 経由で送られてきた頂点座標
attribute vec3 position;
// JavaScript から VBO 経由で送られてきた頂点カラー
attribute vec4 color;
// JavaScript から送られてくる値を受け取る uniform 変数
uniform vec2 mouse;
// フラグメントシェーダに値を渡すための varying 変数
varying vec4 vColor;

void main(){
    // マウスカーソルと頂点間を結ぶベクトルの長さを測る @@@
    float f = length(mouse - position.xy);

    // 出力用の頂点位置
    vec3 p = position;

    // もし一定の距離よりも近いなら、カーソルの位置に吸い付くようにする
    if(f < 0.5){
        p.xy = mouse;
    }
    gl_Position = vec4(p, 1.0);

    // フラグメントシェーダに頂点カラーをそのまま渡す
    vColor = color;
    // 頂点の大きさは頂点シェーダで設定する
    gl_PointSize = 8.0;
}
