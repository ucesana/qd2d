(function (qd) {

    qd.HandleSet = function () {

        var STYLE_SELECTED = { stroke: "red" },
            STYLE_UNSELECTED = { stroke: "blue" },

            _handles;

        this.init = function ()  {
            _handles = [];
            return this;
        };

        this.reset = function () {
            return this.init();
        };

        this.handle = function (owner, index, worldPoint, canvasPoint) {
            _handles.push(new qd.Handle(owner, index, worldPoint, canvasPoint));
            return this;
        };


        this.remove = function (entity) {
            _handles = qd.removeAll(_handles, function (handle) {
                return (handle.owner === entity);
            });
            return this;
        };

        this.draw = function (canvas) {
            var i,
                handle,
                bounds;

            for (i = 0; i < _handles.length; i += 1) {
                handle = _handles[i];
                bounds = handle.canvasBounds();

                canvas.path();
                canvas.traceRectangle(bounds.left(), bounds.top(), bounds.width(), bounds.height());
                canvas.draw((handle.selected) ? STYLE_SELECTED : STYLE_UNSELECTED);
            }

            return this;
        };

        this.select = function (mouse) {
            var i,
                handle;

            for (i = 0; i < _handles.length; i += 1) {
                handle = _handles[i];

                if (handle.clickTest(mouse)) {
                    handle.selected = true;
                    handle.draggable(mouse);
                } else {
                    handle.selected = false;
                }
            }

            return this;
        };

        this.selectAdd = function (mouse) {
            var i,
                handle,
                misses = 0;

            for (i = 0; i < _handles.length; i += 1) {
                handle = _handles[i];

                if (handle.clickTest(mouse)) {
                    handle.selected = true;
                } else {
                    misses += 1;
                }
            }

            if (misses === _handles.length) {
                this.selectAll(false);
            }

            return this;
        };

        this.position = function (mouse) {
            var i,
                handle;

            for (i = 0; i < _handles.length; i += 1) {
                handle = _handles[i];

                if (handle.selected) {
                    handle.position(mouse.worldPoint());
                }
            }
        };

        this.translate = function (dx, dy) {
            var i,
                handle;

            for (i = 0; i < _handles.length; i += 1) {
                handle = _handles[i];

                if (handle.selected) {
                    handle.translate(dx, dy);
                }
            }
        };

        this.selectAll = function (selected) {
            var i;

            for (i = 0; i < _handles.length; i += 1) {
                _handles[i].selected = selected;
            }

            return this;
        };

        this.init();
    };

    qd.Handle = function (owner, index, worldPoint, canvasPoint) {
        var HANDLE_SIZE = 9,
            HALF_HANDLE_SIZE = HANDLE_SIZE * 0.5;

        this._canvasBounds;

        this.owner;
        this.worldPoint;
        this.canvasPoint;
        this.index;
        this.selected;

        this.init = function (owner, index, worldPoint, canvasPoint)  {
            this._canvasBounds = new qd.BoundingBox();

            this.owner = owner;
            this.worldPoint = worldPoint;
            this.canvasPoint = canvasPoint;
            this.index = index;
            this.selected = false;

            return this;
        };

        this.canvasBounds = function () {
            var xa = this.canvasPoint[0] - HALF_HANDLE_SIZE,
                ya = this.canvasPoint[1] - HALF_HANDLE_SIZE,
                xb = xa + HANDLE_SIZE,
                yb = ya + HANDLE_SIZE;

            return this._canvasBounds.init(xa, ya, xb, yb);
        };

        this.clickTest = function (mouse) {
            return this.canvasBounds().hitTest(mouse.x, mouse.y);
        };

        this.position = function (position) {
            this.owner.modifyPoint(this.index, position[0], position[1]);

            return this;
        };

        this.translate = function (dx, dy) {
            this.owner.translatePoint(this.index, dx, dy);

            return this;
        };

        this.draggable = function (mouse) {
            var namespace = "qd.Handle";

            mouse.press(namespace, function () {
                if (this.clickTest(mouse)) {
                    this.dragging = true;
                }
            }, this);

            mouse.move(namespace, function () {
                if (this.dragging) {
                    this.position(mouse.worldPoint());
                }
            }, this);

            mouse.release(namespace, function () {
                if (this.clickTest(mouse)) {
                    this.dragging = false;

    //                body.vx = 0;
    //                body.vy = 0;
    //                body.vr = 0;
                }
            }, this);

            return this;
        };

        this.undraggable = function (mouse) {
            var namespace = "qd.Handle";

            mouse.unpress(namespace);
            mouse.unmove(namespace);
            mouse.unrelease(namespace);

            return this;
        };

        this.init(owner, index, worldPoint, canvasPoint);
    };

}(qd));
