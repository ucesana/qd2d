(function (qd) {

    /**
     * Quick & Dirty Editor
     */
    qd.Editor = function (engine) {

        /* Public */

        this.newCanvas = function () {
            _engine.pause(function () {
                _styles = qd.Styler.getDefaultStyles();
                _selected.clear();
                _clipboard.clear();
                _world.clear();
                _handleSet.reset();
                _camera.reset();
                _grid.reset();
                _switchMode(_lineMode);
                _canvas.clear();
                _physics.clear();
                qd.Entity.ID.reset();
                _engine.play();
            });

            return this;
        };

        this.saveCanvas = function () {
            _mode.deactivate();
            _engine.pause(function () {
                _canvas.clear();
                _editor.draw();
                qd.download("Created By Quick and Dirty", _canvas.toImage(_mimeType), _mimeType);
                _mode.activate();
                _engine.play();
            });
            return this;
        };

        this.import = function () {
            var files = qd.getElementById(_toolPanels.file.fileImport.id).files;

            if (qd.isNotEmpty(files)) {
                qd.forEach(files, function (file) {
                    _editor.importImage(file);
                });
            }
            return this;
        };

        this.importImage = function (file) {
            var reader = new FileReader(),
                src;

            reader.addEventListener("load", function () {
                src = reader.result;

                _view.sprite(src).load(function (sprite) {
                    var spritePos = qd.math.scatter(_view.centre(), _view.width() / 2);
                    sprite.position(spritePos[0], spritePos[1]);

                    if (sprite.width() > _view.width()) {
                        sprite.scaleToWidth(_view.width() / 2);
                    }
                    _addNewEntity(sprite);
                });
            }, false);

            if (file) {
                reader.readAsDataURL(file);
            }
            return this;
        };

        this.dropImage = function (event) {
            //noinspection JSUnresolvedVariable
            var dataTransfer = event.dataTransfer,
                files = dataTransfer.files;

            if (qd.isNotEmpty(files)) {
                qd.forEach(files, function (file) {
                    this.importImage(file);
                }, this);
            }
        };

        this.previewCanvas = function () {
            _mode.deactivate();

            _engine.pause(function () {
                _canvas.clear();
                _editor.draw();
                var dataUrl = _canvas.toImage(_mimeType);
                var image = new Image();
                image.src = _canvas.toImage(_mimeType);
                var w = window.open(dataUrl, "Preview");
                w.document.write(image.outerHTML);
                w.document.close();
                _mode.activate();
                _engine.play();
            });

            return this;
        };

        this.cut = function () {
            _clipboard.clear();

            _selected.each(function (entity) {
                entity.undraggable().unselectable();
                _clipboard.add(entity.clone());
                _world.removeEntity(entity);
            });

            _selected.clear();

            return this;
        };

        this.copy = function () {
            _clipboard.clear();

            _selected.each(function (entity) {
                _clipboard.add(entity.clone());
            });

            return this;
        };

        this.paste = function () {
            var copy = _clipboard,
                scatterPnt = qd.math.scatter(_view.centre(), _view.width() / 2);

            _selected.clear();

            copy.each(function (entity) {
                entity.position(scatterPnt[0], scatterPnt[1]);

                _selected.add(entity);
                _world.addEntity(entity.selectable().draggable());
            });

            return this;
        };

        this.delete = function () {
            _selected.each(function (entity) {
                _world.destroyEntity(entity);
            });

            _selected.clear();

            return this;
        };

        this.moveLeft = function () {
            if (_selected.empty()) {
                _camera.translate(-_moveStep(), 0);
            } else {
                _selected.translate(-_moveStep(), 0)
            }
            return this;
        };

        this.moveRight = function () {
            if (_selected.empty()) {
                _camera.translate(_moveStep(), 0);
            } else {
                _selected.translate(_moveStep(), 0);
            }
            return this;
        };

        this.moveUp = function () {
            if (_selected.empty()) {
                _camera.translate(0, -_moveStep());
            } else {
                _selected.translate(0, -_moveStep());
            }
            return this;
        };

        this.moveDown = function () {
            if (_selected.empty()) {
                _camera.translate(0, _moveStep());
            } else {
                _selected.translate(0, _moveStep());
            }
            return this;
        };

        this.zoomIn = function (target) {
            _camera.zoomIn(target);
            return this;
        };

        this.zoomOut = function (target) {
            _camera.zoomOut(target);
            return this;
        };

        this.rotateClockwise = function () {
            _selected.rotate(qd.math.toRadians(_DEGREE_STEP));
            return this;
        };

        this.rotateAnticlockwise = function () {
            _selected.rotate(qd.math.toRadians(-_DEGREE_STEP));
            return this;
        };

        this.increaseScale = function () {
            _selected.scale(_SCALE_STEP_INC, _SCALE_STEP_INC);
            return this;
        };

        this.decreaseScale = function () {
            _selected.scale(_SCALE_STEP_DEC, _SCALE_STEP_DEC);
            return this;
        };

        this.scaleLeft = function () {
            _selected.scale(_SCALE_STEP_DEC, 1);
            return this;
        };

        this.scaleRight = function () {
            _selected.scale(_SCALE_STEP_INC, 1);
            return this;
        };

        this.scaleUp = function () {
            _selected.scale(1, _SCALE_STEP_INC);
            return this;
        };

        this.scaleDown = function () {
            _selected.scale(1, _SCALE_STEP_DEC);
            return this;
        };

        this.skewLeft = function () {
            _selected.skew(-_SKEW_STEP, 0);
            return this;
        };

        this.skewRight = function () {
            _selected.skew(_SKEW_STEP, 0);
            return this;
        };

        this.skewUp = function () {
            _selected.skew(0, -_SKEW_STEP);
            return this;
        };

        this.skewDown = function () {
            _selected.skew(0, _SKEW_STEP);
            return this;
        };

        this.selectMode = function () {
            return _switchMode(_selectMode);
        };

        this.nodeMode = function () {
            return _switchMode(_nodeMode)
        };

        this.lineMode = function () {
            return _switchMode(_lineMode);
        };

        this.circleMode = function () {
            return _switchMode(_circleMode);
        };

        this.polygonMode = function () {
            return _switchMode(_polygonMode);
        };

        this.polylineMode = function () {
            return _switchMode(_polylineMode);
        };

        this.penMode = function () {
            return _switchMode(_penMode);
        };

        this.quadraticCurveMode = function () {
            return _switchMode(_quadraticCurveMode);
        };

        this.closedQuadraticCurveMode = function () {
            return _switchMode(_closedQuadraticCurveMode);
        };

        this.physicsMode = function () {
            return _switchMode(_physicsMode);
        };

        this.smoothPath = function() {
            _selected.eachGraphic(function (graphic) {
                graphic.shape().halve();
            });
            return this;
        };

        this.unsmoothPath = function() {
            _selected.eachGraphic(function (graphic) {
                graphic.shape().double();
            });
            return this;
        };

        this.textMode = function () {
            return _switchMode(_textMode);
        };

        this.cancelMode = function () {
            _mode.cancel();
        };

        this.stroke = function () {
            return _applyStyle(_toolPanels.colour.colourStroke);
        };

        this.fill = function () {
            return _applyStyle(_toolPanels.colour.colourFill);
        };

        this.fillRuleEvenOdd = function () {
            return _applyStyle(_toolPanels.colourFillRule.colourFillRuleEvenOdd);
        };

        this.fillRuleNonZero = function () {
            return _applyStyle(_toolPanels.colourFillRule.colourFillRuleNonZero);
        };

        this.lineWidth = function () {
            return _applyStyle(_toolPanels.lineStyle.lineWidth);
        };

        this.lineDash = function () {
            return _applyStyle(_toolPanels.lineStyle.lineDash);
        };

        this.lineDashOffset = function () {
            return _applyStyle(_toolPanels.lineStyle.lineDashOffset);
        };

        this.lineMiterLimit = function () {
            return _applyStyle(_toolPanels.lineStyle.lineMiterLimit);
        };

        this.lineCapButt = function () {
            return _applyStyle(_toolPanels.lineCap.lineCapButt);
        };

        this.lineCapRound = function () {
            return _applyStyle(_toolPanels.lineCap.lineCapRound);
        };

        this.lineCapSquare = function () {
            return _applyStyle(_toolPanels.lineCap.lineCapSquare);
        };

        this.lineJoinBevel = function () {
            return _applyStyle(_toolPanels.lineJoin.lineJoinBevel);
        };

        this.lineJoinRound = function () {
            return _applyStyle(_toolPanels.lineJoin.lineJoinRound);
        };

        this.lineJoinMiter = function () {
            return _applyStyle(_toolPanels.lineJoin.lineJoinMiter);
        };

        this.writeText = function () {
            var fontText = qd.Element.getById(_toolPanels.text.textWriter.id);
            _writingPad.write(fontText.value());
        };

        this.fontFamily = function () {
            return _applyStyle(_toolPanels.text.fontFamily);
        };

        this.fontSize = function () {
            return _applyStyle(_toolPanels.text.fontSize);
        };

        this.textAlignLeft = function () {
            return _applyStyle(_toolPanels.textAlign.textAlignLeft);
        };

        this.textAlignCentre = function () {
            return _applyStyle(_toolPanels.textAlign.textAlignCentre);
        };

        this.textAlignRight = function () {
            return _applyStyle(_toolPanels.textAlign.textAlignRight);
        };

        this.textBaselineTop = function () {
            return _applyStyle(_toolPanels.textBaseline.textBaselineTop);
        };

        this.textBaselineHanging = function () {
            return _applyStyle(_toolPanels.textBaseline.textBaselineHanging);
        };

        this.textBaselineMiddle = function () {
            return _applyStyle(_toolPanels.textBaseline.textBaselineMiddle);
        };

        this.textBaselineAlphabetic = function () {
            return _applyStyle(_toolPanels.textBaseline.textBaselineAlphabetic);
        };

        this.textBaselineIdeographic = function () {
            return _applyStyle(_toolPanels.textBaseline.textBaselineIdeographic);
        };

        this.textBaselineBottom = function () {
            return _applyStyle(_toolPanels.textBaseline.textBaselineBottom);
        };

        this.textDirectionLTR = function () {
            return _applyStyle(_toolPanels.textDirection.textDirectionLTR);
        };

        this.textDirectionRTL = function () {
            return _applyStyle(_toolPanels.textDirection.textDirectionRTL);
        };

        this.shadowBlur = function () {
            return _applyStyle(_toolPanels.shadow.shadowBlur);
        };

        this.shadowColour = function () {
            return _applyStyle(_toolPanels.shadow.shadowColour);
        };

        this.shadowOffsetX = function () {
            return _applyStyle(_toolPanels.shadow.shadowOffsetX);
        };

        this.shadowOffsetY = function () {
            return _applyStyle(_toolPanels.shadow.shadowOffsetY);
        };

        this.groupSelection = function () {
            var group = _world.createEntity();

            _selected.sortZOrder();

            _selected.each(function (entity) {
                qd.forEach(entity.graphics(), function (graphic) {
                    group.graphic(graphic.clone());
                });
            });

            _selected.each(function (entity) {
                _world.destroyEntity(entity);
            });

            _selected.clear();

            _selected.add(group.selectable().draggable());
        };

        this.ungroupSelection = function () {
            var graphics = [];

            _selected.each(function (entity) {
                qd.forEach(entity.graphics(), function (graphic) {
                    graphics.push(graphic.clone());
                });

                _world.destroyEntity(entity);
            });

            _selected.clear();

            qd.forEach(graphics, function (graphic) {
                _selected.add(_world.createEntity()
                .graphic(graphic)
                .selectable()
                .draggable());
            });

        };

        this.raiseSelection = function () {
            _selected.raise();
        };

        this.raiseSelectionToTop = function () {
            _selected.raiseToTop();
        };

        this.lowerSelection = function () {
            _selected.lower();
        };

        this.lowerSelectionToBottom = function () {
            _selected.lowerToBottom();
        };

        this.linearDamping = function () {
            _applyPhysicsConstant(_toolPanels.physics.physicsDampingLinear)
        };

        this.rotationalDamping = function () {
            _applyPhysicsConstant(_toolPanels.physics.physicsDampingRotational)
        };

        this.gravity = function () {
            _applyPhysicsConstant(_toolPanels.gravity.physicsGravity)
        };

        this.gravitationalConstant = function () {
            _applyPhysicsConstant(_toolPanels.gravity.physicsGravitationalConstant)
        };

        this.bodyActive = function () {
            _applyBodyProperty(_toolPanels.body.bodyActive);
        };

        this.bodyDensity = function () {
            _applyBodyProperty(_toolPanels.body.bodyDensity);
        };

        this.bodyMoment = function () {
            _applyBodyProperty(_toolPanels.body.bodyMoment);
        };

        this.restitution = function () {
            _applyBodyProperty(_toolPanels.body.bodyRestitution)
        };

        this.toggleToolbar = function () {
            _contextualToolbar.toggle();
            _editor.resizeToClientWindow();
        };

        this.toggleGrid = function () {
            _grid.toggle();
        };

        this.resizeToClientWindow = function () {
            var winMetrics = qd.measureClientWindow(),
                width = winMetrics.width,
                height = winMetrics.height,
                resizables;

            if (_contextualToolbar.visible()) {
                height = height - _contextualToolbar.height();
            }

            resizables = qd.Element.find(".qd-resizable");

            qd.forEach(resizables, function (resizable) {
                resizable.attr("width", width).attr("height", height);
            });

            _view.resize(width, height);
            _grid.draw();
        };

        this.step = function (t, dt) {
            _world.step(t, dt);
        };

        this.draw = function () {
            _canvas.clear();
            _world.draw(_canvas);
            _mode.draw(_canvas);
            return this;
        };

        /** Private */

        var _MOVE_STEP = 12,
            _SCALE_STEP_INC = 1.02,
            _SCALE_STEP_DEC = 0.98,
            _DEGREE_STEP = 1,
            _SKEW_STEP = 0.05,
            _DASHED = { "lineWidth": 1.0, "lineDash": [4, 4], "stroke": qd.Q_BLUE },

            _editor = this,

            _engine = engine,
            _canvas = engine.canvas(),
            _view = engine.view(),
            _camera = engine.camera(),
            _world = engine.world(),
            _physics = engine.physics(),

            _grid = new qd.Grid("grid", _camera),

            _mouse = engine.mouse(),
            _keyboard = engine.keyboard(),

            _mimeType = "image/png",

            _selected = new qd.EntitySet(),
            _clipboard = new qd.EntitySet(),
            _handleSet = new qd.HandleSet(),
            _styles = qd.Styler.getDefaultStyles(),

            _WritingPad = function () {
                this.write = function (text) {
                    this._pen.call(this._paper, text);
                };

                this.writer = function (paper, pen) {
                    this._paper = paper;
                    this._pen = pen;
                };
            },

            _writingPad = new _WritingPad(),

            _toolPanels = {
                file: {
                    fileNew: {
                        id: "file-new",
                        type: "button",
                        label: "New",
                        shortcut: "alt+shift+n",
                        action: _editor.newCanvas
                    },
                    fileSave: {
                        id: "file-save",
                        type: "button",
                        label: "Save",
                        shortcut: "alt+shift+s",
                        action: _editor.saveCanvas
                    },
                    fileImport: {
                        id: "file-import",
                        type: "file",
                        label: "Import",
                        shortcut: "alt+shift+i",
                        shortcutHandler: function () {
                            window.document.getElementById(_toolPanels.file.fileImport.id).click();
                        },
                        action: _editor.import
                    },
                    filePreview: {
                        id: "file-preview",
                        type: "button",
                        label: "Preview",
                        shortcut: "alt+shift+p",
                        action: _editor.previewCanvas
                    }
                },

                view: {
                    viewZoomIn: {
                        id: "view-zoom-in",
                        type: "button",
                        label: "Zoom In",
                        icon: "+",
                        shortcut: "z",
                        action: _editor.zoomIn
                    },
                    viewZoomOut: {
                        id: "view-zoom-out",
                        type: "button",
                        label: "Zoom Out",
                        icon: "-",
                        shortcut: "shift+z",
                        action: _editor.zoomOut,
                        divider: "bar"
                    },
                    viewFullscreen: {
                        id: "view-full-screen",
                        type: "button",
                        label: "Fullscreen",
                        tooltip: "Toggle fullscreen mode on/off",
                        shortcut: "alt+shift+f",
                        action: qd.toggleFullScreen,
                        divider: "bar"
                    },
                    toggleToolbar: {
                        id: "toggle-header",
                        type: "button",
                        label: "Toolbar",
                        tooltip: "Toggle the toolbar on/off",
                        shortcut: "ctrl+h",
                        action: _editor.toggleToolbar
                    },
                    toggleGrid: {
                        id: "toggle-grid",
                        type: "button",
                        label: "Grid",
                        tooltip: "Toggle the grid on/off",
                        shortcut: "ctrl+alt+g",
                        action: _editor.toggleGrid
                    },
                    viewMoveUp: {
                        id: "view-move-up",
                        type: "button",
                        label: "Move Up",
                        icon: "↑",
                        shortcut: "w/up",
                        action: _editor.moveUp
                    },
                    viewMoveLeft: {
                        id: "view-move-left",
                        type: "button",
                        label: "Move Left",
                        icon: "←",
                        shortcut: "a/left",
                        action: _editor.moveLeft
                    },
                    viewMoveRight: {
                        id: "view-move-right",
                        type: "button",
                        label: "Move Right",
                        icon: "→",
                        shortcut: "d/right",
                        action: _editor.moveRight
                    },
                    viewMoveDown: {
                        id: "view-move-down",
                        type: "button",
                        label: "Move Down",
                        icon: "↓",
                        shortcut: "s/down",
                        action: _editor.moveDown
                    }
                },

                edit: {
                    editCut: {
                        id: "edit-cut",
                        type: "button",
                        label: "Cut",
                        icon: "✂",
                        shortcut: "ctrl+x/⌘+x",
                        action: _editor.cut
                    },
                    editCopy: {
                        id: "edit-copy",
                        type: "button",
                        label: "Copy",
                        icon: "⧉",
                        shortcut: "ctrl+c/⌘+c",
                        action: _editor.copy
                    },
                    editPaste: {
                        id: "edit-paste",
                        type: "button",
                        label: "Paste",
                        icon: "▣",
                        shortcut: "ctrl+v/⌘+v",
                        action: _editor.paste
                    },
                    editDelete: {
                        id: "edit-delete",
                        type: "button",
                        label: "Delete",
                        icon: "☓",
                        shortcut: "ctrl+d/⌫",
                        action: _editor.delete
                    }
                },

                mode: {
                    modePen: {
                        id: "mode-pen",
                        type: "button",
                        label: "Pen",
                        icon: "Pen",
                        shortcut: "p",
                        action: _editor.penMode,
                        tools: ["colour", "fillRule", "lineStyle", "lineJoin", "lineCap", "shadow"]
                    },
                    modeSelect: {
                        id: "mode-select",
                        type: "button",
                        label: "Select",
                        shortcut: "e",
                        action: _editor.selectMode,
                        tools: ["edit", "transform", "colour", "fillRule", "object", "lineStyle", "lineJoin", "lineCap", "shadow", "body"]
                    },
                    modeNode: {
                        id: "mode-node",
                        type: "button",
                        label: "Node",
                        shortcut: "n",
                        action: _editor.nodeMode
                    },
                    modeLine: {
                        id: "mode-line",
                        type: "button",
                        label: "Line",
                        shortcut: "l",
                        action: _editor.lineMode,
                        tools: ["colour", "fillRule", "lineStyle", "lineJoin", "lineCap", "shadow"]
                    },
                    modePolyline: {
                        id: "mode-polyline",
                        type: "button",
                        label: "Polyline",
                        shortcut: "shift+l",
                        action: _editor.polylineMode,
                        tools: ["colour", "fillRule", "lineStyle", "lineJoin", "lineCap", "shadow"]
                    },
                    modeCircle: {
                        id: "mode-circle",
                        type: "button",
                        label: "Circle",
                        shortcut: "c",
                        action: _editor.circleMode,
                        tools: ["colour", "fillRule", "lineStyle", "lineJoin", "lineCap", "shadow"]
                    },
                    modePolygon: {
                        id: "mode-polygon",
                        type: "button",
                        label: "Polygon",
                        shortcut: "shift+p",
                        action: _editor.polygonMode,
                        tools: ["colour", "fillRule", "lineStyle", "lineJoin", "lineCap", "shadow"]
                    },
                    modeQuadraticCurve: {
                        id: "mode-quadratic-curve",
                        type: "button",
                        label: "Curve",
                        shortcut: "q",
                        action: _editor.quadraticCurveMode,
                        tools: ["colour", "fillRule", "lineStyle", "lineJoin", "lineCap", "shadow"]
                    },
                    modeClosedQuadraticCurve: {
                        id: "mode-closed-quadratic-curve",
                        type: "button",
                        label: "Loop",
                        shortcut: "shift+q",
                        action: _editor.closedQuadraticCurveMode,
                        tools: ["colour", "fillRule", "lineStyle", "lineJoin", "lineCap", "shadow"]
                    },
                    modeText: {
                        id: "mode-text",
                        type: "button",
                        label: "Text",
                        shortcut: "shift+t",
                        action: _editor.textMode,
                        tools: ["text", "colour", "font", "textAlign", "textBaseline", "textDirection"]
                    },
                    modePhysics: {
                        id: "mode-physics",
                        type: "button",
                        label: "Physics",
                        shortcut: "alt+p",
                        action: _editor.physicsMode,
                        tools: ["physics", "gravity", "engine"]
                    },
                    modeCancel: {
                        id: "mode-cancel",
                        type: "button",
                        label: "Cancel",
                        icon: "⦰",
                        shortcut: "esc",
                        action: _editor.cancelMode
                    }
                },

                transform: {
                    transformRotateClockwise: {
                        id: "transform-rotate-clockwise",
                        type: "button",
                        label: "Rotate Clockwise",
                        icon: "↻",
                        shortcut: "r",
                        action: _editor.rotateClockwise
                    },
                    transformRotateAnticlockwise: {
                        id: "transform-rotate-anticlockwise",
                        type: "button",
                        label: "Rotate Anti-Clockwise",
                        icon: "↺",
                        shortcut: "shift+r",
                        action: _editor.rotateAnticlockwise
                    },
                    transformIncreaseScale: {
                        id: "transform-increase-scale",
                        type: "button",
                        label: "Increase Scale",
                        icon: "⇱",
                        shortcut: "u",
                        action: _editor.increaseScale
                    },
                    transformDecreaseScale: {
                        id: "transform-decrease-scale",
                        type: "button",
                        label: "Decrease Scale",
                        icon: "⇲",
                        shortcut: "shift+u",
                        action: _editor.decreaseScale
                    },
                    transformIncreaseHorizontalScale: {
                        id: "transform-increase-horizontal-scale",
                        type: "button",
                        label: "Increase Horizontal Scale",
                        icon: "↦",
                        shortcut: "i",
                        action: _editor.scaleRight
                    },
                    transformDecreaseHorizontalScale: {
                        id: "transform-decrease-horizontal-scale",
                        type: "button",
                        label: "Decrease Horizontal Scale",
                        icon: "↤",
                        shortcut: "shift+i",
                        action: _editor.scaleLeft
                    },
                    transformIncreaseVerticalScale: {
                        id: "transform-increase-vertical-scale",
                        type: "button",
                        label: "Increase Vertical Scale",
                        icon: "↥",
                        shortcut: "o",
                        action: _editor.scaleUp
                    },
                    transformDecreaseVerticalScale: {
                        id: "transform-decrease-vertical-scale",
                        type: "button",
                        label: "Decrease Vertical Scale",
                        icon: "↧",
                        shortcut: "shift+o",
                        action: _editor.scaleDown
                    },
                    transformSkewLeft: {
                        id: "transform-skew-left",
                        type: "button",
                        label: "Skew Left",
                        icon: "⇠",
                        shortcut: "j",
                        action: _editor.skewLeft
                    },
                    transformSkewRight: {
                        id: "transform-skew-right",
                        type: "button",
                        label: "Skew Right",
                        icon: "⇢",
                        shortcut: "shift+j",
                        action: _editor.skewRight
                    },
                    transformSkewUp: {
                        id: "transform-skew-up",
                        type: "button",
                        label: "Skew Up",
                        icon: "⇡",
                        shortcut: "k",
                        action: _editor.skewUp
                    },
                    transformSkewDown: {
                        id: "transform-skew-down",
                        type: "button",
                        label: "Skew Down",
                        icon: "⇣",
                        shortcut: "shift+k",
                        action: _editor.skewDown
                    }
                },

                colour: {
                    colourStroke: {
                        id: "colour-stroke",
                        type: "text",
                        validator: qd.validator(qd.REGEX.CSS_COLOUR),
                        label: "Stroke",
                        name: "stroke",
                        value: _styles.strokeColour,
                        shortcut: "ctrl+s",
                        action: _editor.stroke,
                        divider: "bar"
                    },
                    colourFill: {
                        id: "colour-fill",
                        label: "Fill",
                        type: "text",
                        validator: qd.validator(qd.REGEX.CSS_COLOUR),
                        shortcut: "ctrl+f",
                        name: "fill",
                        value: _styles.fillColour,
                        action: _editor.fill
                    }
                },

                colourFillRule: {
                    colourFillRuleEvenOdd: {
                        id: "colour-fill-rule-evenodd",
                        type: "radio",
                        label: "Evenodd",
                        shortcut: "ctrl+f+o",
                        name: "fillRule",
                        value: "evenodd",
                        action: _editor.fillRuleEvenOdd
                    },
                    colourFillRuleNonZero: {
                        id: "colour-fill-rule-non-zero",
                        type: "radio",
                        label: "Non-Zero",
                        shortcut: "ctrl+f+n",
                        name: "fillRule",
                        value: "nonzero",
                        action: _editor.fillRuleNonZero
                    }
                },

                object: {
                    groupSelection: {
                        id: "group-selection",
                        type: "button",
                        label: "Group Selection",
                        icon: "Group",
                        shortcut: "ctrl+g",
                        name: "groupSelection",
                        value: "groupSelection",
                        action: _editor.groupSelection
                    },
                    ungroupSelection: {
                        id: "ungroup-selection",
                        type: "button",
                        label: "Ungroup Selection",
                        icon: "Ungroup",
                        shortcut: "ctrl+shift+g",
                        name: "ungroupSelection",
                        value: "ungroupSelection",
                        action: _editor.ungroupSelection,
                        divider: "bar"
                    },
                    raiseSelection: {
                        id: "raise-selection",
                        type: "button",
                        label: "Raise Selection",
                        icon: "Raise",
                        shortcut: "page-up",
                        name: "raiseSelection",
                        value: "raiseSelection",
                        action: _editor.raiseSelection
                    },
                    raiseSelectionToTop: {
                        id: "raise-selection-to-top",
                        type: "button",
                        label: "Raise to Top",
                        icon: "Top",
                        shortcut: "home",
                        name: "raiseSelectionToTop",
                        value: "raiseSelectionToTop",
                        action: _editor.raiseSelectionToTop
                    },
                    lowerSelection: {
                        id: "lower-selection",
                        type: "button",
                        label: "Lower Selection",
                        icon: "Lower",
                        shortcut: "page-down",
                        name: "lowerSelection",
                        value: "lowerSelection",
                        action: _editor.lowerSelection
                    },
                    lowerSelectionToBottom: {
                        id: "lower-selection-to-bottom",
                        type: "button",
                        label: "Lower to Bottom",
                        icon: "Bottom",
                        shortcut: "end",
                        name: "lowerSelectionToBottom",
                        value: "lowerSelectionToBottom",
                        action: _editor.lowerSelectionToBottom
                    }
                },

                lineStyle: {
                    lineWidth: {
                        id: "line-style-width",
                        type: "text",
                        validator: qd.validator(qd.REGEX.NUMBER),
                        label: "Width",
                        shortcut: "ctrl+l",
                        name: "lineWidth",
                        value: _styles.lineWidth,
                        action: _editor.lineWidth,
                        divider: "bar"
                    },
                    lineDash: {
                        id: "line-dash",
                        type: "text",
                        validator: qd.validator(qd.Styler.STYLES.LINE_DASH.REGEX),
                        label: "Dash",
                        shortcut: "ctrl+d",
                        name: "lineDash",
                        value: _styles.lineDash,
                        action: _editor.lineDash,
                        divider: "bar"
                    },
                    lineDashOffset: {
                        id: "line-dash-offset",
                        type: "text",
                        validator: qd.validator(qd.REGEX.NUMBER),
                        label: "Dash Offset",
                        shortcut: "ctrl+shift+d",
                        name: "lineDashOffset",
                        value: _styles.lineDashOffset,
                        action: _editor.lineDashOffset,
                        divider: "bar"
                    },
                    lineMiterLimit: {
                        id: "line-miter-limit",
                        type: "text",
                        validator: qd.validator(qd.REGEX.NUMBER),
                        label: "Miter Limit",
                        shortcut: "ctrl+m",
                        name: "lineMiterLimit",
                        value: _styles.lineMiterLimit,
                        action: _editor.lineMiterLimit
                    }
                },

                lineCap: {
                    lineCapButt: {
                        id: "line-cap-butt",
                        type: "radio",
                        label: "Butt",
                        shortcut: "ctrl+shift+b",
                        name: "lineCap",
                        value: "butt",
                        action: _editor.lineCapButt
                    },
                    lineCapRound: {
                        id: "line-cap-round",
                        type: "radio",
                        label: "Round",
                        shortcut: "ctrl+shift+r",
                        name: "lineCap",
                        value: "round",
                        action: _editor.lineCapRound
                    },
                    lineCapSquare: {
                        id: "line-cap-square",
                        type: "radio",
                        label: "Square",
                        shortcut: "ctrl+shift+s",
                        name: "lineCap",
                        value: "square",
                        action: _editor.lineCapSquare
                    }
                },

                lineJoin: {
                    lineJoinBevel: {
                        id: "line-join-bevel",
                        type: "radio",
                        label: "Bevel",
                        shortcut: "ctrl+j+b",
                        name: "lineJoin",
                        value: "bevel",
                        action: _editor.lineJoinBevel
                    },
                    lineJoinRound: {
                        id: "line-join-round",
                        type: "radio",
                        label: "Round",
                        shortcut: "ctrl+j+r",
                        name: "lineJoin",
                        value: "round",
                        action: _editor.lineJoinRound
                    },
                    lineJoinMiter: {
                        id: "line-join-miter",
                        type: "radio",
                        label: "Miter",
                        shortcut: "ctrl+j+m",
                        name: "lineJoin",
                        value: "miter",
                        action: _editor.lineJoinMiter
                    }
                },

                text: {
                    textWriter: {
                        id: "text-writer",
                        type: "text",
                        name: "textWriter",
                        value: "",
                        binds: {
                            "keyup": _editor.writeText,
                            "change": _editor.writeText,
                            "focusout": _editor.writeText
                        }
                    },
                    fontFamily: {
                        id: "font-family",
                        type: "text",
                        validator: qd.validator(qd.REGEX.TEXT),
                        label: "Family",
                        shortcut: "ctrl+t+f",
                        name: "fontFamily",
                        value: _styles.fontFamily,
                        action: _editor.fontFamily,
                        divider: "bar"
                    },
                    fontSize: {
                        id: "font-size",
                        type: "text",
                        validator: qd.validator(qd.REGEX.CSS_SIZE),
                        label: "Size",
                        shortcut: "ctrl+]/ctrl+[",
                        name: "fontSize",
                        value: _styles.fontSize,
                        action: _editor.fontSize
                    }
                },

                textAlign: {
                    textAlignLeft: {
                        id: "text-align-left",
                        type: "radio",
                        label: "Left",
                        name: "textAlign",
                        value: "left",
                        shortcut: "ctrl+t+l",
                        action: _editor.textAlignLeft
                    },
                    textAlignCentre: {
                        id: "text-align-centre",
                        type: "radio",
                        label: "Centre",
                        name: "textAlign",
                        value: "centre",
                        shortcut: "ctrl+t+c",
                        action: _editor.textAlignCentre
                    },
                    textAlignRight: {
                        id: "text-align-right",
                        type: "radio",
                        label: "Right",
                        name: "textAlign",
                        value: "right",
                        shortcut: "ctrl+t+r",
                        action: _editor.textAlignRight
                    }
                },

                textBaseline: {
                    textBaselineTop: {
                        id: "text-baseline-top",
                        type: "radio",
                        label: "Top",
                        shortcut: "ctrl+t+p",
                        name: "textBaseline",
                        value: "top",
                        action: _editor.textBaselineTop
                    },
                    textBaselineHanging: {
                        id: "text-baseline-hanging",
                        type: "radio",
                        label: "Hanging",
                        shortcut: "ctrl+t+h",
                        name: "textBaseline",
                        value: "hanging",
                        action: _editor.textBaselineHanging
                    },
                    textBaselineMiddle: {
                        id: "text-baseline-middle",
                        type: "radio",
                        label: "Middle",
                        shortcut: "ctrl+t+m",
                        name: "textBaseline",
                        value: "middle",
                        action: _editor.textBaselineMiddle
                    },
                    textBaselineAlphabetic: {
                        id: "text-baseline-alphabetic",
                        type: "radio",
                        label: "Alphabetic",
                        shortcut: "ctrl+t+a",
                        name: "textBaseline",
                        value: "alphabetic",
                        action: _editor.textBaselineAlphabetic
                    },
                    textBaselineIdeographic: {
                        id: "text-baseline-ideographic",
                        type: "radio",
                        label: "Ideographic",
                        shortcut: "ctrl+t+i",
                        name: "textBaseline",
                        value: "ideographic",
                        action: _editor.textBaselineIdeographic
                    },
                    textBaselineBottom: {
                        id: "text-Baseline-bottom",
                        type: "radio",
                        label: "Bottom",
                        shortcut: "ctrl+t+b",
                        name: "textBaseline",
                        value: "bottom",
                        action: _editor.textBaselineBottom
                    }
                },

                textDirection: {
                    textDirectionLTR: {
                        id: "text-direction-ltr",
                        type: "radio",
                        label: "Left-to-Right",
                        shortcut: "ctrl+t+>",
                        name: "textDirection",
                        value: "ltr",
                        action: _editor.textDirectionLTR
                    },
                    textDirectionRTL: {
                        id: "text-direction-rtl",
                        type: "radio",
                        label: "Right-to-Left",
                        shortcut: "ctrl+t+<",
                        name: "textDirection",
                        value: "rtl",
                        action: _editor.textDirectionRTL
                    }
                },

                shadow: {
                    shadowBlur: {
                        id: "shadow-blur",
                        type: "text",
                        validator: qd.validator(qd.REGEX.NUMBER),
                        label: "Blur",
                        shortcut: "ctrl+w+plus/ctrl+w+minus",
                        name: "shadowBlur",
                        value: _styles.shadowBlur,
                        action: _editor.shadowBlur,
                        divider: "bar"
                    },
                    shadowColour: {
                        id: "shadow-colour",
                        type: "text",
                        validator: qd.validator(qd.REGEX.CSS_COLOUR),
                        label: "Colour",
                        shortcut: "ctrl+w+c",
                        name: "shadowColour",
                        value: _styles.shadowColour,
                        action: _editor.shadowColour,
                        divider: "bar"
                    },
                    shadowOffsetX: {
                        id: "shadow-offset-x",
                        type: "text",
                        validator: qd.validator(qd.REGEX.NUMBER),
                        label: "Offset X",
                        shortcut: "ctrl+w+left/ctrl+w+right",
                        name: "shadowOffsetX",
                        value: _styles.shadowOffsetX,
                        action: _editor.shadowOffsetX,
                        divider: "bar"
                    },
                    shadowOffsetY: {
                        id: "shadow-offset-y",
                        type: "text",
                        validator: qd.validator(qd.REGEX.NUMBER),
                        label: "Offset Y",
                        shortcut: "ctrl+w+left/ctrl+w+right",
                        name: "shadowOffsetY",
                        value: _styles.shadowOffsetY,
                        action: _editor.shadowOffsetY
                    }
                },

                physics: {
                    physicsDampingLinear: {
                        id: "physics-linear-damping",
                        type: "text",
                        name: "linearDamping",
                        value: _physics._linearDamping,
                        validator: qd.validator(qd.REGEX.NUMBER),
                        label: "Linear Damping",
                        action: _editor.linearDamping,
                        divider: "bar"
                    },
                    physicsDampingRotational: {
                        id: "physics-rotational-damping",
                        type: "text",
                        name: "rotationalDamping",
                        value: _physics._rotationalDamping,
                        validator: qd.validator(qd.REGEX.NUMBER),
                        label: "Rotational Damping",
                        action: _editor.rotationalDamping,
                        divider: "bar"
                    }
                },

                gravity: {
                    physicsGravity: {
                        id: "physics-gravity",
                        type: "text",
                        name: "gravity",
                        value: _physics.settings.gravity,
                        validator: qd.validator(qd.REGEX.NUMBER),
                        label: "Gravity",
                        action: _editor.gravity,
                        divider: "bar"
                    },
                    physicsGravitationalConstant: {
                        id: "physics-gravitational-constant",
                        type: "text",
                        name: "gravitationalConstant",
                        value: _physics.settings.gravitationalConstant,
                        validator: qd.validator(qd.REGEX.NUMBER),
                        label: "Gravitational Constant",
                        action: _editor.gravitationalConstant
                    }
                },

                engine: {
                    enginePlay: {
                        id: "engine-play",
                        type: "button",
                        label: "Play",
                        icon: "Play",
                        action: function () { _engine.play() }
                    },
                    enginePause: {
                        id: "engine-pause",
                        type: "button",
                        label: "Pause",
                        icon: "Pause",
                        action: function () { _engine.pause() }
                    }
                },

                body: {
                    bodyActive: {
                        id: "body-active",
                        type: "text",
                        name: "active",
                        value: true,
                        validator: qd.validator(qd.REGEX.BOOLEAN),
                        label: "Active",
                        action: _editor.bodyActive,
                        divider: "bar"
                    },
                    bodyDensity: {
                        id: "body-density",
                        type: "text",
                        name: "density",
                        value: 1,
                        validator: qd.validator(qd.REGEX.NUMBER),
                        label: "Density",
                        action: _editor.bodyDensity,
                        divider: "bar"
                    },
                    bodyMoment: {
                        id: "body-moment",
                        type: "text",
                        name: "moment",
                        value: 0.1,
                        validator: qd.validator(qd.REGEX.NUMBER),
                        label: "Moment",
                        action: _editor.bodyMoment,
                        divider: "bar"
                    },
                    bodyRestitution: {
                        id: "body-restitution",
                        type: "text",
                        name: "restitution",
                        value: 0,
                        validator: qd.validator(qd.REGEX.NUMBER),
                        label: "Restitution",
                        action: _editor.restitution
                    }
                },

                path: {
                    pathSmooth: {
                        id: "path-smooth",
                        label: "Smooth Path",
                        shortcut: "ctrl+q+s",
                        action: _editor.smoothPath
                    },
                    pathUnsmooth: {
                        id: "path-unsmooth",
                        label: "Unsmooth Path",
                        shortcut: "ctrl+q+a",
                        action: _editor.unsmoothPath
                    }
                }
            },
            // End Command Sets


            _ContextualToolbar = function (toolbarElement) {
                this._toolbar = toolbarElement;
                this._toolPanels = {};
                this._visible = true;

                this.toolPanel = function (toolPanel) {
                    this._toolPanels[toolPanel.id()] = toolPanel;
                    return this;
                };

                this.visible = function () {
                    return this._visible;
                };

                this.activate = function (toolPanelIds) {
                    qd.forEach(toolPanelIds, function (toolPanelId) {
                        if (this._toolPanels[toolPanelId]) {
                            this._toolPanels[toolPanelId].style("display", "inline");
                        }
                    }, this);

                    return this;
                };

                this.deactivate = function (toolPanelIds) {
                    qd.forEach(toolPanelIds, function (toolPanelId) {
                        if (this._toolPanels[toolPanelId]) {
                            this._toolPanels[toolPanelId].style("display", "none");
                        }
                    }, this);

                    return this;
                };

                this.deactivateAll = function () {
                    qd.eachProperty(this._toolPanels, function (id) {
                        this._toolPanels[id].style("display", "none");
                    }, this);

                    return this;
                };

                this.toggle = function () {
                    if (this._visible) {
                        this._toolbar.style("display", "none");
                        this._visible = false;
                    } else if (!this._visible) {
                        this._toolbar.style("display", "block");
                        this._visible = true;
                    }
                };

                this.width = function () {
                    return this._toolbar.width();
                };

                this.height = function () {
                    return this._toolbar.height();
                }
            },

            _contextualToolbar,

            _buildUI = function () {
                var find = qd.Element.find,
                    tag = qd.Element.tag,
                    fldSet = qd.Element.fieldSet,
                    divider = function () {
                        return tag("div").addClass("divider")
                    },
                    makeTitle = function (cmd) {
                        var label = cmd.tooltip || qd.capitalise(cmd.label) || "",
                            shortcut = (cmd.shortcut) ? qd.capitalise(" (" + cmd.shortcut + ")") : "";

                        return label.concat(shortcut);
                    },
                    fld = function (cmd) {
                        var id = cmd.id,
                            type = cmd.type,
                            label = (cmd.icon) ? cmd.icon : cmd.label,
                            title = makeTitle(cmd),
                            name = (cmd.name) ? cmd.name : qd.shrink(label.toLowerCase()),
                            value = (qd.isDefinedAndNotNull(cmd.value)) ? cmd.value : name,
                            action = cmd.action,
                            binds = cmd.binds,
                            field;

                        switch(type) {
                            case "button":
                                field = qd.Element.button(id, label, title, name, value);

                                if (action) {
                                    field.bind("click", action);
                                }

                                break;
                            case "text":
                                var textLabel = qd.Element.tag("span").text(label),
                                    input = qd.Element.tag("input", {
                                        id: id,
                                        attrs: {
                                            type: "text",
                                            name: name,
                                            value: ((qd.isDefinedAndNotNull(value)) ? value : name),
                                            title: title
                                        }
                                    });

                                field = qd.Element.tag("span").append(textLabel).append(input);

                                input.bind("focus", function () {
                                    _keyboardCtx.disable();
                                }).bind("blur", function () {
                                    _keyboardCtx.enable();
                                });

                                if (action) {
                                    input.bind("keyup", function () {
                                        action();
                                    });
                                }

                                break;
                            case "radio":
                                field = qd.Element.radio(id, label, title, (value === _styles[name]), name, value);

                                if (action) {
                                    field.bind("click", action);
                                }

                                break;
                            case "file":
                                field = qd.Element.file(id, label, title, name, value);
                                if (action) {
                                    field.bind("change", action);
                                }

                                break;
                            default:
                                field = qd.Element.input(id, type, title, name, value);

                        }

                        if (qd.isDefinedAndNotNull(binds)) {
                            qd.eachProperty(binds, function (event, callback) {
                                field.bind(event, callback);
                            });
                        }

                        return field;
                    },
                    bar = tag("div").id("bar").append(
                        tag("header").id("logo").attr("title", "Quick & Dirty").append(
                            tag("img").attr("src", "images/qd.svg"))
                    ),
                    toolPanels = tag("div").id("tool-panels");

                bar.append(toolPanels);

                _contextualToolbar = new _ContextualToolbar(bar);

                qd.eachProperty(_toolPanels, function (toolPanelId, tools) {
                    var toolPanel = fldSet(toolPanelId, qd.capitalise(toolPanelId));

                    qd.eachProperty(tools, function (toolId, tool) {
                        toolPanel.append(fld(tool));

                        if (qd.isDefinedAndNotNull(tool.divider)) {
                            toolPanel.append(divider());
                        }
                    });

                    toolPanel.draggable();
                    toolPanels.append(toolPanel);

                    if (!(toolPanelId === "file"
                            || toolPanelId === "edit"
                            || toolPanelId === "view"
                            || toolPanelId === "mode")) {
                        _contextualToolbar.toolPanel(toolPanel);
                    }
                });

                _contextualToolbar.deactivateAll();

                find("body").prepend(bar);

                return this;
            },

            _Mode = function (command) {

                /* Private attributes */

                var _this = this,
                    _namespace = "qd.Mode.".concat(qd.shrink(command.label)),
                    _modeMouseCtx = new qd.MouseContext(_mouse, _namespace, _this),
                    _modeKeyboardCtx = new qd.KeyboardContext(_keyboard, _namespace, _this),

                    /* Private functions */

                    _execute = function (fnName) {
                        var fn = _this.fn[fnName];

                        if (fn) {
                            fn.call(_this);
                        }
                    },

                    _init = function () {
                        _execute("init");
                        _start();
                    },

                    _start = function () {
                        _execute("start");
                    },

                    _finish = function () {
                        _execute("finish");
                    };

                /* Public attributes */

                this.label = command.label;
                this.d = {};    // data
                this.fn = {};   // functions
                this.activated = false;
                this.tools = command.tools || [];

                /* Public fn */

                this.init = function (fn) {
                    this.fn["init"] = fn;
                    return this;
                };

                this.start = function (fn) {
                    this.fn["start"] = fn;
                    return this;
                };

                this.finish = function (fn) {
                    this.fn["finish"] = fn;
                    return this;
                };

                this.bind = function () {
                    var args = new qd.Args(arguments),
                        event,
                        jwertyCode,
                        callback;

                    if (args.matches(String, Function)) {
                        event = args.get(0);
                        callback = args.get(1);

                        _modeMouseCtx.bind(event, callback);
                    } else if (args.matches(String, String, Function)) {
                        event = args.get(0);
                        jwertyCode = args.get(1);
                        callback = args.get(2);

                        _modeKeyboardCtx.bind(event, jwertyCode, callback);
                    }

                    return this;
                };

                this.activate = function () {
                    _init();
                    _modeMouseCtx.enable();
                    _modeKeyboardCtx.enable();
                    _contextualToolbar.activate(this.tools);
                    if (_contextualToolbar.visible()) {
                        _editor.resizeToClientWindow();
                    }
                    this.activated = true;
                    return this;
                };

                this.deactivate = function () {
                    _finish();
                    _modeMouseCtx.disable();
                    _modeKeyboardCtx.disable();
                    _contextualToolbar.deactivateAll();
                    this.activated = false;
                    return this;
                };

                this.restart = function () {
                    _start();
                };

                this.cancel = function () {
                    _finish();
                    _init();
                    return this;
                };

                this.data = function (d) {
                    if (d) {
                        this.d = qd.mergeProperties(this.d, d);
                        return this;
                    }

                    else return d;
                };

                this.function = function (name, fn) {
                    if (name) {
                        if (fn) {
                            this.fn[name] = function () {
                                return fn.apply(_this, arguments);
                            };

                            return this;
                        } else {
                            return this.fn[name];
                        }
                    }

                    return this;
                };

                this.functions = function (fns) {
                    if (fns) {
                        qd.eachProperty(fns, function (name, fn) {
                            this.function(name, fn);
                        }, this);

                        return this;
                    }

                    return this.fn;
                };

                this.drawer = function (fn) {
                    this.fn["draw"] = fn;
                    return this;
                };

                this.draw = function (canvas) {
                    var fn = this.fn["draw"];

                    if (fn && this.activated) {
                        fn.call(_this, canvas);
                    }

                    return this;
                };

                this.mouse = function () {
                    return _modeMouseCtx.mouse();
                };

                this.keyboard = function () {
                    return _modeKeyboardCtx.keyboard();
                };
            },

            /* Draw Line Mode */
            _lineMode = new _Mode(_toolPanels.mode.modeLine)
            .data({
                timeStep: 0,
                pointA: qd.Point2D.create(0, 0),
                pointB: qd.Point2D.create(0, 0)
            })
            .start(function () {
                this.d.click = 0;
            })
            .bind("click", function (mouse) {
                var d = this.d;

                d.click += 1;

                if (d.click === 1) {
                    d.pointA = mouse.worldPoint();
                } else if (d.click === 2) {
                    d.pointB = mouse.worldPoint();
                    _addNewEntity(_view.line(d.pointA, d.pointB));
                    this.restart();
                }
            })
            .drawer(function () {
                var d = this.d,
                    pointA,
                    pointB;

                if (d.click === 1) {
                    pointA = d.pointA;
                    pointB = _view.mouseWorldPoint(_mouse);
                    _view.path()
                    .traceLine(pointA[0], pointA[1], pointB[0], pointB[1])
                    .draw(_DASHED);
                }
            }),

            /* Draw Circle Mode */
            _circleMode = new _Mode(_toolPanels.mode.modeCircle)
            .start(function () {
                this.d.click = 0;
                this.d.centre = null;
            })
            .bind("click", function (mouse) {
                var d = this.d,
                    point = mouse.worldPoint();

                d.click += 1;

                if (d.click === 1) {
                    d.centre = point;
                } else if (d.click === 2) {
                    var centre = d.centre,
                        radius = qd.Point2D.distance(centre, point),
                        ellipse = _view.circle(centre, radius, radius)
                        .styles(_styles);

                    _addNewEntity(ellipse);
                    this.restart();
                }
            })
            .drawer(function (canvas) {
                var d = this.d,
                    centre,
                    mousePoint,
                    radius;

                if (d.click === 1) {
                    centre = d.centre;
                    mousePoint = _mouse.worldPoint();
                    radius = qd.Point2D.distance(centre, mousePoint);

                    canvas.path();
                    _view.traceCircle(centre[0], centre[1], radius);
                    _view.traceLine(centre[0], centre[1], mousePoint[0], mousePoint[1]);
                    canvas.draw(_DASHED);
                }
            }),

            /* Draw Polygon Mode */
            _polygonMode = new _Mode(_toolPanels.mode.modePolygon)
            .start(function () {
                this.d.click = 0;
                this.d.points = [];
            })
            .bind("click", function (mouse) {
                this.d.click += 1;
                var point = _view.mouseWorldPoint(mouse);
                this.d.points.push(point);
            })
            .bind("keydown", "enter", function () {
                if (this.d.points.length > 1) {
                    _addNewEntity(_view.polygon(this.d.points));
                    this.restart();
                }
            })
            .bind("dblclick", function () {
                if (this.d.points.length > 1) {
                    _addNewEntity(_view.polygon(this.d.points));
                    this.restart();
                }
            })
            .drawer(function () {
                var d = this.d,
                    lastPoint,
                    mousePoint;

                if (d.click > 0) {
                    _view.path();

                    if (d.points.length > 1) {
                        _view.tracePolyline(d.points);
                    }

                    lastPoint = d.points[d.points.length - 1];
                    mousePoint = _view.mouseWorldPoint(_mouse);
                    _view.traceLine(lastPoint[0], lastPoint[1], mousePoint[0], mousePoint[1]);
                    _view.draw(_DASHED);
                }
            }),

            /* Draw Polyline Mode */
            _polylineMode = new _Mode(_toolPanels.mode.modePolyline)
            .start(function () {
                this.d.click = 0;
                this.d.points = [];
            })
            .function("lastPoint", function (closed) {
                if (closed) {
                    _addNewEntity(_view.polygon(this.d.points));
                } else {
                    _addNewEntity(_view.polyline(this.d.points));
                }

                this.restart();
            })
            .bind("click", function (mouse) {
                this.d.click += 1;
                var point = _view.mouseWorldPoint(mouse);
                this.d.points.push(point);
            })
            .bind("keydown", "enter", function () {
                if (this.d.points.length > 1) {
                    this.fn["lastPoint"](_keyboard.is("shift"));
                }
            })
            .bind("dblclick", function () {
                if (this.d.points.length > 1) {
                    this.fn["lastPoint"](_keyboard.is("shift"));
                }
            })
            .drawer(function (canvas) {
                var d = this.d,
                    lastPoint,
                    mousePoint;

                if (d.click > 0) {
                    canvas.path();

                    if (d.points.length > 1) {
                        _view.tracePolyline(d.points);
                    }

                    lastPoint = d.points[d.points.length - 1];
                    mousePoint = _view.mouseWorldPoint(_mouse);
                    _view.traceLine(lastPoint[0], lastPoint[1], mousePoint[0], mousePoint[1]);
                    canvas.draw(_DASHED);
                }
            }),

            /* Pen Mode */
            _penMode = new _Mode(_toolPanels.mode.modePen)
            .init(function () {
                this.mouse().cursor("pointer");
            })
            .start(function () {
                this.d.click = 0;
                this.d.points = [];
                this.d.prevPoint = null;
            })
            .bind("mousedown", function (mouse) {
                var point;

                if (this.d.click === 1) {
                    point = _view.mouseWorldPoint(mouse);
                    this.d.points.push(point);
                    this.d.prevPoint = point;
                }

                this.d.click += 1;
            })
            .bind("move", function (mouse) {
                var point;

                if (this.d.click > 0 ) {
                    point = _view.mouseWorldPoint(mouse);

                    if (!qd.Point2D.equals(this.d.prevPoint, point)) {
                        this.d.points.push(_view.mouseWorldPoint(mouse));
                        this.d.prevPoint = point;
                    }
                }
            })
            .bind("mouseup", function () {
                var curve;
                if (this.d.points.length > 2) {
                    if (_keyboard.is("shift")) {
                        curve = _view.closedQuadraticCurve(this.d.points);
                    } else {
                        curve = _view.quadraticCurve(this.d.points);
                    }

                    _addNewEntity(curve);
                }

                this.restart();
            })
            .drawer(function (canvas) {
                if (this.d.click > 0) {

                    if (this.d.points.length > 2) {
                        _view.path()
                        .traceQuadraticCurve(this.d.points)
                        .draw(_DASHED);
                    }
                }
            })
            .finish(function () {
                this.mouse().cursor("default");
            }),

            /* Quadratic Curve Mode */
            _quadraticCurveMode = new _Mode(_toolPanels.mode.modeQuadraticCurve)
            .start(function () {
                this.d.click = 0;
                this.d.points = [];
            })
            .function("addLastPoint", function (closed) {
                var curve;

                if (closed) {
                    curve = _view.closedQuadraticCurve(this.d.points);
                } else {
                    curve = _view.quadraticCurve(this.d.points);
                }

                _addNewEntity(curve);
                this.restart();
            })
            .bind("click", function (mouse) {
                this.d.click += 1;
                this.d.points.push(_view.mouseWorldPoint(mouse));
            })
            .bind("keydown", "enter", function () {
                if (this.d.points.length > 1) {
                    this.fn["addLastPoint"](false);
                }
            })
            .bind("keydown", "shift+enter", function () {
                if (this.d.points.length > 1) {
                    this.fn["addLastPoint"](true);
                }
            })
            .bind("dblclick", function () {
                var closed = false;

                if (this.d.points.length > 1) {
                    if (_keyboard.is("shift")) {
                        closed = true;
                    }

                    this.fn["addLastPoint"](closed);
                }
            })
            .drawer(function () {
                var d = this.d,
                    points = d.points,
                    pointCount = points.length,
                    lastPoint,
                    mousePoint;

                if (d.click > 0) {

                    _view.path();

                    if (pointCount === 2) {
                        _view.tracePolyline(points)
                    } else if (pointCount > 2) {
                        _view.traceQuadraticCurve(points);
                    }

                    lastPoint = points[pointCount - 1];
                    mousePoint = _view.mouseWorldPoint(this.mouse());

                    _view.traceLine(lastPoint[0], lastPoint[1], mousePoint[0], mousePoint[1]);
                    _view.draw(_DASHED);
                }
            }),

            /* Closed Quadratic Curve Mode */
            _closedQuadraticCurveMode = new _Mode(_toolPanels.mode.modeClosedQuadraticCurve)
            .start(function () {
                this.d.click = 0;
                this.d.points = [];
            })
            .bind("click", function (mouse) {
                this.d.click += 1;
                this.d.points.push(_view.mouseWorldPoint(mouse));
            })
            .bind("keydown", "enter", function () {
                if (this.d.points.length > 1) {
                    _addNewEntity(_view.closedQuadraticCurve(this.d.points));
                    this.restart();
                }
            })
            .bind("dblclick", function () {
                if (this.d.points.length > 1) {
                    _addNewEntity(_view.closedQuadraticCurve(this.d.points));
                    this.restart();
                }
            })
            .drawer(function () {
                var d = this.d,
                    points = d.points,
                    pointCount = points.length,
                    lastPoint,
                    mousePoint;

                if (d.click > 0) {

                    _view.path();

                    if (pointCount === 2) {
                        _view.tracePolyline(points)
                    } else if (pointCount > 2) {
                        _view.traceQuadraticCurve(points);
                    }

                    lastPoint = this.d.points[this.d.points.length - 1];
                    mousePoint = _view.mouseWorldPoint(this.mouse());
                    _view.traceLine(lastPoint[0], lastPoint[1], mousePoint[0], mousePoint[1]);
                    _view.draw(_DASHED);
                }
            }),

            _textMode = new _Mode(_toolPanels.mode.modeText)
            .bind("init", function () {

            })
            .bind("finish", function () {

            }),

            /* Select Mode */
            _selectMode = new _Mode(_toolPanels.mode.modeSelect)
            .data({
                dragStart: null
            })
            .bind("keydown", "ctrl+a", function () {
                _selected.addAll(_world.selectable());
            })
            .bind("dblclick", function (mouse) {
                var selectable = _world.selectable(),
                    entity = selectable.clickTest(mouse),
                    graphic = entity.graphic(0);

                if (graphic instanceof qd.Text) {
                    _switchMode(_textMode);

                    var textInput = qd.Element.getById(_toolPanels.text.textWriter.id);
                    textInput.get().focus();
                    textInput.value(graphic.text());
                    _writingPad.writer(graphic, function (text) {
                        this.text(_canvas, text);
                    });
                }
            })
            .bind("mousedown", function (mouse) {
                var selectable = _world.selectable(),
                    entity = selectable.clickTest(mouse);

                if (qd.isDefinedAndNotNull(entity)) {
                    if (_keyboard.is("shift")) {
                        _selected.add(entity);
                        this.d.dragStart = _view.mouseWorldPoint(mouse);
                    } else if (this.d.dragStart === null) {
                        _selected.clear();
                        _selected.put(entity);
                    }
                } else {
                    this.d.dragStart = _view.mouseWorldPoint(mouse);
                    _selected.clear();
                }
            })
            .bind("mouseup", function () {
                var dragStart = this.d.dragStart,
                    dragEnd,
                    dragRect;

                if (dragStart) {
                    dragEnd = _view.mouseWorldPoint(_mouse);
                    dragRect = new qd.math.Rectangle(dragStart, dragEnd);

                    _world.selectable().each(function (entity) {
                        if (entity.bounds().boxCollisionTest(dragRect.min, dragRect.max)) {
                            _selected.add(entity);
                        }
                    });
                }

                this.d.dragStart = null;
            })
            .drawer(function () {
                var dragStart,
                    dragEnd,
                    dragRect;

                _view.path();

                // Draw Selection Box
                dragStart = this.d.dragStart;

                if (dragStart) {
                    dragEnd = _view.mouseWorldPoint(_mouse);
                    dragRect = new qd.math.Rectangle(dragStart, dragEnd);

                    _view.traceRectangle(dragRect.min[0], dragRect.min[1], dragRect.width, dragRect.height);

                    // Draw highlighted entities inside selection box
                    _world.selectable().each(function (entity) {
                        var bs;

                        if (entity.bounds().boxCollisionTest(dragRect.min, dragRect.max)) {
                            bs = entity.bounds();
                            _view.traceRectangle(bs.left(), bs.top(), bs.width(), bs.height());
                        }
                    });
                }

                // Draw previously selected entities
                _selected.each(function (entity) {
                    var bs = entity.bounds();
                    _view.traceRectangle(bs.left(), bs.top(), bs.width(), bs.height());
                });

                _view.draw(_DASHED)
            })
            .finish(function () {
                _selected.clear();
                this.d.dragStart = null;
            }),

            /* Edit Path Mode */
            _nodeMode = new _Mode(_toolPanels.mode.modeNode)
            .init(function () {

            })
            .bind("click", function (mouse) {
                if (_keyboard.is("shift")) {
                    _handleSet.selectAdd(mouse);
                } else {
                    _handleSet.select(mouse);
                }
            })
            .bind("keydown", "ctrl+a", function () {
                _handleSet.selectAll(true);
            })
            .bind("keydown", "w/up", function () {
                _handleSet.translate(0, -_moveStep());
            })
            .bind("keydown", "s/down", function () {
                _handleSet.translate(0, _moveStep());
            })
            .bind("keydown", "a/left", function () {
                _handleSet.translate(-_moveStep(), 0);
            })
            .bind("keydown", "d/right", function () {
                _handleSet.translate(_moveStep(), 0);
            })
            .drawer(function (canvas) {
                _handleSet.draw(canvas);
            })
            .finish(function () {
                _handleSet.selectAll(false);
            }),

            /* Physics Mode */
            _physicsMode = new _Mode(_toolPanels.mode.modePhysics),

            _moveStep = function () {
                return (_MOVE_STEP * _camera.zoomLevel());
            },

            _switchMode = function (mode) {
                _mode.deactivate();
                _mode = mode;
                _mode.activate();
                return this;
            },

            _mode = _lineMode,

            _addNewEntity = function (graphic) {
                graphic.shape().handles(_handleSet);
                graphic.styles(_styles);
                return _world.createEntity(graphic).selectable().draggable();
            },

            _set = function (command, setter) {
                var element = qd.Element.getById(command.id),
                    name = command.name,
                    value = element.value(),
                    validator = command.validator;

                if (validator) {
                    if (validator.validate(value)) {
                        setter(name, value);
                        element.style("backgroundColor", qd.Colour.WHITE)
                    } else {
                        element.style("backgroundColor", qd.Colour.MISTY_ROSE)
                    }
                } else {
                    setter(name, value);
                }

                return _editor;
            },

            _applyStyle = function (command) {
                return _set(command, function (style, value) {
                    _styles[style] = value;
                    _selected.applyStyle(style, value);
                });
            },

            _applyPhysicsConstant = function (command) {
                return _set(command, function (constant, value) {
                    _physics.setting(constant, value);
                });
            },

            _applyBodyProperty = function (command) {
                return _set(command, function (property, value) {
                    _selected.applyBodyProperty(property, value);
                });
            },

            _mouseCtx = new qd.MouseContext(_mouse, "qd.Editor", this),

            _bindMouseCommands = function (mouseCtx) {
                mouseCtx.bind("wheel", function (mouse, event) {
                    if (mouse.wheel(event) > 0) {
                        _editor.zoomIn(mouse.viewPoint());
                    } else if (mouse.wheel(event) < 0) {
                        _editor.zoomOut(mouse.viewPoint());
                    }

                    event.preventDefault();
                })
                .enable();
            },

            _keyboardCtx = new qd.KeyboardContext(_keyboard, "qd.Editor", this),

            _bindKeyboardCommands = function (keyboardCtx, commandSets) {
                qd.eachProperty(commandSets, function (commandSetId, commands) {
                    qd.eachProperty(commands, function (name, command) {
                        keyboardCtx.bind("keydown", command.shortcut, (command.shortcutHandler) ? command.shortcutHandler : command.action);
                    });
                });

                keyboardCtx.preventDefault("keydown", "down-arrow")
                .preventDefault("keydown", "up-arrow")
                .preventDefault("keydown", "left-arrow")
                .preventDefault("keydown", "right-arrow")
                .preventDefault("keydown", "delete");

                keyboardCtx.enable();
            },

            _bindWindowEvents = function () {
                qd.Element.getById("canvas").droppable().bind("drop", function (event) {
                    _editor.dropImage(event);
                });

                window.addEventListener("resize", _editor.resizeToClientWindow);

                window.addEventListener("blur", function () {
                    _engine.pause();
                });

                window.addEventListener("focus", function () {
                    _engine.play();
                });
            },

            /** Add temporary testing code here */
            _playground = function () {

            },

            _init = function () {
                _buildUI();
                _bindMouseCommands(_mouseCtx);
                _bindKeyboardCommands(_keyboardCtx, _toolPanels);
                _bindWindowEvents();
                _mode.activate();
                _grid.draw(_camera);
                _playground();
                _engine.play(_editor.step, _editor.draw);
            };

        _init();
    };

    return qd;

}(qd));
