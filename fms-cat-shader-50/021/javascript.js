let canvasElement = document.getElementById( 'canvas' );

gl3.initGL( canvasElement );
if( !gl3.ready ) { console.log( 'initialize error' ); return; }
let gl = gl3.gl;

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

let wordbufferH;
let wordbufferV;

let init = () => {
    let quadVert = [-1,1,0,-1,-1,0,1,1,0,1,-1,0];
    let quadVbo = [ gl3.create_vbo( quadVert ) ];

    let prg = gl3.program.create_from_source(
        WE.vs,
        WE.fs,
        [ 'position' ],
        [ 3 ],
        [ 'resolution', 'isVert', 'texture' ],
        [ '2fv', '1i', '1i' ]
    );
    if ( !prg ) { return; }

    let pPrg = gl3.program.create_from_source(
        WE.vsp,
        WE.fsp,
        [ 'position' ],
        [ 3 ],
        [ 'resolution', 'mouse', 'time', 'texture' ],
        [ '2fv', '2fv', '1f', '1i' ]
    );
    if ( !pPrg ) { return; }

    gl3.create_texture_fromsource( WE.images[ 'saikou.png' ], 0 );

    let bufferSize = 512;
    wordbufferH = gl3.create_framebuffer( bufferSize, bufferSize, 1 );
    wordbufferV = gl3.create_framebuffer( bufferSize, bufferSize, 2 );

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, gl3.textures[ 0 ].texture );
    gl.activeTexture( gl.TEXTURE1 );
    gl.bindTexture( gl.TEXTURE_2D, gl3.textures[ 1 ].texture );
    gl.activeTexture( gl.TEXTURE2 );
    gl.bindTexture( gl.TEXTURE_2D, gl3.textures[ 2 ].texture );

    let startTime = Date.now();

    let prepare = () => {
        let resolution = [ bufferSize, bufferSize ];

        gl.bindFramebuffer( gl.FRAMEBUFFER, wordbufferH.framebuffer );
        gl3.scene_clear( [ 0.0, 0.0, 0.0, 1.0 ] );
        gl3.scene_view( null, 0, 0, bufferSize, bufferSize );
        prg.set_program();
        prg.set_attribute( quadVbo );
        prg.push_shader( [ resolution, 0, 0 ] );
        gl3.draw_arrays( gl.TRIANGLE_STRIP, 4 );

        gl.bindFramebuffer( gl.FRAMEBUFFER, wordbufferV.framebuffer );
        gl3.scene_clear( [ 0.0, 0.0, 0.0, 1.0 ] );
        gl3.scene_view( null, 0, 0, bufferSize, bufferSize );
        prg.set_program();
        prg.set_attribute( quadVbo );
        prg.push_shader( [ resolution, 1, 1 ] );
        gl3.draw_arrays( gl.TRIANGLE_STRIP, 4 );
    };
    prepare();

    let update = () => {
        let nowTime = ( Date.now() - startTime ) * 0.001;
        let resolution = [ canvasWidth, canvasHeight ];

        gl.bindFramebuffer( gl.FRAMEBUFFER, null );
        gl3.scene_clear( [ 0.0, 0.0, 0.0, 1.0 ] );
        gl3.scene_view( null, 0, 0, canvasWidth, canvasHeight );
        pPrg.set_program();
        pPrg.set_attribute( quadVbo );
        pPrg.push_shader( [ resolution, mousePosition, nowTime, 2 ] );
        gl3.draw_arrays( gl.TRIANGLE_STRIP, 4 );

        gl.flush();
        if ( WE.run ) { requestAnimationFrame( update ); }
    };
    WE.run = true;
    update();
}
init();
