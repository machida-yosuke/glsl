// JavaScript から VBO 経由で送られてきた頂点座標
attribute vec3 position;
// 頂点シェーダプログラムのエントリポイントとなる関数（名前は必ず main とする）
void main(){
    // 頂点シェーダから出力する頂点の座標
    gl_Position = vec4(position, 1.0);
    // 頂点の大きさは頂点シェーダで設定する
    gl_PointSize = 8.0;
}
