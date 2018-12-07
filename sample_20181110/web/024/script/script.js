
(() => {
    let canvas;       // canvas element
    let canvasWidth;  // canvas の幅
    let canvasHeight; // canvas の高さ
    let gl;           // canvas から取得した WebGL のコンテキスト
    let ext;          // WebGL の拡張機能を格納する
    let run;          // WebGL の実行フラグ
    let mat;          // 行列処理系クラス
    let qtn;          // クォータニオン処理系クラス
    let startTime;    // 描画を開始した際のタイムスタンプ
    let nowTime;      // 描画を開始してからの経過時間
    let camera;       // カメラ管理用変数

    let scenePrg; // シーン描画用プログラム
    let postPrg;  // ポストプロセス用プログラム

    // ウィンドウのロードが完了したら WebGL 関連の処理をスタートする
    window.addEventListener('load', () => {
        canvas        = document.getElementById('canvas');
        canvasWidth   = window.innerWidth;
        canvasHeight  = window.innerHeight;
        canvas.width  = canvasWidth;
        canvas.height = canvasHeight;
        // webgl コンテキストを初期化
        gl = canvas.getContext('webgl');
        if(gl == null){
            console.log('webgl unsupported');
            return;
        }
        // 各種変数の初期化
        ext = getWebGLExtensions();
        mat = new matIV();
        qtn = new qtnIV();
        camera = new InteractionCamera();
        camera.update();
        // Esc キーで実行を止められるようにイベントを設定
        window.addEventListener('keydown', (eve) => {
            run = eve.keyCode !== 27;
        }, false);
        // マウス関連イベントの登録
        canvas.addEventListener('mousedown', camera.startEvent, false);
        canvas.addEventListener('mousemove', camera.moveEvent, false);
        canvas.addEventListener('mouseup', camera.endEvent, false);
        canvas.addEventListener('wheel', camera.wheelEvent, false);

        // 外部ファイルのシェーダのソースを取得しプログラムオブジェクトを生成
        loadShaderSource(
            './shader/scene.vert',
            './shader/scene.frag',
            (shader) => {
                let vs = createShader(shader.vs, gl.VERTEX_SHADER);
                let fs = createShader(shader.fs, gl.FRAGMENT_SHADER);
                let prg = createProgram(vs, fs);
                if(prg == null){return;}
                scenePrg = new ProgramParameter(prg);
                loadCheck();
            }
        );
        loadShaderSource(
            './shader/post.vert',
            './shader/post.frag',
            (shader) => {
                let vs = createShader(shader.vs, gl.VERTEX_SHADER);
                let fs = createShader(shader.fs, gl.FRAGMENT_SHADER);
                let prg = createProgram(vs, fs);
                if(prg == null){return;}
                postPrg = new ProgramParameter(prg);
                loadCheck();
            }
        );
        // シェーダのロードが完了したかチェックし init を呼び出す
        function loadCheck(){
            if(
                scenePrg != null &&
                postPrg != null &&
                true
            ){init();}
        }
    }, false);

    function init(texture){
        // シーン描画用の attribute や uniform 関連の設定
        scenePrg.attLocation[0] = gl.getAttribLocation(scenePrg.program, 'position');
        scenePrg.attLocation[1] = gl.getAttribLocation(scenePrg.program, 'color');
        scenePrg.attStride[0]   = 3;
        scenePrg.attStride[1]   = 4;
        scenePrg.uniLocation[0] = gl.getUniformLocation(scenePrg.program, 'mvpMatrix');
        scenePrg.uniType[0]     = 'uniformMatrix4fv';
        // ポストプロセス用の attribute や uniform 関連の設定
        postPrg.attLocation[0] = gl.getAttribLocation(postPrg.program, 'position');
        postPrg.attStride[0]   = 3;
        postPrg.uniLocation[0] = gl.getUniformLocation(postPrg.program, 'texture');
        postPrg.uniLocation[1] = gl.getUniformLocation(postPrg.program, 'time');
        postPrg.uniLocation[2] = gl.getUniformLocation(postPrg.program, 'resolution');
        postPrg.uniType[0]     = 'uniform1i';
        postPrg.uniType[1]     = 'uniform1f';
        postPrg.uniType[2]     = 'uniform2fv';
        // 頂点座標を定義する
        let position = [
            -1.0,  1.0,  0.0, // 1 つ目の頂点の X, Y, Z
             1.0,  1.0,  0.0, // 2 つ目の頂点の X, Y, Z
            -1.0, -1.0,  0.0, // 3 つ目の頂点の X, Y, Z
             1.0, -1.0,  0.0  // 4 つ目の頂点の X, Y, Z
        ];
        // 頂点カラーを定義する
        let color = [
            1.0, 1.0, 1.0, 1.0, // 1 つ目の頂点の R, G, B, A
            1.0, 1.0, 1.0, 1.0, // 2 つ目の頂点の R, G, B, A
            1.0, 1.0, 1.0, 1.0, // 3 つ目の頂点の R, G, B, A
            1.0, 1.0, 1.0, 1.0  // 4 つ目の頂点の R, G, B, A
        ];
        // 頂点座標の配列から VBO（Vertex Buffer Object）を生成する
        let VBO = [
            createVbo(position),
            createVbo(color)
        ];
        // ポストプロセスで全画面表示するための VBO
        let postVBO = [
            createVbo(position)
        ];
        // 頂点をどのように結ぶかをインデックスで指定する
        let index = [
            0, 2, 1, 1, 2, 3
        ];
        // インデックス配列から IBO（Index Buffer Object）を生成しておく
        let IBO = createIbo(index);

        // フレームバッファの生成
        let fBuffer = createFramebuffer(canvasWidth, canvasHeight);
        // フレームバッファ内部のテクスチャをバインド
        gl.bindTexture(gl.TEXTURE_2D, fBuffer.texture);

        // 行列関連変数の宣言と初期化
        let mMatrix   = mat.identity(mat.create());
        let vMatrix   = mat.identity(mat.create());
        let pMatrix   = mat.identity(mat.create());
        let vpMatrix  = mat.identity(mat.create());
        let mvpMatrix = mat.identity(mat.create());
        let qtnMatrix = mat.identity(mat.create());

        // WebGL API 関連の初期設定
        gl.clearColor(0.1, 0.1, 0.1, 1.0); // クリアする色
        gl.clearDepth(1.0);                // クリアする深度
        gl.enable(gl.DEPTH_TEST);          // 深度テストを有効化

        // 未初期化の変数を初期化する
        startTime = Date.now();
        nowTime = 0;
        run = true;

        render();

        function render(){
            // 描画開始からの経過時間（秒単位）
            nowTime = (Date.now() - startTime) / 1000;
            // ウィンドウサイズの変更に対応するため canvas のサイズを更新
            canvasWidth   = window.innerWidth;
            canvasHeight  = window.innerHeight;
            canvas.width  = canvasWidth;
            canvas.height = canvasHeight;

            // まず最初にフレームバッファにシーンを焼く -----------------------
            // フレームバッファのバインド
            gl.bindFramebuffer(gl.FRAMEBUFFER, fBuffer.framebuffer);
            gl.useProgram(scenePrg.program);

            // ビューポートを設定し事前に設定済みの色と深度でクリアする
            gl.viewport(0, 0, canvasWidth, canvasHeight);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // カメラ関連のパラメータ
            let cameraPosition    = [0.0, 0.0, 15.0];
            let centerPoint       = [0.0, 0.0, 0.0];
            let cameraUpDirection = [0.0, 1.0, 0.0];
            let fovy   = 60 * camera.scale;
            let aspect = canvasWidth / canvasHeight;
            let near   = 0.1;
            let far    = 50.0;

            // ビュー・プロジェクション座標変換行列
            mat.lookAt(cameraPosition, centerPoint, cameraUpDirection, vMatrix);
            mat.perspective(fovy, aspect, near, far, pMatrix);
            mat.multiply(pMatrix, vMatrix, vpMatrix);
            camera.update();
            mat.identity(qtnMatrix);
            qtn.toMatIV(camera.qtn, qtnMatrix);
            mat.multiply(vpMatrix, qtnMatrix, vpMatrix);

            // フレームバッファに描画するための VBO と IBO を有効化
            setAttribute(VBO, scenePrg.attLocation, scenePrg.attStride, IBO);
            // ループ構造で複数のポリゴンを配置する @@@
            const COUNT = 10;
            const WIDTH = 25.0;
            const OFFSET = WIDTH / COUNT;
            for(let i = 0; i < COUNT; ++i){
                let x = -(WIDTH / 2.0) + OFFSET / 2.0 + OFFSET * i;
                for(let j = 0; j < COUNT; ++j){
                    let y = -(WIDTH / 2.0) + OFFSET / 2.0 + OFFSET * j;
                    mat.identity(mMatrix);
                    mat.translate(mMatrix, [x, y, 0.0], mMatrix);
                    mat.rotate(mMatrix, nowTime * 0.5, [1.0, 1.0, 0.0], mMatrix);
                    mat.multiply(vpMatrix, mMatrix, mvpMatrix);
                    gl[scenePrg.uniType[0]](scenePrg.uniLocation[0], false, mvpMatrix);
                    gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
                }
            }
            // フレームバッファに対する描画はここまで -------------------------

            // フレームバッファに焼いた描画結果を使ってポストプロセスを描画
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            // プログラムオブジェクトの切り替え
            gl.useProgram(postPrg.program);
            // シーンをクリア
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            // ポストプロセス用の VBO を有効化
            setAttribute(postVBO, postPrg.attLocation, postPrg.attStride, IBO);
            // uniform 変数をプッシュ
            gl[postPrg.uniType[0]](postPrg.uniLocation[0], 0);
            gl[postPrg.uniType[1]](postPrg.uniLocation[1], nowTime);
            gl[postPrg.uniType[2]](postPrg.uniLocation[2], [canvasWidth, canvasHeight]);
            // 描画
            gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

            // コマンドバッファを実行させ render を再帰呼出し
            gl.flush();
            if(run){requestAnimationFrame(render);}
        }
    }

    // utility ================================================================
    /**
     * マウスでドラッグ操作を行うための簡易な実装例
     * @class
     */
    class InteractionCamera {
        /**
         * @constructor
         */
        constructor(){
            this.qtn               = qtn.identity(qtn.create());
            this.dragging          = false;
            this.prevMouse         = [0, 0];
            this.rotationScale     = Math.min(window.innerWidth, window.innerHeight);
            this.rotation          = 0.0;
            this.rotateAxis        = [0.0, 0.0, 0.0];
            this.rotatePower       = 1.5;
            this.rotateAttenuation = 0.9;
            this.scale             = 1.0;
            this.scalePower        = 0.0;
            this.scaleAttenuation  = 0.8;
            this.scaleMin          = 0.5;
            this.scaleMax          = 1.5;
            this.startEvent        = this.startEvent.bind(this);
            this.moveEvent         = this.moveEvent.bind(this);
            this.endEvent          = this.endEvent.bind(this);
            this.wheelEvent        = this.wheelEvent.bind(this);
        }
        /**
         * mouse down event
         * @param {Event} eve - event object
         */
        startEvent(eve){
            this.dragging = true;
            this.prevMouse = [eve.clientX, eve.clientY];
        }
        /**
         * mouse move event
         * @param {Event} eve - event object
         */
        moveEvent(eve){
            if(this.dragging !== true){return;}
            let x = this.prevMouse[0] - eve.clientX;
            let y = this.prevMouse[1] - eve.clientY;
            this.rotation = Math.sqrt(x * x + y * y) / this.rotationScale * this.rotatePower;
            this.rotateAxis[0] = y;
            this.rotateAxis[1] = x;
            this.prevMouse = [eve.clientX, eve.clientY];
        }
        /**
         * mouse up event
         */
        endEvent(){
            this.dragging = false;
        }
        /**
         * wheel event
         * @param {Event} eve - event object
         */
        wheelEvent(eve){
            let w = eve.wheelDelta;
            if(w > 0){
                this.scalePower = -0.05;
            }else if(w < 0){
                this.scalePower =  0.05;
            }
        }
        /**
         * quaternion update
         */
        update(){
            this.scalePower *= this.scaleAttenuation;
            this.scale = Math.max(this.scaleMin, Math.min(this.scaleMax, this.scale + this.scalePower));
            if(this.rotation === 0.0){return;}
            this.rotation *= this.rotateAttenuation;
            let q = qtn.identity(qtn.create());
            qtn.rotate(this.rotation, this.rotateAxis, q);
            qtn.multiply(this.qtn, q, this.qtn);
        }
    }

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
})();
