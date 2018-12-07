#define saturate(i) clamp(i,0.,1.)

// 浮動小数点の精度の設定
precision mediump float;

// JSから渡される変数の定義
uniform vec2 resolution;
uniform bool isVert;
uniform sampler2D texture;

// ------

// 文字の内側か外側か
bool isSameSide( float _col, bool _inside ) {
    return ( _col < 0.0 ) == _inside;
}

// 文字の境界までの距離を返す．内側であればマイナス
float getDist( vec4 _i ) {
    return isVert ? ( _i.x - _i.y ) * 255.0 : ( _i.w < 0.5 ? 1E3 : -1E3 );
}

void main() {
    vec2 p = gl_FragCoord.xy; // ピクセル位置
    vec2 gap = isVert ? vec2( 0.0, 1.0 ) : vec2( 1.0, 0.0 ); // 探索方向

    float dist = getDist( texture2D( texture, p / resolution ) ); // 現在ピクセルの文字までの距離
    bool inside = isSameSide( dist, true ); // 内側ならtrue

    dist = abs( dist ); // 現在ピクセルの文字までの距離を絶対値に

    // 探索
    for ( int iLoop = 1; iLoop < 256; iLoop ++ ) {
        float i = float( iLoop );
        if ( dist < i ) { break; } // これ以上距離の近いピクセルが見つかりそうにないならbreak

        for ( int iiLoop = -1; iiLoop < 2; iiLoop += 2 ) { // 前と後ろ
            float ii = float( iiLoop );
            vec2 tCoord = p + ii * i * gap; // 探索ピクセルの座標
            if ( 0.0 <= tCoord.x && tCoord.x < resolution.x && 0.0 <= tCoord.y && tCoord.y < resolution.y ) { // 探索ピクセルがテクスチャの範囲内なら
                float col = getDist( texture2D( texture, tCoord / resolution ) ); // 探索ピクセルの距離を取得
                dist = min(
                    dist,
                    length( vec2( i, isSameSide( col, inside ) ? col : 0.0 ) )
                ); // 短い方に距離を更新
            }
        }
    }

    // 距離を返す
    dist = inside ? -dist : dist;
    gl_FragColor = vec4( max( 0.0, dist ) / 255.0, -min( dist, 0.0 ) / 255.0, 0.0, 1.0 );
}
