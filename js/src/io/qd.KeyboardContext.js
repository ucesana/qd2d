(function (qd) {

    qd.KeyboardContext = function (keyboard, namespace, context) {
        this._keyboard = keyboard;
        this._namespace = namespace;
        this._ctx = context;
        this._binds = [];
        this._preventDefaults = [];
        this._enabled = false;
    };

    qd.KeyboardContext.prototype.bind = function (event, keyCombo, callback) {
        this._binds.push({
            "event": event,
            "keyCombo": keyCombo,
            "callback": callback
        });
        return this;
    };

    qd.KeyboardContext.prototype.enable = function () {
        if (this._enabled === false) {
            qd.forEach(this._binds, function (binding) {
                this._keyboard.bind(binding.event, this._namespace, binding.keyCombo, binding.callback, this._ctx);
            }, this);

            qd.forEach(this._preventDefaults, function (preventDefault) {
                var eventType = preventDefault.eventType,
                    callback = preventDefault.callback;

                document.addEventListener(eventType, callback);
            }, this);

            this._enabled = true;
        }

        return this;
    };

    qd.KeyboardContext.prototype.disable = function () {
        if (this._enabled === true) {
            qd.forEach(this._binds, function (binding) {
                this._keyboard.unbind(binding.event, this._namespace, binding.keyCombo);
            }, this);

            qd.forEach(this._preventDefaults, function (preventDefault) {
                var eventType = preventDefault.eventType,
                    callback = preventDefault.callback;

                document.removeEventListener(eventType, callback);
            }, this);

            this._enabled = false;
        }

        return this;
    };

    qd.KeyboardContext.prototype.enabled = function () {
        return (this._enabled === true);
    };

    qd.KeyboardContext.prototype.disabled = function () {
        return (this._enabled === false);
    };

    qd.KeyboardContext.prototype.focusout = function (keyCombo, callback) {
        return this.bind("focusout", keyCombo, callback);
    };

    qd.KeyboardContext.prototype.keydown = function (keyCombo, callback) {
        return this.bind("keydown", keyCombo, callback);
    };

    qd.KeyboardContext.prototype.keypress = function (keyCombo, callback) {
        return this.bind("keypress", keyCombo, callback);
    };

    qd.KeyboardContext.prototype.keyup = function (keyCombo, callback) {
        return this.bind("keyup", keyCombo, callback);
    };

    qd.KeyboardContext.prototype.preventDefault = function (eventType, key) {
        var callback = qd.callbackWithContext(function (event) {
                if (this._keyboard.is(key, event))  {
                    event.preventDefault();
                }
            }, this);

        this._preventDefaults.push({ eventType: eventType, key: key, callback: callback });

        return this;
    };
}(qd));
