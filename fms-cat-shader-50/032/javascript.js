// canvasの取得
let canvasElement = document.getElementById( 'canvas' );

// glcubicの初期化
gl3.initGL( canvasElement );
if( !gl3.ready ) { console.log( 'initialize error' ); return; }
let gl = gl3.gl;

// キャンバスのサイズを決定
let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;
canvasElement.width = canvasWidth;
canvasElement.height = canvasHeight;

// ------

// マウスの位置．各次元，0.0-1.0で格納．
let mousePosition = [ 0.0, 0.0 ];
let mousePositionP = [ 0.0, 0.0 ]; // 1フレーム前の位置
canvasElement.addEventListener( 'mousemove', ( _event ) => {
    let i = 1.0 / canvasWidth;
    mousePositionP = mousePosition;
    mousePosition = [
        ( _event.clientX - canvas.offsetLeft ) * i,
        1.0 - ( _event.clientY - canvas.offsetTop ) * i
    ];
}, true );

// マウスのクリック状態。xは押し続け、yは押した瞬間
let mouseDown = [ 0, 0 ];
canvasElement.addEventListener( 'mousedown', ( _event ) => {
    mouseDown[ 0 ] = 1;
    mouseDown[ 1 ] = 1;
} );
canvasElement.addEventListener( 'mouseup', ( _event ) => {
    mouseDown[ 0 ] = 0;
} );

// ------

// 板ポリを定義
let quadVert = [-1,1,0,-1,-1,0,1,1,0,1,-1,0];
let quadVbo = [ gl3.create_vbo( quadVert ) ];

// シェーダプログラムを作成
let prg = gl3.program.create_from_source(
    WE.vs,
    WE.fs,
    [ 'position' ],
    [ 3 ],
    [ 'resolution', 'mouse', 'mouseP', 'mouseDown', 'time', 'prevScene' ],
    [ '2fv', '2fv', '2fv', '2fv', '1f', '1i' ]
);
if ( !prg ) { return; }

// シェーダプログラム（入力をそのまま出すだけ）を作成
let rPrg = gl3.program.create_from_source(
    'attribute vec3 position;void main(){gl_Position=vec4(position,1.0);}',
    'precision mediump float;uniform vec2 resolution;uniform sampler2D texture;void main(){gl_FragColor=texture2D(texture,gl_FragCoord.xy/resolution);}',
    [ 'position' ],
    [ 3 ],
    [ 'resolution', 'texture' ],
    [ '2fv', '1i' ]
);
if ( !rPrg ) { return; }

// フレームバッファを定義
let bufferSize = 512;
let bufferIndex = 0;
let backbuffers = [
    gl3.create_framebuffer( bufferSize, bufferSize, 0 ),
    gl3.create_framebuffer( bufferSize, bufferSize, 1 )
];
gl.activeTexture( gl.TEXTURE0 );
gl.bindTexture( gl.TEXTURE_2D, gl3.textures[ 0 ].texture );
gl.activeTexture( gl.TEXTURE1 );
gl.bindTexture( gl.TEXTURE_2D, gl3.textures[ 1 ].texture );

// 時間・解像度
let startTime = Date.now();
let nowTime = 0;
let resolution = [ bufferSize, bufferSize ];

let render = () => {
    bufferIndex = 1 - bufferIndex; // バッファのインデックスを0<->1で入れ替える
    nowTime = ( Date.now() - startTime ) / 1000.0; // 現在時刻を取得

    // 描画
    gl.bindFramebuffer( gl.FRAMEBUFFER, backbuffers[ bufferIndex ].framebuffer );
    gl3.scene_clear( [ 0.0, 0.0, 0.0, 1.0 ] );
    gl3.scene_view( null, 0, 0, bufferSize, bufferSize );
    prg.set_program();
    prg.set_attribute( quadVbo );
    prg.push_shader( [ resolution, mousePosition, mousePositionP, mouseDown, nowTime, 1 - bufferIndex ] );
    gl3.draw_arrays( gl.TRIANGLE_STRIP, 4 );
    
    // バッファに書き込んだ内容をそのまま出力
    gl.bindFramebuffer( gl.FRAMEBUFFER, null );
    gl3.scene_clear( [ 0.0, 0.0, 0.0, 1.0 ] );
    gl3.scene_view( null, 0, 0, bufferSize, bufferSize );
    rPrg.set_program();
    rPrg.set_attribute( quadVbo );
    rPrg.push_shader( [ resolution, 1 - bufferIndex ] );
    gl3.draw_arrays( gl.TRIANGLE_STRIP, 4 );
    
    gl.flush();
    
    mouseDown[ 1 ] = 0; // mouseDownのyを0に
    if ( WE.run ) { requestAnimationFrame( render ); } // ループ
};

// レンダ開始
WE.run = true;
render();