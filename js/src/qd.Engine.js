(function (qd) {

    /**
     * qd.Engine
     *
     * @param {Object?} options
     * @constructor
     */
    qd.Engine = function (options) {
        this._initAnimationFrame(); // Initialised only once
        this.init(options);
    };

    /* Static */

    qd.Engine.MAX_FPS = 60; // Standard canvas refresh rate across all browsers (DO NOT CHANGE)

    qd.Engine.STATE = {
        START: 0,
        PAUSE: 1,
        PLAY: 2,
        STOP: 3
    };

    /* Private */

    qd.Engine.prototype._initAnimationFrame = function () {

        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = (window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                function (callback) {
                    return window.setTimeout(callback, 1000 / qd.Engine.MAX_FPS);
                });
        }

        if (!window.cancelRequestAnimationFrame) {
            //noinspection JSUnresolvedVariable
            window.cancelRequestAnimationFrame = (window.cancelAnimationFrame ||
                window.webkitCancelRequestAnimationFrame ||
                window.mozCancelRequestAnimationFrame ||
                window.msCancelRequestAnimationFrame ||
                window.oCancelRequestAnimationFrame ||
                window.clearTimeout);
        }
    };

    qd.Engine.prototype._displayFps = function (avgFps) {
        var ctx = this._canvas.context();
        ctx.strokeText(avgFps, 10, 16, 100);
    };

    qd.Engine.prototype._resolvePauseCallbacks = function () {
        if (this._pauseCallbacks.length > 0) {
            this._pauseCallbacks.pop()();
        }
    };

    qd.Engine.prototype._play = function () {
        var engine = this;

        engine.t = 0.0;
        engine.dt = 1 / qd.Engine.MAX_FPS;

        engine.renderPeriod = 1000 / this._settings.fps;
        engine.showFps = qd.isTruthy(this._settings.showFps);

        engine.currentTime = Date.now();

        engine.renderCounter = 1;
        engine.previousRenderTime = engine.currentTime;
        engine.firstRenderTime = engine.previousRenderTime;

        (function frame() {
            var renderPeriod,
                currentRenderTime,
                previousRenderTime,
                elapsedRenderTime;

            engine._frameRequest = window.requestAnimationFrame(frame);

            engine.currentTime = Date.now();

            switch (engine._state) {
                case qd.Engine.STATE.PLAY:
                    // Simulate Physics
                    engine._update(engine.t, engine.dt);
                    engine.t += engine.dt;

                    // Render Graphics
                    renderPeriod = engine.renderPeriod;
                    currentRenderTime = engine.currentTime;
                    previousRenderTime = engine.previousRenderTime;
                    elapsedRenderTime = currentRenderTime - previousRenderTime;

                    if (elapsedRenderTime > renderPeriod) {
                        engine._render(elapsedRenderTime);

                        if (engine.showFps) {
                            engine._displayFps(parseInt(engine.renderCounter /
                                ((previousRenderTime - engine.firstRenderTime) / 1000)));
                        }

                        engine.renderCounter += 1;
                        engine.previousRenderTime = currentRenderTime - (elapsedRenderTime % renderPeriod);
                    }
                    break;
                case qd.Engine.STATE.PAUSE:
                    engine._resolvePauseCallbacks();
                    break;
            }
        })();
    };

    /* Public */

    qd.Engine.prototype.init = function (options) {
        this._settings = qd.mergeProperties({
            canvas: "canvas",
            mouseContainer: "canvas",
            enableCommands: false,
            runCommand: "alt+r",
            pauseCommand: "alt+p",
            stopCommand: "alt+s",
            toggleLogCommand: "alt+l",
            toggleDebugCommand: "alt+d",
            toggleWarnCommand: "alt+w",
            log: true,
            debug: false,
            warn: false,
            showFps: false,
            fps: qd.Engine.MAX_FPS
        }, options || {});

        this._state = qd.Engine.STATE.START;

        this._canvasElement = qd.getElementById(qd.defaultValue(this._settings.canvas, "canvas"));
        this._canvas = new qd.Canvas({ "canvas": this._canvasElement });
        this._physics = new qd.Physics({ canvas: this._canvas });
        this._view = this._canvas.view();
        this._camera = this._view.camera();
        this._world = new qd.World(this);

        this._mouseContainer = qd.getElementById(qd.defaultValue(this._settings.mouseContainer, "canvas"));
        this._mouse = new qd.Mouse(this._mouseContainer, this._view);
        this._touch = qd.Touch.build(this._mouseContainer);
        this._keyboard = new qd.Keyboard();
        this._keyboardCtx = new qd.KeyboardContext(this._keyboard, "qd.Engine", this)
            .keyup(this._settings.runCommand, function () {
                this.play();
            })
            .keyup(this._settings.pauseCommand, function () {
                this.pause();
            })
            .keyup(this._settings.stopCommand, function () {
                this.stop();
            })
            .keyup(this._settings.toggleLogCommand, function () {
                this.toggleLog();
            })
            .keyup(this._settings.toggleDebugCommand, function () {
                this.toggleDebug();
            })
            .keyup(this._settings.toggleWarnCommand, function () {
                this.toggleWarn();
            });

        if (qd.isTruthy(this._settings.enableCommands)) {
            this._keyboardCtx.enable();
        }

        qd.logging.log = qd.isTruthy(this._settings.log);
        qd.logging.debug = qd.isTruthy(this._settings.debug);
        qd.logging.warn = qd.isTruthy(this._settings.warn);

        this._frameRequest = null;
        this._pauseCallbacks = [];

        return this;
    };

    /**
     * Get or set the {@code settings}.
     *
     * @param {Object?} settings
     * @return {Object|qd.Engine}
     */
    qd.Engine.prototype.settings = function (settings) {
        if (settings) {
            this._settings = settings;
            return this;
        }

        return this._settings;
    };

    /**
     * Get or set the {@code canvas}.
     *
     * @param {qd.Canvas?} canvas
     * @return {qd.Canvas|qd.Engine}
     */
    qd.Engine.prototype.canvas = function (canvas) {
        if (canvas) {
            this._canvas = canvas;
            return this;
        }

        return this._canvas;
    };

    /**
     * Get or set the {@code viewport}.
     *
     * @param {qd.View?} view
     * @return {qd.View|qd.Engine}
     */
    qd.Engine.prototype.view = function (view) {
        if (view) {
            this._view = view;
            return this;
        }

        return this._view;
    };

    /**
     * Get or set the {@code camera}.
     *
     * @param {qd.Camera?} camera
     * @return {qd.Camera|qd.Engine}
     */
    qd.Engine.prototype.camera = function (camera) {
        if (camera) {
            this._camera = camera;
            return this;
        }

        return this._camera;
    };

    /**
     * Get or set the {@code mouse}.
     *
     * @param {qd.Mouse?} mouse
     * @return {qd.Mouse|qd.Engine}
     */
    qd.Engine.prototype.mouse = function (mouse) {
        if (mouse) {
            this._mouse = mouse;
            return this;
        }

        return this._mouse;
    };

    /**
     * Get or set the {@code touch}.
     *
     * @param touch {qd.Touch?}
     * @return {qd.Touch|qd.Engine}
     */
    qd.Engine.prototype.touch = function (touch) {
        if (touch) {
            this._touch = touch;
            return this;
        }

        return this._touch;
    };

    qd.Engine.prototype.keyboard = function (keyboard) {
        if (keyboard) {
            this._keyboard = keyboard;
            return this;
        }

        return this._keyboard;
    };

    /**
     * Get or set the {@code physics}.
     *
     * @param physics {qd.Physics?}
     * return {qd.Physics|qd.Engine}
     */
    qd.Engine.prototype.physics = function (physics) {
        if (physics) {
            this._physics = physics;
            return this;
        }

        return this._physics;
    };

    qd.Engine.prototype.world = function (world) {
        if (world) {
            this._world = world;
            return this;
        }

        return this._world;
    };

    qd.Engine.prototype.disableCommands = function () {
        this._keyboardCtx.disable();
        return this;
    };

    qd.Engine.prototype.enableCommands = function () {
        this._keyboardCtx.enable();
        return this;
    };

    qd.Engine.prototype.start = function () {
        this.stop();
        this._state = qd.Engine.STATE.START;
        return this;
    };

    qd.Engine.prototype.play = function (update, render) {
        if (this._state === qd.Engine.STATE.START) {
            this._state = qd.Engine.STATE.PAUSE;
            this._update = update || function () {};
            this._render = render || function () {};
        }

        if (this._state === qd.Engine.STATE.PAUSE) {
            if (this._pauseCallbacks.length === 0) {
                this._play();
                this._state = qd.Engine.STATE.PLAY;
                qd.debug("Engine playing");
            }
        }

        return this;
    };

    /**
     * Pause the animation frame loop.
     */
    qd.Engine.prototype.pause = function (callback) {
        if(this._state === qd.Engine.STATE.PLAY) {
            this._state = qd.Engine.STATE.PAUSE;
            qd.debug("Engine paused");
        }

        if (qd.isDefinedAndNotNull(callback)) {
            if (!this._pauseCallbacks) {
                this._pauseCallbacks = [];
            }
            this._pauseCallbacks.push(callback);
        }

        return this;
    };

    /**
     * Stop the animation frame loop.
     */
    qd.Engine.prototype.stop = function () {
        if (this._state !== qd.Engine.STATE.STOP) {
            window.cancelRequestAnimationFrame(this._frameRequest);
            this._frameRequest = null;
            this._state = qd.Engine.STATE.STOP;
            qd.debug("Engine stopped");
        }

        return this;
    };

    qd.Engine.prototype.toggleLog = function () {
        // Make sure "Logs on/off" are displayed
        if (qd.logging.log) {
            qd.debug("Logs off");
            qd.logging.log = false;
        } else {
            qd.logging.log = true;
            qd.debug("Logs on");
        }
    };

    qd.Engine.prototype.toggleDebug = function () {
        qd.logging.debug = !qd.logging.debug;
        qd.debug("Debug " + ((qd.logging.debug) ? "on" : "off"));
    };

    qd.Engine.prototype.toggleWarn = function () {
        qd.logging.warn = !qd.logging.warn;
        qd.debug("Warnings " + ((qd.logging.warn) ? "on" : "off"));
    };

}(qd));
