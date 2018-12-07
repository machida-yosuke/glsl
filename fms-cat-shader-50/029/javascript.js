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

// シェーダプログラムの作成
let prg = gl3.program.create_from_source(
    WE.vs,
    WE.fs,
    [ 'position' ],
    [ 3 ],
    [ 'resolution', 'mouse', 'time', 'textureChroma', 'textureBg' ],
    [ '2fv', '2fv', '1f', '1i', '1i' ]
);
if ( !prg ) { return; }

// テクスチャのロード
let textureNumChroma = 0;
gl3.create_texture_canvas( WE.images[ 'chroma.jpg' ], textureNumChroma );
let textureNumBg = 1;
gl3.create_texture_canvas( WE.images[ 'tokyo.jpg' ], textureNumBg );

gl.activeTexture( gl.TEXTURE0 );
gl.bindTexture( gl.TEXTURE_2D, gl3.textures[ 0 ].texture );
gl.activeTexture( gl.TEXTURE1 );
gl.bindTexture( gl.TEXTURE_2D, gl3.textures[ 1 ].texture );

// 時間と解像度の変数の初期化
let startTime = Date.now();
let resolution = [ canvasWidth, canvasHeight ];

// ループ
let update = () => {
    // 時間の更新
    let nowTime = ( Date.now() - startTime ) * 0.001;

    // 描画
    gl.bindFramebuffer( gl.FRAMEBUFFER, null );
    gl3.scene_clear( [ 0.0, 0.0, 0.0, 1.0 ] );
    gl3.scene_view( null, 0, 0, canvasWidth, canvasHeight );
    prg.set_program();
    prg.set_attribute( quadVbo );
    prg.push_shader( [ resolution, mousePosition, nowTime, textureNumChroma, textureNumBg ] );
    gl3.draw_arrays( gl.TRIANGLE_STRIP, 4 );
    gl.flush();
    
    // run状態ならループする
    if ( WE.run ) { requestAnimationFrame( update ); }
};
WE.run = true;
update();
