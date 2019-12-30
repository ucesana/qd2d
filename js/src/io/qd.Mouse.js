(function (qd) {

    /**
     * qd.Mouse
     *
     * TODO: Need to add Mouse Wheel events
     * TODO: Need mouse state: Left, Middle, Right Buttons
     * TODO: Implement a "jwerty" style mouse code (e.g. right-click)
     */
    qd.Mouse = function (container, view) {
        this.event = null;

        this._container = (container || window);
        this._view = view;
        this._bodyScrollLeft = document.body.scrollLeft;
        this._elementScrollLeft = document.documentElement.scrollLeft;
        this._bodyScrollTop = document.body.scrollTop;
        this._elementScrollTop = document.documentElement.scrollTop;
        this._offsetLeft = this._container.offsetLeft;
        this._offsetTop = this._container.offsetTop;
        this._bindings = {};
        this._cursor = "default";

        this._dragInitial = qd.Point2D.create(0, 0);
        this.dragDelta = qd.Point2D.create(0, 0);

        this.wheelDelta = 0;
        this.wheelUp = false;
        this.wheelDown = false;

        var _mouse = this;

        // Setup mouse coordinates
        this._container.addEventListener("mousemove", function (event) {
            var x,
                y,
                rect = _mouse._container.getBoundingClientRect();

    //        if (event.pageX || event.pageY) {
    //            x = event.pageX;
    //            y = event.pageY;
    //        } else {
    //            x = event.clientX + _mouse._bodyScrollLeft + _mouse._elementScrollLeft;
    //            y = event.clientY + _mouse._bodyScrollTop + _mouse._elementScrollTop;
    //        }

    //        x -= _mouse._offsetLeft;
    //        y -= _mouse._offsetTop;

            x = event.clientX - rect.left;
            y = event.clientY - rect.top;


    //        qd.debug(x, ",", y);

            _mouse.x = x;
            _mouse.y = y;
        }, false);

        // Setup drag delta tracking
        this._container.addEventListener("mousedown", function () {
            _mouse._dragInitial[0] = _mouse.x;
            _mouse._dragInitial[1] = _mouse.y;
            _mouse.dragDelta[0] = 0;
            _mouse.dragDelta[1] = 0;
        }, false);

        this._container.addEventListener("mouseup", function () {
            _mouse.dragDelta[0] = _mouse.x - _mouse._dragInitial[0];
            _mouse.dragDelta[1] = _mouse.y - _mouse._dragInitial[1];
        }, false);

        this._parseEvent = function (event) {
            var eventType;

            switch (event) {
                case "move":
                    eventType = "mousemove";
                    break;
                case "click":
                    eventType = "mousedown";
                    break;
                case "dblClick":
                    eventType = "dblclick";
                    break;
                case "release":
                    eventType = "mouseup";
                    break;
                case "enter":
                    eventType = "mouseenter";
                    break;
                case "leave":
                case "exit":
                    eventType = "mouseleave";
                    break;
                case "over":
                case "hover":
                    eventType = "mouseover";
                    break
                default:
                    eventType = event;
            }

            return eventType;
        }
    };

    qd.Mouse.prototype = {
        worldPoint: function () {
            if (this._view) {
                return this._view.mouseWorldPoint(this);
            }

            return qd.Point2D.create(this.x, this.y);
        },

        viewPoint: function () {
            return qd.Point2D.create(this.x, this.y);
        },

        cursor: function (cursor) {
            this._container.style.cursor = cursor;
        },

        bind: function (event, namespace, callback, context) {
            var _mouse = this,
                _event = _mouse._parseEvent(event),
                _namespace = qd.dotJoin(_event, namespace),
                _context = qd.defaultValue(context, _mouse),
                _callback = function (event) {
                    callback.call(_context, _mouse, event);
                };

            this._bindings[_namespace] = _callback;
            this._container.addEventListener(_event, _callback, false);

            return this;
        },

        unbind: function (event, namespace) {
            var _event = this._parseEvent(event),
                _namespace = qd.dotJoin(_event, namespace),
                _callback = this._bindings[_namespace];

            this._container.removeEventListener(_event, _callback);
            delete this._bindings[_namespace];

            return this;
        },

        trigger: function (eventType, namespace, event) {
            var _event = this._parseEvent(eventType),
                _namespace = qd.dotJoin(_event, namespace),
                _callback = this._bindings[_namespace];

            _callback(event);

            return this;
        },

        click: function (namespace, callback, context) {
            return this.bind("mousedown", namespace, callback, context);
        },

        unclick: function (namespace) {
            return this.unbind("mousedown", namespace);
        },

        dblClick: function (namespace, callback, context) {
            return this.bind("dblclick", namespace, callback, context);
        },

        unDblClick: function (namespace) {
            return this.unbind("dblclick", namespace);
        },

        press: function (namespace, callback, context) {
            return this.bind("mousedown", namespace, callback, context);
        },

        unpress: function (namespace) {
            return this.unbind("mousedown", namespace);
        },

        release: function (namespace, callback, context) {
            return this.bind("mouseup", namespace, callback, context);
        },

        unrelease: function (namespace) {
            return this.unbind("mouseup", namespace);
        },

        move: function (namespace, callback, context) {
            return this.bind("mousemove", namespace, callback, context);
        },

        unmove: function (namespace, callback) {
            return this.unbind("mousemove", namespace);
        },

        enter: function (namespace, callback, context) {
            return this.bind("mouseenter", namespace, callback, context);
        },

        unenter: function (namespace, callback) {
            return this.unbind("mouseenter", namespace);
        },

        leave: function (namespace, callback, context) {
            return this.bind("mouseleave", namespace, callback, context);
        },

        unleave: function (namespace, callback) {
            return this.unbind("mouseleave", namespace);
        },

        out: function (namespace, callback, context) {
            return this.bind("mouseout", namespace, callback, context);
        },

        unout: function (namespace, callback) {
            return this.unbind("mouseout", namespace);
        },

        over: function (namespace, callback, context) {
            return this.bind("mouseover", namespace, callback, context);
        },

        unover: function (namespace, callback) {
            return this.unbind("mouseover", namespace);
        },

        leftButton: function () {
            return this.button() === 1;
        },

        middleButton: function () {
            return this.button() === 2;
        },

        rightButton: function () {
            return this.button() === 3;
        },

        button: function (event) {
            var button;

            if (!event.which && event.button) {
                if (event.button & 1) {
                    // Left
                    button = 1
                }
                else if (event.button & 4) {
                    // Middle
                    button = 2
                    }
                else if (event.button & 2) {
                    // Right
                    button = 3
                }
            }
        },

        wheel: function (event) {
            var event = window.event || event,
                delta = (event.wheelDelta || -event.deltaY),
                direction = Math.max(-1, Math.min(1, delta));
            return direction;
        }

    };

}(qd));
