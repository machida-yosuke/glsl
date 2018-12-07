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

// キー状態．
let keyState = [ 0.0, 0.0, 0.0, 0.0 ];
window.addEventListener( 'keydown', ( _event ) => {
    if ( _event.which === 82 ) { keyState[ 0 ] = 1.0; }
    if ( _event.which === 70 ) { keyState[ 1 ] = 1.0; }
    if ( _event.which === 85 ) { keyState[ 2 ] = 1.0; }
    if ( _event.which === 74 ) { keyState[ 3 ] = 1.0; }
    console.log( _event.which );
}, true );

window.addEventListener( 'keyup', ( _event ) => {
    if ( _event.which === 82 ) { keyState[ 0 ] = 0.0; }
    if ( _event.which === 70 ) { keyState[ 1 ] = 0.0; }
    if ( _event.which === 85 ) { keyState[ 2 ] = 0.0; }
    if ( _event.which === 74 ) { keyState[ 3 ] = 0.0; }
}, true );

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
    [ 'resolution', 'keyState', 'time', 'prevScene' ],
    [ '2fv', '4fv', '1f', '1i' ]
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
    prg.push_shader( [ resolution, keyState, nowTime, 1 - bufferIndex ] );
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
    
    if ( WE.run ) { requestAnimationFrame( render ); } // ループ
};

// レンダ開始
WE.run = true;
render();