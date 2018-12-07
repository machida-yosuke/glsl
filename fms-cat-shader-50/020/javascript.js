// canvasエレメントの取得
let canvasElement = document.getElementById( 'canvas' );

// WebGL, glCubicの初期化
gl3.initGL( canvasElement );
if( !gl3.ready ) { console.log( 'initialize error' ); return; }
let gl = gl3.gl;

// canvasサイズの決定
let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;
canvasElement.width = canvasWidth;
canvasElement.height = canvasHeight;

// マウスの位置．各次元，0.0-1.0で格納．
let mousePosition = [ 0.0, 0.0 ];
canvasElement.addEventListener( 'mousemove', ( _event ) => {
    let i = 1.0 / canvasWidth;
    mousePositionP = mousePosition;
    mousePosition = [
        ( _event.clientX - canvas.offsetLeft ) * i,
        1.0 - ( _event.clientY - canvas.offsetTop ) * i
    ];
}, true );

// 正方形ポリゴンの生成
let quadVert = [-1,1,0,-1,-1,0,1,1,0,1,-1,0];
let quadVbo = [ gl3.create_vbo( quadVert ) ];

// シェーダプログラム（prepare）の作成
let prg = gl3.program.create_from_source(
    WE.vs,
    WE.fs,
    [ 'position' ],
    [ 3 ],
    [ 'resolution', 'resoTextureRandom', 'textureRandom' ],
    [ '2fv', '2fv', '1i' ]
);
if ( !prg ) { return; }

// シェーダプログラムの作成
let pPrg = gl3.program.create_from_source(
    WE.vsp,
    WE.fsp,
    [ 'position' ],
    [ 3 ],
    [ 'resolution', 'mouse', 'time', 'textureNoise' ],
    [ '2fv', '2fv', '1f', '1i' ]
);
if ( !pPrg ) { return; }

// テクスチャのロード
let textureNumRandom = 0;
gl3.create_texture_fromsource( WE.images[ 'random.png' ], textureNumRandom );
let resoTextureRandom = [ 1024, 1024 ];

// フレームバッファを定義
let bufferSize = 1024;
let textureNumNoise = 1;
let framebufferNoise = gl3.create_framebuffer( bufferSize, bufferSize, textureNumNoise );

gl.activeTexture( gl.TEXTURE0 );
gl.bindTexture( gl.TEXTURE_2D, gl3.textures[ 0 ].texture );
gl.activeTexture( gl.TEXTURE1 );
gl.bindTexture( gl.TEXTURE_2D, gl3.textures[ 1 ].texture );

// 時間と解像度の変数の初期化
let startTime = Date.now();
let nowTime = 0;
let resolution = [ canvasWidth, canvasHeight ];

// ノイズの準備
let prepare = () => {
    let resolution = [ bufferSize, bufferSize ];
    
    gl.bindFramebuffer( gl.FRAMEBUFFER, framebufferNoise.framebuffer );
    gl3.scene_clear( [ 0.0, 0.0, 0.0, 1.0 ] );
    gl3.scene_view( null, 0, 0, bufferSize, bufferSize );
    prg.set_program();
    prg.set_attribute( quadVbo );
    prg.push_shader( [ resolution, resoTextureRandom, textureNumRandom ] );
    gl3.draw_arrays( gl.TRIANGLE_STRIP, 4 );
    gl.flush();
};
prepare();

// ループ
let render = () => {
    // 時間の更新
    nowTime = ( Date.now() - startTime ) / 1000.0;
    
    // 描画
    gl.bindFramebuffer( gl.FRAMEBUFFER, null );
    gl3.scene_clear( [ 0.0, 0.0, 0.0, 1.0 ] );
    gl3.scene_view( null, 0, 0, canvasWidth, canvasHeight );
    pPrg.set_program();
    pPrg.set_attribute( quadVbo );
    pPrg.push_shader( [ resolution, mousePosition, nowTime, textureNumNoise ] );
    gl3.draw_arrays( gl.TRIANGLE_STRIP, 4 );
    gl.flush();
    
    // run状態ならループする
    if ( WE.run ) { requestAnimationFrame( render ); }
};
WE.run = true;
render();
