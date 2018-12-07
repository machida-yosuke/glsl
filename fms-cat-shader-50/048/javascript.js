// canvasエレメントの取得
let canvasElement = document.getElementById( 'canvas' );

// WebGL, glCubicの初期化
gl3.initGL( canvasElement );
if( !gl3.ready ) { console.log( 'initialize error' ); return; }
let gl = gl3.gl;

// バッファ長の決定，小さければ小さいほど高レスポンス
let bufferSize = 2048;
let canvasWidth = bufferSize;
let canvasHeight = 1;
canvasElement.width = canvasWidth;
canvasElement.height = canvasHeight;
canvasElement.style.width = '512px';
canvasElement.style.height = '512px';

// オーディオ関連の初期化
let audio = new AudioContext();
let scriptProcessor = audio.createScriptProcessor( bufferSize );
scriptProcessor.connect( audio.destination );

// 正方形ポリゴンの生成
let quadVert = [-1,1,0,-1,-1,0,1,1,0,1,-1,0];
let quadVbo = [ gl3.create_vbo( quadVert ) ];

// シェーダプログラムの作成
let prg = gl3.program.create_from_source(
    WE.vs,
    WE.fs,
    [ 'position' ],
    [ 3 ],
    [ 'bufferSize', 'sampleStart', 'bspsr', 'textureRandom', 'textureRick' ],
    [ '1f', '1f', '1f', '1i', '1i' ]
);
if ( !prg ) { return; }

// テクスチャのロード
let textureNumRick = 0;
gl3.create_texture_fromsource( WE.images[ 'rick.png' ], textureNumRick );

gl.activeTexture( gl.TEXTURE0 );
gl.bindTexture( gl.TEXTURE_2D, gl3.textures[ textureNumRick ].texture );

// サンプル関連の変数の初期化
let sampleStart = 0;
let sampleRate = audio.sampleRate; // サンプルレート
let bspsr = bufferSize / sampleRate;

// シェーダ出力結果をscriptProcessorに渡すための配列
let pixels = new Uint8Array( bufferSize * 4 );

// なぜかWE.runがうまく動かない……
let stop = false;

// ループ
scriptProcessor.onaudioprocess = ( _event ) => {
    // バッファ配列の取得
    let outL = _event.outputBuffer.getChannelData( 0 );
    let outR = _event.outputBuffer.getChannelData( 1 );
    
    // runして無ければ止める
    if ( !WE.run ) { stop = true; }
    if ( stop ) {
        for ( let i = 0; i < bufferSize; i ++ ) {
            outL[ i ] = 0.0;
            outR[ i ] = 0.0;
        }
        return;
    }

    // 描画
    gl.bindFramebuffer( gl.FRAMEBUFFER, null );
    gl.blendFunc( gl.ONE, gl.ONE );
    gl3.scene_clear( [ 0.0, 0.0, 0.0, 0.0 ] );
    gl3.scene_view( null, 0, 0, bufferSize, 1 );
    prg.set_program();
    prg.set_attribute( quadVbo );
    prg.push_shader( [ bufferSize, sampleStart, bspsr, textureNumRick ] );
    gl3.draw_arrays( gl.TRIANGLE_STRIP, 4 );
    gl.flush();
    
    // シェーダ出力結果をscriptProcessorに渡す
    gl.readPixels( 0, 0, bufferSize, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels );
    for ( let i = 0; i < bufferSize; i ++ ) {
        outL[ i ] = ( ( pixels[ i * 4 + 0 ] - 128 ) * 256 + pixels[ i * 4 + 1 ] ) / 32768.0;
        outR[ i ] = ( ( pixels[ i * 4 + 2 ] - 128 ) * 256 + pixels[ i * 4 + 3 ] ) / 32768.0;
    }
    
    // サンプル位置を1増やす
    sampleStart ++;
};
WE.run = true;
