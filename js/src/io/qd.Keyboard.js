(function (qd) {

    /**
     * Requires jwerty.
     *
     * TODO: Implement all of jwerty features
     *
     */
    qd.Keyboard = function (container) {
        this.init(container);
    };

    /* Static */

    qd.Keyboard.GENERATE_KEYS = function () {
        var keys,
            keyCode,
            n;

        // Key codes range from 8 to 222, with some spaces in between.
        // Each key code maps to an array of key aliases
        keys = {
            "8": ["backspace", "delete", "⌫"],
            "9": ["tab", "⇥", "⇆"],
            "13": ["enter", "return", "↩", "⌅"],
            "16": ["shift", "⇧"],
            "17": ["ctrl", "^"],
            "18": ["alt", "option", "⌥"],
            "19": ["pause", "pause-break"],
            "20": ["caps-lock", "caps", "⇪"],
            "27": ["escape", "esc", "⎋"],
            "32": ["spacebar", "space"],
            "33": ["page-up", "pgup", "↖"],
            "34": ["page-down", "pgdown", "↘"],
            "35": ["end", "⇟"],
            "36": ["home", "⇞"],
            "37": ["left-arrow", "left", "←"],
            "38": ["up-arrow", "up", "↑"],
            "39": ["right-arrow", "right", "→"],
            "40": ["down-arrow", "down", "↓"],
            "41": ["select"],
            "42": ["print"],
            "43": ["execute"],
            "44": ["print-screen"],
            "45": ["insert", "ins"],
            "46": ["delete", "del"],
            "59": ["semicolon", ";"],
            "60": ["less-than", "<"],
            "61": ["equals", "="],
            "63": ["ß"],
            "91": ["left-meta", "meta", "⌘", "left-win", "win", "left-cmd", "cmd", "left-super", "super"],
            "92": ["right-win", "win"],
            "93": ["right-meta", "meta", "⌘", "win-menu"],
            "106": ["multiply", "star", "asterisk", "*"],
            "107": ["plus", "+"],
            "108": ["numpad-period"],
            "109": ["subtract", "-"],
            "110": ["num-decimal-point", "num-period", "num-dot", "num-full-stop", "num-delete"],
            "111": ["divide", "/"],
            "144": ["num-lock"],
            "145": ["scroll-lock"],
            "160": ["^"],
            "163": ["#", "hash"],
            "167": ["page-forward"],
            "171": ["~", "tilde"],
            "173": ["moz-minus", "mute"],
            "174": ["decrease-volume"],
            "175": ["increase-volume"],
            "176": ["next"],
            "177": ["previous"],
            "178": ["stop"],
            "179": ["play"],
            "180": ["e-mail"],
            "181": ["moz-mute"],
            "182": ["moz-decrease-volume"],
            "183": ["mox-increase-volume"],
            "186": ["semi-colon"],
            "187": ["equal-sign", "="],
            "188": ["comma", ","],
            "189": ["dash", "-"],
            "190": ["period", "full-stop", "."],
            "191": ["forward-slash", "slash", "/"],
            "192": ["grave-accent", "tick", "back-quote", "`"],
            "193": ["question-mark", "?"],
            "194": ["chrome-numpad-period"],
            "219": ["open-bracket", "["],
            "220": ["back-slash", "\\"],
            "221": ["close-bracket", "]"],
            "222": ["single-quote", "quote", "apostraphe", "'"]
        };

        // Number and numpad keys
        for (keyCode = 48, n = 0; keyCode < 58; keyCode += 1, n += 1) {

            // Nunber keys: 48 - 57
            keys[keyCode.toString()] = [n.toString()];

            // Numpad keys: 96 - 105
            keys[(keyCode + 48).toString()] = ["numpad-" + n];
        }

        // Alphabet
        for (keyCode = 65; keyCode < 91; keyCode += 1) {
            keys[keyCode.toString()] = [String.fromCharCode(keyCode).toLowerCase()];
        }

        // Function keys
        for (keyCode = 112, n = 1; keyCode < 136; keyCode += 1, n += 1) {
            keys[keyCode.toString()] = ["f" + n, "function-" + n];
        }

        return keys;
    };

    qd.Keyboard.KEYS = qd.Keyboard.GENERATE_KEYS();

    /* Public */

    qd.Keyboard.prototype.init = function () {
        this._container = window.document;

        this._keyState = {
            keyCodes: {},
            keyAliases: {}
        };

        this._bindings = {};

        this._container.addEventListener("keydown", qd.callbackWithContext(function (event) {
            var keys,
                keyCode,
                key,
                keyState,
                keyCodes,
                keyAliases,
                index,
                alias;

            keys = qd.Keyboard.KEYS;
            keyCode = event.keyCode;
            key = keys[keyCode];

            if (key) {
                keyState = this._keyState;

                // Toggle key codes
                keyCodes = keyState.keyCodes;
                keyCodes[keyCode] = true;

                // Toggle key aliases
                keyAliases = keyState.keyAliases;

                for (index = 0; index < key.length; index += 1) {
                    alias = key[index];
                    keyAliases[alias] = true;
                }
            }

        }, this), false);

        this._container.addEventListener("keyup", qd.callbackWithContext(function (event) {
            var keys,
                keyCode,
                key,
                keyState,
                keyCodes,
                keyAliases,
                index,
                alias;

            keys = qd.Keyboard.KEYS;
            keyCode = event.keyCode;
            key = keys[keyCode];

            if (key) {
                keyState = this._keyState;

                // Toggle key codes
                keyCodes = keyState.keyCodes;
                keyCodes[keyCode] = false;

                // Toggle key aliases
                keyAliases = keyState.keyAliases;

                for (index = 0; index < key.length; index += 1) {
                    alias = key[index];
                    keyAliases[alias] = false;
                }
            }
        }, this), false);
    };

    qd.Keyboard.prototype.bind = function (type, namespace, keyCombo, callback, context) {
        var jwertyCallback = function (event) {
                // TODO: REMOVE jwerty dependency
                var jwertyCallback = jwerty.event(keyCombo, callback, context || this);
                jwertyCallback.call(context, event);

            };

        this._bindings[qd.dotJoin(qd.dotJoin(type, namespace), keyCombo)] = jwertyCallback;
        this._container.addEventListener(type, jwertyCallback, false);


        return this;
    };

    qd.Keyboard.prototype.unbind = function (type, namespace, keyCombo) {
        var jwertyCallback = this._bindings[qd.dotJoin(qd.dotJoin(type, namespace), keyCombo)];
        this._container.removeEventListener(type, jwertyCallback);

        return this;
    };

    qd.Keyboard.prototype.fire = function (type, namespace, keyCombo) {
       // TODO
    };

    qd.Keyboard.prototype.focusout = function (namespace, jwertyCode, callback, context) {
        this.bind("focusout", namespace, jwertyCode, callback, context);
        return this;
    };

    qd.Keyboard.prototype.keydown = function (namespace, jwertyCode, callback, context) {
        this.bind("keydown", namespace, jwertyCode, callback, context);
        return this;
    };

    qd.Keyboard.prototype.keypress = function (namespace, jwertyCode, callback, context) {
        this.bind("keypress", namespace, jwertyCode, callback, context);
        return this;
    };

    qd.Keyboard.prototype.keyup = function (namespace, jwertyCode, callback, context) {
        this.bind("keyup", namespace, jwertyCode, callback, context);
        return this;
    };

    qd.Keyboard.prototype.unfocusout = function (namespace) {
        this.unbind("focusout", namespace);
        return this;
    };

    qd.Keyboard.prototype.unkeydown = function (namespace) {
        this.unbind("keydown", namespace);
        return this;
    };

    qd.Keyboard.prototype.unkeypress = function (namespace) {
        this.unbind("keypress", namespace);
        return this;
    };

    qd.Keyboard.prototype.unkeyup = function (namespace) {
        this.unbind("keyup", namespace);
        return this;
    };

    // TODO: Swap key event args
    qd.Keyboard.prototype.is = function (key, event) {
        var keyPressed = false;

        if (event) {
            var keys = qd.Keyboard.KEYS[event.keyCode];
            keyPressed = qd.includes(keys, key);
        } else {
            keyPressed = this._keyState.keyAliases[key];
        }

        return keyPressed;
    };

}(qd));
