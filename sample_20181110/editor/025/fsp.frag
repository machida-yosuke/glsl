precision mediump float;
uniform sampler2D texture;    // フレームバッファに描画したレンダリング結果
uniform float     time;       // 時間の経過
uniform vec2      resolution; // スクリーン解像度

void main(){
    // テクスチャ座標
    vec2 texCoord = gl_FragCoord.st / resolution;

    // 正規化した座標を作る
    // -1 ~ 1
    vec2 p = texCoord * 2.0 - 1.0;

    // 正規化座標をベクトルとみなして長さを測る
    // 画面の中心ほどpが小さい
    float len = length(p);
    gl_FragColor = vec4(len,len,len, 1.0);
    
    // バレルディストーション
    vec2 barrel = p * (len + 2.5) * 0.2;
    // gl_FragColor = vec4(vec2(barrel), 1.0, 1.0);

    // ディストーションした後の座標をテクスチャ座標として使う
    // 座標系を元にもどす
    // -1 -1を0-1に変更する
    texCoord = (barrel + 1.0) * 0.5;
    // gl_FragColor = vec4(vec2(texCoord), 1.0, 1.0);

    // 赤い色を右側にずらすためのテクスチャ座標と色
    vec2 rTexCoord = texCoord + vec2(-abs(p.x) * 0.01, 0.0);
    vec4 redColor = texture2D(texture, rTexCoord);
    gl_FragColor = redColor;

    // 本来の色をテクスチャから読み出す
    vec4 samplerColor = texture2D(texture, texCoord);

    // それぞれの色を組み合わせる
    gl_FragColor = vec4(redColor.r, samplerColor.gba);
}
