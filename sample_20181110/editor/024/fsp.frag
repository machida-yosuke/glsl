precision mediump float;
uniform sampler2D texture;    // フレームバッファに描画したレンダリング結果
uniform float     time;       // 時間の経過
uniform vec2      resolution; // スクリーン解像度

void main(){
    // テクスチャ座標
    vec2 texCoord = gl_FragCoord.st / resolution;

    // 正規化した座標を作る
    // 0-1だったものを-1から１に変更しそど真ん中を原点にする
    vec2 p = texCoord * 2.0 - 1.0;

    // 赤い色を右側にずらすためのテクスチャ座標と色
    // 絶対値　abs マイナスをプラスに
    vec2 rTexCoord = texCoord + vec2(abs(p.x) * cos(time), abs(p.x) * sin(time));
    vec4 redColor = texture2D(texture, rTexCoord);

    // 本来の色をテクスチャから読み出す
    vec4 samplerColor = texture2D(texture, texCoord);

    // それぞれの色を組み合わせる
    gl_FragColor = vec4(redColor.r, samplerColor.gba);
}
