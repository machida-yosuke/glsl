attribute vec3 position;
varying   vec2 vTexCoord;

void main(){
    // ポストプロセスでは全画面表示なので正規化デバイス座標を意識しつつ
    // position の値をそのまま gl_Position に代入する
    gl_Position = vec4(position, 1.0);

    // テクスチャ座標は position から生成してしまう
    vTexCoord = (position.xy + 1.0) * 0.5;
}
