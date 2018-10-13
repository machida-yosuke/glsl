
(() => {
    let canvas;             // canvas element
    let canvasWidth;        // canvas の幅
    let canvasHeight;       // canvas の高さ
    let gl;                 // canvas から取得した WebGL のコンテキスト
    let ext;                // WebGL の拡張機能を格納する
    let startTime;          // 描画を開始した際のタイムスタンプ
    let nowTime;            // 描画を開始してからの経過時間
    let mouse = [0.0, 0.0]; // マウス座標を格納するための変数

    let scenePrg; // シーン描画用プログラム

    // このスクリプトの最後に呼ばれる関数としてエントリポイントを作成
    function main(){
        // canvas element を取得しサイズをウィンドウサイズに設定
        canvas        = document.getElementById('canvas');
        canvasWidth   = window.innerWidth;
        canvasHeight  = window.innerHeight;
        canvas.width  = canvasWidth;
        canvas.height = canvasHeight;
        // webgl コンテキストを初期化
        gl = canvas.getContext('webgl');
        // コンテキストが取得できたかどうかを確認
        if(gl == null){
            console.log('webgl unsupported');
            return;
        }
        // 拡張機能を有効化
        ext = getWebGLExtensions();
        // Esc キーで実行を止められるようにイベントを設定
        window.addEventListener('keydown', (eve) => {
            // 入力されたキーが Esc キーなら実行フラグを降ろす
            WE.run = eve.keyCode !== 27;
        }, false);
        // マウスの移動に応じて配列の中身を更新する
        window.addEventListener('mousemove', (eve) => {
            // client 座標を正規化して -1.0 ～ 1.0 の範囲に変換する
            let x = (eve.clientX / canvasWidth) * 2.0 - 1.0;
            let y = (eve.clientY / canvasHeight) * 2.0 - 1.0;
            mouse = [x, -y];
        }, false);
        // 外部ファイルのシェーダのソースを取得しプログラムオブジェクトを生成
        let vs = createShader(WE.vs, gl.VERTEX_SHADER);
        let fs = createShader(WE.fs, gl.FRAGMENT_SHADER);
        let prg = createProgram(vs, fs);
        if(prg == null){return;}
        scenePrg = new ProgramParameter(prg);
        // 初期化処理を呼び出す
        init();
    }

    // 頂点の情報などあらゆる初期化処理を行い描画開始の準備をする
    function init(texture){
        // プログラムオブジェクトから attribute location を取得しストライドを設定する
        scenePrg.attLocation[0] = gl.getAttribLocation(scenePrg.program, 'position');
        scenePrg.attLocation[1] = gl.getAttribLocation(scenePrg.program, 'color');
        scenePrg.attStride[0]   = 3;
        scenePrg.attStride[1]   = 4;
        // プログラムオブジェクトから unifrom location を取得しタイプを設定する
        scenePrg.uniLocation[0] = gl.getUniformLocation(scenePrg.program, 'mouse');
        scenePrg.uniType[0]     = 'uniform2fv';
        // 頂点座標を定義する
        let position = [
             0.0,  0.0,  0.0, // 1 つ目の頂点の X, Y, Z
             1.0,  1.0,  0.0, // 2 つ目の頂点の X, Y, Z
            -1.0,  1.0,  0.0, // 3 つ目の頂点の X, Y, Z
             1.0, -1.0,  0.0, // 4 つ目の頂点の X, Y, Z
            -1.0, -1.0,  0.0  // 5 つ目の頂点の X, Y, Z
        ];
        // 頂点カラーを定義する
        let color = [
            1.0, 1.0, 1.0, 1.0, // 1 つ目の頂点の R, G, B, A
            1.0, 0.0, 0.0, 1.0, // 2 つ目の頂点の R, G, B, A
            0.0, 1.0, 0.0, 1.0, // 3 つ目の頂点の R, G, B, A
            0.0, 0.0, 1.0, 1.0, // 4 つ目の頂点の R, G, B, A
            0.5, 0.5, 0.5, 1.0  // 5 つ目の頂点の R, G, B, A
        ];
        // 頂点座標の配列から VBO（Vertex Buffer Object）を生成する
        let VBO = [
            createVbo(position),
            createVbo(color)
        ];

        // 頂点をどのように結ぶかをインデックスで指定する @@@
        let index = [
            0, 1, 2, 0, 4, 3
        ];
        // インデックス配列から IBO（Index Buffer Object）を生成しておく @@@
        let IBO = createIbo(index);

        // WebGL で canvas をクリアする色の設定
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // 未初期化の変数を初期化する
        startTime = Date.now();
        nowTime = 0;
        WE.run = true;
        // レンダリングを開始
        render();
        function render(){
            // 描画開始からの経過時間（秒単位）
            nowTime = (Date.now() - startTime) / 1000;
            // ウィンドウサイズの変更に対応するため canvas のサイズを更新
            canvasWidth   = window.innerWidth;
            canvasHeight  = window.innerHeight;
            canvas.width  = canvasWidth;
            canvas.height = canvasHeight;
            // canvas のサイズとビューポートの大きさを揃える
            gl.viewport(0, 0, canvasWidth, canvasHeight);
            // どのプログラムオブジェクトを利用するか設定
            gl.useProgram(scenePrg.program);
            // uniform 変数をリアルタイムにシェーダにプッシュする
            gl[scenePrg.uniType[0]](scenePrg.uniLocation[0], mouse);

            // VBO と IBO を有効化する @@@
            setAttribute(VBO, scenePrg.attLocation, scenePrg.attStride, IBO);

            // 事前に設定済みの色でクリアする
            gl.clear(gl.COLOR_BUFFER_BIT);

            // バインドした VBO と IBO にもとづき頂点を描画する @@@
            gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

            // GPU 上のコマンドバッファを確実に実行させる
            gl.flush();
            // render を再帰呼出しして描画処理をループさせる
            if(WE.run){requestAnimationFrame(render);}
        }
    }

    // utility ================================================================
    /**
     * プログラムオブジェクトやシェーダに関するパラメータを格納するためのクラス
     * @class
     */
    class ProgramParameter {
        /**
         * @constructor
         * @param {WebGLProgram} program - プログラムオブジェクト
         */
        constructor(program){
            /**
             * @type {WebGLProgram} プログラムオブジェクト
             */
            this.program = program;
            /**
             * @type {Array} attribute location を格納する配列
             */
            this.attLocation = [];
            /**
             * @type {Array} attribute stride を格納する配列
             */
            this.attStride = [];
            /**
             * @type {Array} uniform location を格納する配列
             */
            this.uniLocation = [];
            /**
             * @type {Array} uniform 変数のタイプを格納する配列
             */
            this.uniType = [];
        }
    }

    /**
     * XHR でシェーダのソースコードを外部ファイルから取得しコールバックを呼ぶ。
     * @param {string} vsPath - 頂点シェーダの記述されたファイルのパス
     * @param {string} fsPath - フラグメントシェーダの記述されたファイルのパス
     * @param {function} callback - コールバック関数（読み込んだソースコードを引数に与えて呼び出される）
     */
    function loadShaderSource(vsPath, fsPath, callback){
        let vs, fs;
        xhr(vsPath, true);
        xhr(fsPath, false);
        function xhr(source, isVertex){
            let xml = new XMLHttpRequest();
            xml.open('GET', source, true);
            xml.setRequestHeader('Pragma', 'no-cache');
            xml.setRequestHeader('Cache-Control', 'no-cache');
            xml.onload = () => {
                if(isVertex){
                    vs = xml.responseText;
                }else{
                    fs = xml.responseText;
                }
                if(vs != null && fs != null){
                    console.log('loaded', vsPath, fsPath);
                    callback({vs: vs, fs: fs});
                }
            };
            xml.send();
        }
    }

    /**
     * シェーダオブジェクトを生成して返す。
     * コンパイルに失敗した場合は理由をアラートし null を返す。
     * @param {string} source - シェーダのソースコード文字列
     * @param {number} type - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
     * @return {WebGLShader} シェーダオブジェクト
     */
    function createShader(source, type){
        let shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            return shader;
        }else{
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
    }

    /**
     * プログラムオブジェクトを生成して返す。
     * シェーダのリンクに失敗した場合は理由をアラートし null を返す。
     * @param {WebGLShader} vs - 頂点シェーダオブジェクト
     * @param {WebGLShader} fs - フラグメントシェーダオブジェクト
     * @return {WebGLProgram} プログラムオブジェクト
     */
    function createProgram(vs, fs){
        if(vs == null || fs == null){return;}
        let program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if(gl.getProgramParameter(program, gl.LINK_STATUS)){
            gl.useProgram(program);
            return program;
        }else{
            alert(gl.getProgramInfoLog(program));
            return null;
        }
    }

    /**
     * VBO を生成して返す。
     * @param {Array} data - 頂点属性データを格納した配列
     * @return {WebGLBuffer} VBO
     */
    function createVbo(data){
        let vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return vbo;
    }

    /**
     * IBO を生成して返す。
     * @param {Array} data - インデックスデータを格納した配列
     * @return {WebGLBuffer} IBO
     */
    function createIbo(data){
        let ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        return ibo;
    }

    /**
     * IBO を生成して返す。(INT 拡張版)
     * @param {Array} data - インデックスデータを格納した配列
     * @return {WebGLBuffer} IBO
     */
    function createIboInt(data){
        let ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        return ibo;
    }

    /**
     * VBO を IBO をバインドし有効化する。
     * @param {Array} vbo - VBO を格納した配列
     * @param {Array} attL - attribute location を格納した配列
     * @param {Array} attS - attribute stride を格納した配列
     * @param {WebGLBuffer} ibo - IBO
     */
    function setAttribute(vbo, attL, attS, ibo){
        for(let i in vbo){
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
            gl.enableVertexAttribArray(attL[i]);
            gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
        }
        if(ibo != null){
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        }
    }

    /**
     * 画像ファイルを読み込み、テクスチャを生成してコールバックで返却する。
     * @param {string} source - ソースとなる画像のパス
     * @param {function} callback - コールバック関数（第一引数にテクスチャオブジェクトが入った状態で呼ばれる）
     */
    function createTexture(source, callback){
        let img = new Image();
        img.addEventListener('load', () => {
            let tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.bindTexture(gl.TEXTURE_2D, null);
            callback(tex);
        }, false);
        img.src = source;
    }

    /**
     * フレームバッファを生成して返す。
     * @param {number} width - フレームバッファの幅
     * @param {number} height - フレームバッファの高さ
     * @return {object} 生成した各種オブジェクトはラップして返却する
     * @property {WebGLFramebuffer} framebuffer - フレームバッファ
     * @property {WebGLRenderbuffer} renderbuffer - 深度バッファとして設定したレンダーバッファ
     * @property {WebGLTexture} texture - カラーバッファとして設定したテクスチャ
     */
    function createFramebuffer(width, height){
        let frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        let depthRenderBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer);
        let fTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, fTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return {framebuffer: frameBuffer, renderbuffer: depthRenderBuffer, texture: fTexture};
    }

    /**
     * フレームバッファを生成して返す。（フロートテクスチャ版）
     * @param {object} ext - getWebGLExtensions の戻り値
     * @param {number} width - フレームバッファの幅
     * @param {number} height - フレームバッファの高さ
     * @return {object} 生成した各種オブジェクトはラップして返却する
     * @property {WebGLFramebuffer} framebuffer - フレームバッファ
     * @property {WebGLTexture} texture - カラーバッファとして設定したテクスチャ
     */
    function createFramebufferFloat(ext, width, height){
        if(ext == null || (ext.textureFloat == null && ext.textureHalfFloat == null)){
            console.log('float texture not support');
            return;
        }
        let flg = (ext.textureFloat != null) ? gl.FLOAT : ext.textureHalfFloat.HALF_FLOAT_OES;
        let frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        let fTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, fTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, flg, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return {framebuffer: frameBuffer, texture: fTexture};
    }

    /**
     * 主要な WebGL の拡張機能を取得する。
     * @return {object} 取得した拡張機能
     * @property {object} elementIndexUint - Uint32 フォーマットを利用できるようにする
     * @property {object} textureFloat - フロートテクスチャを利用できるようにする
     * @property {object} textureHalfFloat - ハーフフロートテクスチャを利用できるようにする
     */
    function getWebGLExtensions(){
        return {
            elementIndexUint: gl.getExtension('OES_element_index_uint'),
            textureFloat:     gl.getExtension('OES_texture_float'),
            textureHalfFloat: gl.getExtension('OES_texture_half_float')
        };
    }

    main();
})();
