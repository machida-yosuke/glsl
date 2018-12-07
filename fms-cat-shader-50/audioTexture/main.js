let width = 512;
let height = 512;

let canvas = document.createElement( 'canvas' );
canvas.width = width;
canvas.height = height;
container.appendChild( canvas );
let context = canvas.getContext( '2d' );

let xhr = new XMLHttpRequest();
xhr.onload = () => {
  let array = new Uint8Array( xhr.response );
  console.log( array );

  let imageData = context.createImageData( width, height );
  for ( let i = 0; i < width * height; i ++ ) {
    imageData.data[ i * 4 + 0 ] = ( array[ 44 + i * 4 + 1 ] + 128 ) % 256;
    imageData.data[ i * 4 + 1 ] = 255;
    imageData.data[ i * 4 + 2 ] = ( array[ 44 + i * 4 + 3 ] + 128 ) % 256;
    imageData.data[ i * 4 + 3 ] = 255;
  }
  context.putImageData( imageData, 0, 0 );
};
xhr.responseType = 'arraybuffer';
xhr.open( 'GET', './rick.wav', true );
xhr.send();