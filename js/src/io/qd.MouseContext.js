(function (qd) {

    qd.MouseContext = function (mouse, namespace, context) {
        this._mouse = mouse;
        this._namespace = namespace;
        this._ctx = context;
        this._binds = [];
    };

    qd.MouseContext.prototype = {

        bind: function (event, callback) {
            this._binds.push({
                "event": event,
                "callback": callback
            });

            return this;
        },

        enable: function () {
            qd.forEach(this._binds, function (binding) {
                this._mouse.bind(binding.event, this._namespace, binding.callback, this._ctx);
            }, this);

            return this;
        },

        disable: function () {
            qd.forEach(this._binds, function (binding) {
                this._mouse.unbind(binding.event, this._namespace);
            }, this);

            return this;
        },

        click:  function (callback) {
            return this.bind("mousedown", callback);
        },

        dblClick: function (callback) {
            return this.bind("mousedblclick", callback);
        },

        press:  function (callback) {
            return this.bind("mousedown", callback);
        },

        release:  function (callback) {
            return this.bind("mouseup", callback);
        },

        move:  function (callback) {
            return this.bind("mousemove", callback);
        },

        enter: function (callback) {
            return this.bind("mouseenter", callback);
        },

        leave: function (callback) {
            return this.bind("mouseleave", callback);
        },

        over: function (callback) {
            return this.bind("mouseover", callback);
        },

        mouse: function () {
            return this._mouse;
        },

        worldPoint: function () {
            return this._mouse.worldPoint();
        }

    };

}(qd));

