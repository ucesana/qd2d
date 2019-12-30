/**
 * Quick & Dirty
 *
 * Author: Ulpian Cesana
 */

"use strict";

/*global window, console, HTMLElement*/

/*jslint bitwise: true*/

window.qd = function (qd) {

    qd.FULL_NAME = "Quick & Dirty"
    qd.JS_NAME = "qd.js"
    qd.VERSION = "0.2";

    qd.Q_BLUE = "#00aad4";
    qd.D_GREEN = "#37c871";

    qd.MESSAGES = {
        "error.divisionByZero":"Division by zero.",
        "error.arrayLengthMismatch":"Array length mismatch."
    };

    qd.REGEX = {
        YES_NO:/^([yY][eE][sS])$|^([nN][oO])$/,
        BOOLEAN:/^([tT][rR][uU][eE])$|^([fF][aA][lL][sS][eE])$/,
        NUMBER:/^(\d+)$|^(\d*\.\d+)$/,
        TEXT:/^([\w\s\W]*)$/,
        CSS_COLOUR:/^#([aAbBcCdDeEfF\d]{6})$|^[rR][gG][bB]\((\d{1,3}), *(\d{1,3}), *(\d{1,3})\)$|^([a-zA-Z]+)$/,
        CSS_SIZE:/^([\d]+|\d*\.\d+)(px|em)$/,
        COMMA_SEPARATED_INTEGER_LIST:/^(\d)+(, *(\d)+)*$/
    };

    /**
     * Represents a Tuple with n numbers using typed arrays.
     */
    qd.Tuple = {

        TYPE:(typeof Float64Array !== 'undefined') ? Float64Array : (
            (typeof Float32Array !== 'undefined') ? Float32Array : Array),

        create:function () {
            var length = arguments.length,
                tuple = new qd.Tuple.TYPE(length),
                i;

            for (i = 0; i < length; i += 1) {
                tuple[i] = arguments[i];
            }

            return tuple;
        },

        clone:function (a) {
            var clone;

            if (a == null) {
                return undefined;
            }

            clone = new qd.Tuple.TYPE(a.length);

            qd.forEach(a, function (value, index) {
                clone[index] = value;
            });

            return clone;
        },

        copy:function (out, a) {
            if (a != null) {
                if (out == null) {
                    throw new Error("Undefined or null out parameter.");
                }
                else if (out.length !== a.length) {
                    throw new Error("Length mismatch with out parameter");
                }

                qd.forEach(a, function (value, index) {
                    out[index] = value;
                });
            }

            return out;
        },

        equal:function (a, b) {
            var i;

            if (a == null || b == null) {
                return false;
            }

            if (a === b) {
                return true;
            }

            if (a.length !== b.length) {
                return false;
            }

            for (i = 0; i < a.length; i += 1) {
                if (!qd.math.equalish(a[i], b[i])) {
                    return false;
                }
            }

            return true;
        },

        size:function (a) {
            return a.length;
        }
    };

    /**
     * Logging, Messaging, Errors
     */

    qd.logging = {
        log: true,
        debug: false,
        warn: true
    };

    qd.console = function (type, message) {
        var msg;

        if (!console || !console.log || !console.warn) {
            return this;
        }

        msg = "qd.js: " + message;

        switch (type) {
            case "warn":
                if (qd.logging.warn) {
                    console.warn(msg);
                }
                break;
            case "debug":
                if (qd.logging.debug) {
                    console.debug(msg);
                }
                break;
            case "log":
            default:
                if (qd.logging.log) {
                    console.log(msg);
                }
        }

        return this;
    };

    qd.log = function () {
        return qd.console("log", qd.parseMessage(arguments));
    };

    qd.debug = function () {
        return qd.console("debug", qd.parseMessage(arguments));
    };

    qd.warn = function () {
        return qd.console("warn", qd.parseMessage(arguments));
    };

    qd.parseMessage = function (tokens) {
        var msg = "";

        if (qd.isNotEmpty(tokens)) {

            // Check if msgArgs is a canned message
            if (qd.isMessage(tokens[0])) {
                if (tokens.length === 1) {
                    msg += qd.message(tokens[0]);
                } else {
                    msg += qd.message(tokens[0], tokens[1]);
                }
            } else {
                qd.forEach(tokens, function (token) {
                    if (token instanceof Function) {
                        msg += token;
                    } else if (token instanceof Object) {
                        try {
                            msg += JSON.stringify(token);
                        } catch (e) {
                            // Gobble up that cyclic object exception
                            msg += token;
                        }
                    } else {
                        msg += token;
                    }
                });
            }
        }

        return msg;
    };

    qd.alert = function () {
        window.alert(qd.parseMessage(arguments));
        return this;
    };

    qd.prompt = function () {
        return window.prompt(qd.parseMessage(arguments));
    };

    qd.error = function () {
        throw new Error(qd.parseMessage(arguments));
    };

    qd.isMessage = function (message) {
        return qd.isNotEmpty(qd.MESSAGES[message]);
    };

    qd.message = function (message, parameters) {
        var msg = qd.MESSAGES[message] || message;

        if (parameters instanceof Number
            || parameters instanceof Array
            || typeof parameters === "string") {

            msg += "" + parameters;
        }

        if (parameters != null && parameters instanceof Object) {
            msg = qd.mergeParameters(msg, parameters);
        }

        return msg;
    };

    qd.mergeParameters = function (template, parameters) {
        var text = template;

        qd.eachProperty(parameters, function (name, value) {
            text.replace(new RegExp("\\$\\{" + name + "\\}", "g"), value);
        });

        return text;
    };

    /** Classes */

    qd.class = function (constructor, prototype) {
        qd.eachProperty(prototype, function (methodName, method) {
            constructor.prototype[methodName] = method;
        });

        return constructor;
    };

    qd.extends = function (parentConstructor, childConstructor, prototype) {
        childConstructor.prototype = new parentConstructor();

        qd.eachProperty(prototype, function (methodName, method) {
            childConstructor.prototype[methodName] = method;
        });

        childConstructor.prototype.constructor = childConstructor;

        return childConstructor;
    };

    /**
     * Robust Variable Tests
     */
    qd.isNull = function (object) {
        return (object === null);
    };

    qd.isNotNull = function (object) {
        return (object !== null);
    };

    qd.isUndefined = function (object) {
        return (object === undefined);
    };

    qd.isDefined = function (object) {
        return (object !== undefined);
    };

    qd.isDefinedAndNotNull = function (object) {
        return (object !== undefined && object !== null);
    };

    qd.isUndefinedOrNull = function (object) {
        return (object === undefined || object === null);
    };

    qd.isTruthy = function (bool) {
        return qd.isDefinedAndNotNull(bool) && (bool === true || bool > 0
            || (typeof bool === "string" && bool.toLowerCase() === "true"));
    };

    qd.isFalsey = function (bool) {
        return (qd.isTruthy(bool) === false);
    };

    qd.isEqualTo = function (value, number) {
        return (value != null && value == number);
    };

    qd.isLessOrEqualTo = function (value, number) {
        return (value != null && value <= number);
    };

    qd.isLessThan = function (value, number) {
        return (value != null && value < number);
    };

    qd.isGreaterThan = function (value, number) {
        return (value != null && value > number);
    };

    qd.isGreaterOrEqual = function (value, number) {
        return (value != null && value >= number);
    };

    qd.isLengthEqualTo = function (array, value) {
        return (array != null && array.length == value);
    };

    qd.isLengthLessOrEqualTo = function (array, value) {
        return (array != null && array.length <= value);
    };

    qd.isLengthLessThan = function (array, value) {
        return (array != null && array.length < value);
    };

    qd.isLengthGreaterThan = function (array, value) {
        return (array != null && array.length > value);
    };

    qd.isLengthGreaterOrEqualTo = function (array, value) {
        return (array != null && array.length >= value);
    };

    qd.isNotEmpty = function (array) {
        return (array != null && array.length > 0);
    };

    qd.isEmpty = function (array) {
        return (array != null && array.length == 0);
    };

    /**
     * Collection Operations
     */

    qd.mergeProperties = function (properties, options) {
        var i,
            key,
            keys = Object.keys(options),
            option;

        for (i = 0; i < keys.length; i += 1) {
            key = keys[i];
            if (options.hasOwnProperty(key)) {
                option = options[key];
                if (qd.isDefined(option)) {
                    properties[key] = option;
                }
            }
        }

        return properties;
    };

    /**
     * Robust {@code each} function that will iterate over most collections.
     *
     * The {@code collection} can be of type Array, String, or Object, or an object that implements
     * {@code iterator()} function.
     *
     * Use this function if the type of the collection is unknown, otherwise use the iteration
     * function specific to the collection type.
     *
     *
     * @param collection
     * @param callback
     * @param context
     * @return the original {@code collection}
     */
    qd.each = function (collection, callback, context) {
        var iterator = null;

        if (collection instanceof Array || typeof collection === "string") {
            qd.forEach(collection, callback, context);
        } else if (qd.isDefinedAndNotNull(collection.iterator)) {
            iterator = collection.iterator();

            if (iterator instanceof qd.Iterator) {
                iterator.iterate(callback, context);
            }
        } else if (collection instanceof Number) {
            qd.loop(collection, callback, context);
        } else {
            qd.eachProperty(collection, callback, context);
        }

        return collection;
    };

    qd.forEach = function (array, callback, context) {
        var i,
            ctx = context || this;

        for (i = 0; i < array.length; i += 1) {
            callback.call(ctx, array[i], i);
        }

        return array;
    };

    qd.eachProperty = function (properties, callback, context) {
        var index,
            key,
            keys = Object.keys(properties),
            ctx = context || this;

        for (index = 0; index < keys.length; index += 1) {
            key = keys[index];
            callback.call(ctx, key, properties[key], index);
        }

        return properties;
    };

    /**
     * Iterator
     *
     * @param node - must have data and next members
     * @constructor
     */
    qd.Iterator = function (node) {
        this._node = node;

        this.hasNext = function () {
            return (this._node !== null);
        };

        this.next = function () {
            var data = null;

            if (node) {
                data = this._node.data;
                this._node = this._node.next;
            } else {
                return undefined;
            }

            return data;
        };

        this.iterate = function (callback, context) {
            var index = 0;

            while (this.hasNext()) {
                callback.call((context || this), this.next(), index);
                index = index + 1;
            }
        };
    };

    qd.iterate = function (iterable, callback, context) {
        iterable.iterator().iterate(callback, context);
    };

    qd.loop = function (times, callback, context) {
        var i,
            ctx = context || this;

        for (i = 0; i < times; i = i + 1) {
            callback.call(ctx, i);
        }
    };

    qd.while = function (condition, callback, context) {
        var i = 0,
            ctx = context || this;

        while (condition) {
            callback.call(ctx, i);
            i += 1;
        }
    };

    qd.until = function (condition, callback, context) {
        var i = 0,
            ctx = context || this;

        do {
            callback.call(ctx, i);
            i += 1;
        } while (condition);
    };

    qd.for = function (array, start, end, callback, context) {
        var i,
            ctx = context || this;

        for (i = start; i < end; i = i + 1) {
            callback.call(ctx, i);
        }
    };

    qd.min = function (array, comparator) {
        var i,
            minElement = array[0],
            value = null;

        for (i = 0; i < array.length; i = i + 1) {
            value = array[i];

            if (comparator(value, minElement) < 0) {
                minElement = value;
            }
        }

        return minElement;
    };

    qd.max = function (array, comparator) {
        var i,
            maxElement = array[0],
            value = null;

        for (i = 0; i < array.length; i = i + 1) {
            value = array[i];

            if (comparator(value, maxElement) > 0) {
                maxElement = value;
            }
        }

        return maxElement;
    };

    qd.findIndex = function (array, finder) {
        var i,
            foundIndex = -1;

        for (i = 0; i < array.length; i += 1) {
            if (finder(array[i])) {
                foundIndex = i;
                break;
            }
        }

        return foundIndex;
    };

    /**
     * Find an element in the array that matches the finder predicate.
     *
     * @param {Array} array
     * @param {Function} finder predicate that matches the element in the array to find
     * @return {*} the found element, otherwise returns undefined
     */
    qd.find = function (array, finder) {
        var i,
            found = undefined,
            element;

        for (i = 0; i < array.length; i += 1) {
            element = array[i];

            if (finder(element)) {
                found = element;
                break;
            }
        }

        return found;
    };

    qd.findAll = function (array, finder) {
        var i,
            element,
            found = [];

        for (i = 0; i < array.length; i += 1) {
            element = array[i];

            if (finder(element)) {
                found.push(element);
            }
        }

        return found;
    };

    qd.includes = function (array, element, matcher) {
        var predicate = matcher ||
            function (object) {
                return object === element;
            };

        return (qd.findIndex(array, predicate) > -1);
    };

    qd.every = function (array, matcher) {
        var i;

        for (i = 0; i < array.length; i += 1) {
            if (!matcher(array[i])) {
                return false;
            }
        }

        return true;
    };

    qd.collect = function (array, collector) {
        var i,
            element,
            collection = [];

        for (i = 0; i < array.length; i += 1) {
            element = array[i];
            if (collector(element)) {
                collection.push(element);
            }
        }

        return collection;
    };

    qd.filter = function (array, filter) {
        var i,
            element,
            filtered = [];

        for (i = 0; i < array.length; i += 1) {
            element = array[i];

            if (!filter(element)) {
                filtered.push(element);
            }
        }

        return filtered;
    };

    qd.remove = function (array, matcher) {
        var index = qd.findIndex(array, matcher);

        if (index > -1) {
            array.splice(index, 1);
        }

        return array;
    };

    qd.removeAll = function (array, matcher) {
        var i,
            oldArray = array.splice(0),
            element;

        array.length = 0;

        for (i = 0; i < oldArray.length; i += 1) {
            element = oldArray[i];

            if (!matcher(element)) {
                array.push(element);
            }
        }

        return array;
    };

    qd.map = function (array, mapper) {
        var i,
            mappedArray = [];

        for (i = 0; i < array.length; i += 1) {
            mappedArray.push(mapper(array[i]));
        }

        return mappedArray;
    };

    qd.flatten = function (array) {
        var i, j,
            flattenedArray = [],
            tempFlattenedArray;

        for (i = 0; i < array.length; i += 1) {
            if (!(array[i] instanceof Array)) {
                flattenedArray.push(array[i]);
            } else {
                tempFlattenedArray = this.flatten(array[i]);

                for (j = 0; j < tempFlattenedArray.length; j += 1) {
                    flattenedArray.push(tempFlattenedArray[j]);
                }
            }
        }

        return flattenedArray;
    };

    qd.swap = function (array, indexA, indexB) {
        var swapItem;

        if (indexA < array.length && indexB < array.length) {
            swapItem = array[indexA];
            array[indexA] = array[indexB];
            array[indexB] = swapItem;
        }

        return array;
    };

    qd.pushAll = function (array, elements) {
        var i;

        for (i = 0; i < elements.length; i += 1) {
            array.push(elements[i]);
        }

        return array;
    };

    qd.popEach = function (array, callback, context) {
        var ctx = context || this;

        while (array.length > 0) {
            callback.apply(ctx, array.pop());
        }

        return array;
    };

    qd.array = function () {
        var i,
            array = [];

        for (i = 0; i < arguments.length; i = i + 1) {
            array.push(arguments[i]);
        }

        return array;
    };

    qd.next = function (array, index) {
        var incIndex = index + 1,
            nextIndex = (incIndex === array.length) ? 0 : incIndex;

        return array[nextIndex];
    };

    qd.previous = function (array, index) {
        var decIndex = index - 1,
            previousIndex = (decIndex < 0) ? (array.length - 1) : decIndex;

        return array[previousIndex];
    };

    /* Properties Operations */

    qd.cloneProperties = function (properties) {
        return qd.copyProperties({}, properties);
    };

    qd.copyProperties = function (out, properties) {
        qd.eachProperty(properties, function (key, value) {
            out[key] = value;
        });

        return out;
    };

    qd.contains = function (properties, key) {
        return qd.isDefined(properties[key]);
    };

    qd.size = function (properties) {
        var size = 0,
            key;

        for (key in properties) {
            if (properties.hasOwnProperty(key)) {
                size += 1;
            }
        }

        return size;
    };

    qd.keys = function (properties) {
        var keys = [],
            key;

        for (key in properties) {
            if (properties.hasOwnProperty(key)) {
                keys.push(key);
            }
        }

        return keys;
    };

    qd.values = function (properties) {
        var values = [],
            key;

        for (key in properties) {
            if (properties.hasOwnProperty(key)) {
                values.push(properties[key]);
            }
        }

        return values;
    };

    qd.propertiesToArray = function (properties) {
        var propArray = [],
            property;

        qd.eachProperty(properties, function (key, value) {
            property[key] = value;
            propArray.push(property);
        });

        return propArray;
    };

    qd.addProperty = function (properties, property, value) {
        properties[property] = value;
        return properties;
    };

    /* String */

    qd.isNotBlank = function (str) {
        return (qd.isDefinedAndNotNull(str) && typeof str === "string" && str.length > 0);
    };

    qd.dotJoin = function (prefix, suffix) {
        return prefix + "." + suffix;
    };

    qd.capitalise = function (sentence) {
        if (qd.isNotBlank(sentence)) {
            return sentence.replace(/(?:^|\W)\w/g, function (a) {
                return a.toUpperCase();
            });
        }
    };

    qd.shrink = function (text) {
        return text.replace(' ', '');
    };

    qd.defaultValue = function (value, defaultVal) {
        if (qd.isDefinedAndNotNull(value)) {
            return value;
        }

        return defaultVal;
    };

    /* Arguments */

    qd.Args = function (args) {
        this._robustIsSameType = function (type0, type1) {
            return (type0.constructor === type1 || type0 instanceof type1);
        };

        this.init(args);
    };

    qd.Args.prototype.init = function (args) {
        this._args = args;

        return this;
    };

    qd.Args.prototype.empty = function () {
        return this._args.length === 0;
    };

    qd.Args.prototype.size = function () {
        return this._args.length;
    };

    qd.Args.prototype.get = function (index) {
        var arg = null;

        if (!this.empty()) {
            arg = this._args[index];
        }

        return arg;
    };

    qd.Args.prototype.matches = function () {
        var i,
            types,
            matches;

        types = arguments;
        matches = true;

        if (types.length !== this._args.length) {
            matches = false;
        } else {
            for (i = 0; i < types.length; i = i + 1) {
                if (!(this._robustIsSameType(this._args[i], types[i]))) {
                    matches = false;
                }
            }
        }

        return matches;
    };

    qd.Args.prototype.match = function (index, type) {
        var matches = false,
            arg = this.get(index);

        if (arg) {
            matches = this._robustIsSameType(arg.constructor, type);
        }

        return matches;
    };

    qd.Args.prototype.matchAll = function (type) {
        var i,
            matches = true;

        for (i = 0; i < this._args.length; i += 1) {
            if (!(this._robustIsSameType(this._args[i], type))) {
                matches = false;
            }
        }

        return matches
    };

    qd.Args.prototype.toArray = function () {
        return Array.prototype.slice.call(this._args);
    };

    qd.Args.prototype.clone = function () {
        return new qd.Args(this._args);
    };

    qd.Args.INSTANCE = new qd.Args();

    /**
     * Not thread safe.
     *
     * @param args
     * @return {*}
     */
    qd.args = function (args) {
        return qd.Args.INSTANCE.init(args);
    };

    qd.Id = function () {
        var id = 0;

        this.next = function () {
            id = id + 1;
            return id;
        };

        this.reset = function () {
            id = 0;
        };
    };

    qd.callbackWithContext = function (callback, context) {
        return function () {
            return callback.apply(context, arguments);
        };
    };

    /* HTML Document Operations */

    qd.download = function (filename, dataUrl, mimeType) {
        var link = document.createElement('a');

        link.download = filename;
        link.href = dataUrl;
        link.dataset.downloadurl = [mimeType, link.download, link.href].join(':');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    qd.onTimeout = function (callback, delay) {
        var id;
        return function () {
            clearTimeout(id);
            id = setTimeout(callback, delay);
        };
    };

    /* HTML Element Operations */

    qd.getElementById = function (id) {
        return window.document.getElementById(id);
    };

    qd.getElementsByTagName = function (tag) {
        return window.document.getElementsByTagName(tag);
    };

    qd.getElementsByClassName = function (className) {
        return window.document.getElementsByClassName(className);
    };

    qd.getElements = function (selector) {
        return window.document.querySelectorAll(selector);
    };

    qd.hasClass = function (element, className) {
        var hasClass = false,
            classNames = element.className;

        if (classNames.search(/\s/)) {
            hasClass = qd.includes(classNames.split(" "), className);
        } else {
            hasClass = (classNames === className);
        }

        return hasClass;
    };

    qd.measureElement = function (element) {
        return {
            width:element.offsetWidth,
            height:element.offsetHeight
        };
    };

    qd.measureClientWindow = function () {
        return {
            width:window.innerWidth || document.body.clientWidth,
            height:window.innerHeight || document.body.clientHeight
        };
    };

    /**
     * Add {@object qd.EventTrigger} to an object.
     *
     * @constructor
     */
    qd.EventTrigger = function () {
        this.init();
    };

    qd.EventTrigger.prototype.init = function () {
        this.listeners = [];
    };

    /**
     * The {@code EventTrigger} fires the event to all listeners listening to the event.
     */
    qd.EventTrigger.prototype.fire = function () {
        var i,
            listener;

        for (i = 0; i < this.listeners.length; i += 1) {
            listener = this.listeners[i];
            listener.handler.apply(listener.context, arguments);
        }
    };

    /**
     * Observers register with this {@code Subject} to receive notifications
     * via the {@code notifier} callback function.
     *
     * The {@code notifier) callback function will be called with same context as the
     * {@code observer}.
     *
     * @param context
     * @param handler
     */
    qd.EventTrigger.prototype.bind = function (namespace, handler, context) {
        this.listeners.push({ namespace:namespace, handler:handler, context:context });
    };

    qd.EventTrigger.prototype.unbind = function (namespace, handler, context) {
        qd.remove(this.listeners, function (listener) {
            return (listener.namespace === namespace
                && listener.handler === handler
                && listener.context === context);
        });
    };

    qd.EventTrigger.prototype.destroy = function () {
        this.listeners = undefined;
    };

    qd.toggleFullScreen = function () {
        if (!document.fullscreenElement && // alternative standard method
            !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {  // current working methods
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    };

    /**
     * Validator factory.
     *
     * @return {*}
     */
    qd.validator = function () {
        var args = new qd.Args(arguments),
            type,
            validator;

        // Positve or Negative validator
        if (args.matches(String)) {
            type = args.get(0);

            switch (type) {
                case "+":
                case "positive":
                case "is-positive":
                    validator = new (function () {
                        this.validate = function (value) {
                            return value > 0;
                        };
                    })();
                    break;
                case "-":
                case "negative":
                case "is-negative":
                    validator = new (function () {
                        this.validate = function (value) {
                            return value < 0;
                        };
                    })();
                    break;
                default:
                    validator = null;
            }
        }

        if (qd.isUndefined(validator)) {

            // Comparator validator
            if (args.matches(String, Number)) {
                type = args.get(0);

                switch (type) {
                    case "=":
                    case "equal":
                    case "equal-to":
                        validator = new (function () {
                            this.value = args.get(0);

                            this.validate = function (value) {
                                return value === this.value;
                            };
                        })();
                        break;
                    case ">":
                    case "greater-than":
                        validator = new (function () {
                            this.value = args.get(0);

                            this.validate = function (value) {
                                return value > this.value;
                            };
                        })();
                        break;
                    case ">=":
                    case "greater-than-or-equal":
                    case "greater-than-or-equal-to":
                        validator = new (function () {
                            this.value = args.get(0);

                            this.validate = function (value) {
                                return value >= this.value;
                            };
                        })();
                        break;
                    case "<":
                    case "less-than":
                        validator = new (function () {
                            this.value = args.get(0);

                            this.validate = function (value) {
                                return value < this.value;
                            };
                        })();
                        break;
                    case "<=":
                    case "less-than-or-equal":
                    case "less-than-or-equal-to":
                        validator = new (function () {
                            this.value = args.get(0);

                            this.validate = function (value) {
                                return value <= this.value;
                            };
                        })();
                        break;
                    default:
                        validator = null;
                }
            }

            if (qd.isUndefined(validator)) {

                // Range validator?
                if (args.matches(Number, Number)) {
                    validator = new (function () {
                        this.min = args.get(0);
                        this.max = args.get(1);

                        this.validate = function (value) {
                            return (value >= this.min && value <= this.max);
                        };
                    })();
                } else if (args.matches(RegExp)) {
                    // RegExp validator

                    validator = new (function () {
                        this.regex = args.get(0);

                        this.validate = function (value) {
                            return this.regex.test(value);
                        };
                    })();

                } else if (args.matches(Function)) {
                    // Custom validator

                    validator = new (function () {
                        this.validate = args.get(0);
                    })();
                } else if (args.matches(Array)) {
                    // Value Set validator

                    validator = new (function () {
                        this.values = args.get(0);

                        this.validate = function (value) {
                            return qd.includes(this.values, value);
                        };
                    })();
                }
                else {
                    validator = new (function () {
                        // Arbitrary argument set validator

                        this.values = args.toArray();

                        this.validate = function (value) {
                            return qd.includes(this.values, value);
                        };
                    })();
                }
            }
        }

        return validator;
    };

    qd.clamp = function (min, max, value) {
        var clampedValue;

        if (value > 0) {
            clampedValue = max;
        } else {
            clampedValue = min;
        }

        return clampedValue;
    };

    qd.Interval = function (min, max) {
        this.init(min, max);
    };

    qd.Interval.clamp = function (value, min, max) {
        var clampedValue;

        if (value <= max && value >= min) {
            clampedValue = value;
        } else if (max < value) {
            clampedValue = max;
        } else {
            clampedValue = min;
        }

        return clampedValue;
    };

    qd.Interval.prototype.init = function (min, max) {
        this.min = min;
        this.max = max;
    };

    qd.Interval.prototype.overlaps = function (interval) {
        return !(this.min > interval.max || interval.min > this.max);
    };

    qd.Interval.prototype.overlap = function (interval) {
        if (this.overlaps(interval)) {
            return Math.min(this.max, interval.max) - Math.max(this.min, interval.min);
        }

        return 0;
    };

    qd.Interval.prototype.contains = function (interval) {
        return interval.min > this.min && interval.max < this.max;
    };

    qd.Interval.prototype.clamp = function (value) {
        return qd.Interval.clamp(value, this.min, this.max);
    };

    /**
     * Rogue mode.
     *
     * Removes the global "qd" module from the window and returns a reference to it.
     *
     * This way, you do not pollute the window global and you can export the qd module
     * with whatever module loader you like.
     *
     * @return {Object} the qd module
     */
    qd.rogue = function () {
        if (qd.isDefinedAndNotNull(window.qd)) {
            qd.debug("qd has gone rogue!");
            window.qd = undefined;
        }

        return qd;
    };

    return qd;

}({});
(function (qd) {

    /**
     * Quick & Dirty Math
     *
     * TODO: Rename "qd.Math"
     */
    qd.math = {
        EPSILON: 0.000001,
        TAU: 2 * Math.PI,
        THREE_QUARTER_TAU: 3 * Math.PI / 2,
        HALF_TAU: Math.PI,
        THIRD_TAU: 2 * Math.PI / 3,
        QUARTER_TAU: Math.PI / 2,
        SIXTH_TAU: 2 * Math.PI / 6,
        CIRCLE: 360,
        THREE_QUARTER_CIRCLE: 270,
        HALF_CIRCLE: 180,
        THIRD_CIRCLE: 120,
        QUARTER_CIRCLE: 90,
        SIXTH_CIRCLE: 60,
        TO_DEGREES: 180 / Math.PI,
        TO_RADIANS: Math.PI / 180,

        square: function (value) {
            return value * value;
        },

        cube: function (value) {
            return value * value * value;
        },

        generateTable: function (start, end, inc, equation) {
            var i,
                table = new qd.Tuple.TYPE((end - start) / inc);

            for (i = start; i < end; i += inc) {
                table[i] = (equation(i));
            }

            return table;
        },

        /**
         * Get the x position of a point that has been rotating an arm of {@code length}
         * around a pivot with an x position of {@code pivotX} by the {@code angle}.
         *
         * @param {Number} pivotX
         * @param {Number} angle in radians
         * @param {Number} length
         * @return {Number}
         */
        rotateXPosition: function (pivotX, angle, length) {
            return (pivotX + Math.cos(angle) * length);
        },

        /**
         * Get the y position of a point that has been rotating an arm of {@code length}
         * around the pivot with a y position of {@code pivotY} by the {@code angle}.
         *
         * @param {Number} pivotY
         * @param {Number} angle in radians
         * @param {Number} length
         * @return {Number}
         */
        rotateYPosition: function (pivotY, angle, length) {
            return (pivotY + Math.sin(angle) * length);
        },

        /**
         * Get the angle of the line that connects the points
         * (x0, y0) and (x1, y1).
         *
         * @param {Number} x0
         * @param {Number} y0
         * @param {Number} x1
         * @param {Number} y1
         * @return {Number}
         */
        angleOf: function (x0, y0, x1, y1) {
            var dx = x1 - x0,
                dy = y1 - y0;
            return Math.atan2(dy, dx);
        },

        equalish: function (a, b, epsilon) {
            return Math.abs(a - b) <= (epsilon || this.EPSILON) * Math.max(1.0, Math.abs(a), Math.abs(b));
        },

        random: function (range) {
            return Math.random() * (range || 0);
        },

        randomIntBetween: function (a, b) {
            return Math.floor((b - a) * Math.random()) + a;
        },

        randomInt: function (range) {
            return Math.floor(range * Math.random());
        },

        randomElement: function (array) {
            return array[qd.randomInt(array.length) - 1];
        },

        scatter: function (centre, radius) {
            var rndRadius = this.random(radius),
                rndAngle = this.random(this.TAU),
                sin = Math.sin(rndAngle),
                cos = Math.cos(rndAngle),
                scatterPnt = qd.Point2D.translate(
                    qd.Point2D.clone(centre),
                    cos * rndRadius,
                    sin * rndRadius);

            return scatterPnt;
        },

        /**
         * Get the distance between the points (x0, y0) and (x1, y1).
         *
         * @param {Number} x0
         * @param {Number} y0
         * @param {Number} x1
         * @param {Number} y1
         * @return {Number}
         */
        distance: function (x0, y0, x1, y1) {
            var dx = x1 - x0,
                dy = y1 - y0;
            return Math.sqrt(dx * dx + dy * dy);
        },

        pythagoreanSolve: function (x, y) {
            return Math.sqrt(x * x + y * y);
        },

        /**
         * Get the intersection point between lines {@code lineA} and {@code lineB}.
         * Returns {@code null} if the two lines do not intersect.
         *
         * @param {qd.Point2D} out
         * @param {qd.math.Line} lineA
         * @param {qd.math.Line} lineB
         * @return {qd.Point2D} the point of intersection between lines {@code lineA} and {@code lineB}
         */
        intersectLines: function (out, lineA, lineB) {
            var dPx = lineA.pointB[0] - lineA.pointA[0],
                dPy = lineA.pointB[1] - lineA.pointA[1],
                dRx = lineB.pointB[0] - lineB.pointA[0],
                dRy = lineB.pointB[1] - lineB.pointA[1],
                denom = dRx * dPy - dRy * dPx,
                numer1 = dRx * (lineB.pointA[1] - lineA.pointA[1]) - dRy * (lineB.pointA[0] - lineA.pointA[0]),
                numer2 = dPx * (lineB.pointA[1] - lineA.pointA[1]) - dPy * (lineB.pointA[0] - lineA.pointA[0]),
                lambda1 = -1,
                lambda2 = -1;

            if (denom > 0.0) {
                lambda1 = numer1 / denom;
                lambda2 = numer2 / denom;

                if (lambda1 < 0.0 || lambda1 > 1.0 ||
                    lambda2 < 0.0 || lambda2 > 1.0) {
                    return null;
                }

                qd.Point2D.position(out,
                    lineA.pointA[0] + dPx * lambda1,
                    lineA.pointA[1] + dPy * lambda1
                );
            }

            return out;

        },

        /**
         * Linear interpolation between value {@code a} and {@code b}.
         *
         * @param {Number} a
         * @param {Number} b
         * @param {Number} lambda with range [0, 1]
         * @return {Number}
         */
        lerp: function (a, b, lambda) {
            return (1 - lambda) * a + lambda * b;
        },

        /**
         * Linear interpolation point between points {@code pointA} and {@code pointB}.
         *
         * If {@code lambda} is undefined, then it is assumed to be 0.5 (i.e. half way along
         * the linear interpolant).
         *
         * @param {qd.Point2D} out
         * @param {qd.Point2D} pointA
         * @param {qd.Point2D} pointB
         * @param {Number} lambda with range [0, 1]
         * @return {qd.Point2D} linear interpolation point
         */
        lerpPoint2D: function (out, pointA, pointB, lambda) {
            var lerp = qd.math.lerp;

            out[0] = lerp(pointA[0], pointB[0], lambda);
            out[1] = lerp(pointA[1], pointB[1], lambda);

            return out;
        },

        /**
         * Linear interpolation point a distance of {@code distance} along the
         * the line between {@code pointA} and {@code pointB}.
         *
         * @param {qd.Point2D} out
         * @param {qd.Point2D} pointA (x0, y0)
         * @param {qd.Point2D} pointB (x1, y1)
         * @param {Number} distance with range [0, sqrt((x1 - x0)^2 + (y1 - y0)^2)]
         * @return {qd.Point2D} linear interpolation point
         */
        lerpPoint2DByDistance: function (out, pointA, pointB, distance) {
            var lambda = distance / qd.Point2D.distance(pointA, pointB);

            return qd.math.lerpPoint2D(out, pointA, pointB, lambda);
        },

        /**
         * Returns the point S such that the line has
         * length distance and is turned anticlockwise by 90 degrees from the
         * given {@code line}.
         *
         * @param {qd.Point2D} out
         * @param {qd.math.Line} line
         * @param {Number} distance
         * @return {qd.Point2D} out
         */
        perpendicularByDistance: function (out, pointA, pointB, distance) {
            var deltaX,
                deltaY,
                r;

            deltaX = pointB[0] - pointA[0];
            deltaY = pointB[1] - pointA[1];
            r = qd.Point2D.create(pointB[0] - deltaY, pointB[1] + deltaX);

            return qd.math.lerpPoint2DByDistance(out, pointB, r, distance);
        },

        /**
         * Returns a point S on the given {@code line} such that the line through
         * S and the {@code offLine} point is perpendicular to the given {@code line}.
         *
         * @param {qd.Point2D} out
         * @param {qd.math.Line} line
         * @param {qd.Point2D} offLine
         * @return {qd.Point2D}
         */
        perpendicularBasePoint: function (out, line, offLine) {
            var deltaX, deltaY, f, d, lambda;

            deltaX = line.pointB[0] - line.pointA[0];
            deltaY = line.pointB[1] - line.pointA[1];
            f = deltaX * (offLine[0] - line.pointA[0]) + deltaY * (offLine[1] - line.pointA[1]);
            d = deltaX * deltaX + deltaY * deltaY;
            lambda = f / d;

            return qd.math.lerpPoint2D(out, line.pointA(), line.pointB(), lambda);
        },

        /**
         * Returns a point that when connected with the the {@code offLine}
         * point makes a line that is parallel to the given {@code line}.
         *
         * @param {qd.math.Line} line
         * @param {qd.Point2D} offLine
         * @return {qd.Point2D}
         */
        parallelPoint: function (line, offLine) {
            var deltaX, deltaY;

            deltaX = line.pointB[0] - line.pointA[0];
            deltaY = line.pointB[1] - line.pointA[1];

            return new qd.Point2D(offLine[0] + deltaX, offLine[1] + deltaY);
        },

        round: function (number, sigFigs) {
            return Math.round(number * sigFigs) / sigFigs;
        },

        fastFloor: function (value) {
            return (0.5 + value) | 0;
        },

        centroid: function (centroid, points) {
            var centroid = centroid || qd.Point2D.create(0, 0);

            if (points.length > 3) {
                return this.polygonCentroid(centroid, points);
            } else if (points.length === 3) {
                return this.triangleCentroid(centroid, points[0], points[1], points[2]);
            } else if (points.length === 2) {
                return this.lerpPoint2D(centroid, points[0], points[1], 0.5);
            } else if (points.length === 1) {
                return qd.Point2D.copy(centroid, points[0]);
            }

            return centroid;
        },

        triangleCentroid: function (centroid, a, b, c) {
            centroid[0] = (a[0] + b[0] + c[0]) / 3;
            centroid[1] = (a[1] + b[1] + c[1]) / 3;
            return centroid;
        },

        /**
         * The centroid of a non-self-intersecting closed polygon defined by n vertices
         *
         * https://en.wikipedia.org/wiki/Centroid#Centroid_of_polygon
         * https://stackoverflow.com/questions/2792443/finding-the-centroid-of-a-polygon
         *
         * @param {qd.Point2D} centroid the receiving point
         * @param {Array} points
         * @return {qd.Point2D} centroid
         */
        polygonCentroid: function (centroid, points) {
            var pointsCount = points.length,
                signedArea = 0.0,
                sixSignedArea,
                currentPointX = 0.0,
                currentPointY = 0.0,
                nextPointX = 0.0,
                nextPointY = 0.0,
                partialSignedArea = 0.0,
                point = null,
                i;

            for (i = 0; i < pointsCount; i = i + 1) {
                point = points[i];
                currentPointX = point[0];
                currentPointY = point[1];

                point = points[(i+1) % pointsCount];
                nextPointX = point[0];
                nextPointY = point[1];

                partialSignedArea = currentPointX * nextPointY - nextPointX * currentPointY;
                signedArea += partialSignedArea;
                centroid[0] += (currentPointX + nextPointX) * partialSignedArea;
                centroid[1] += (currentPointY + nextPointY) * partialSignedArea;
            }

            signedArea *= 0.5;
            sixSignedArea = 6.0 * signedArea;
            centroid[0] /= sixSignedArea;
            centroid[1] /= sixSignedArea;

            return centroid;
        },

        isPolygonConvex: function (points) {
            // Convex if all interior angles are less than 180 degrees
            //
        },

        /**
         * Calculates the winding sum for a closed polygon.
         *
         * For a right-handed cartesian coordinate system:
         *   - A positive winding sum indicates a clockwise winding.
         *   - A negative winding sum indicates an anti-clockwise winding.
         *
         * In a right-handed canvas coordinate system (reversed y-axis):
         *   - A positive winding sum indicates an anti-clockwise winding.
         *   - A negative winding sum indicates a clockwise winding.
         *
         * @param {Array} points
         * @return {Number} winding sum
         */
        polygonWindingSum: function (points) {
            var windingSum = 0,
                pointsCount = points.length,
                currentIndex,
                nextIndex,
                current,
                next;

            for (currentIndex = 0; currentIndex < pointsCount; currentIndex += 1) {
                nextIndex = (currentIndex + 1) % pointsCount;

                current = points[currentIndex];
                next = points[nextIndex];

                // Sum( (x[(i+1) mod N] - x[i]) * (y[i] + y[(i+1) mod N]) )
                windingSum += (next[0] - current[0]) * (current[1] + next[1]);
            }

            return windingSum;
        },

        circleTopPoint: function (centre, radius) {
            return qd.Point2D.create(centre[0], (centre[1] - radius));
        },

        circleBottomPoint: function (centre, radius) {
            return qd.Point2D.create(centre[0], (centre[1] + radius));
        },

        circleLeftPoint: function (centre, radius) {
            return qd.Point2D.create((centre[0] - radius), centre[1]);
        },

        circleRightPoint: function (centre, radius) {
            return qd.Point2D.create((centre[0] + radius), centre[1]);
        },

        /**
         * qd.InterpolationFunction
         *
         * @param {Array} points
         * @constructor
         */
        InterpolationFunction: function (points) {
            var _rangeComparator = function (pointA, pointB) {
                return pointA[0] - pointB[0];
            };

            this.points = points;
            this.rangeMin = qd.min(points, _rangeComparator);
            this.rangeMax = qd.max(points, _rangeComparator);

            this.point = function (lambda) {
                var x = qd.math.lerp(this.rangeMin[0], this.rangeMax[0], lambda),
                    xIndex,
                    point,
                    prevPoint,
                    xDistance,
                    nodeDistance,
                    y,
                    lambdaY;

                // For each node
                for (xIndex = 0; xIndex < this.points.length; xIndex += 1) {
                    point = this.points[xIndex];

                    if (x === point[0]) {
                        return point;
                    } else if (x > point[0]) {
                        // Do nothing. Go to the next node.
                        prevPoint = this.points[xIndex];
                    } else {
                        // Otherwise this x is lower than the current node
                        // and it is greater than the previous node

                        // Calculate the proportion dx from the previous node to the
                        // current node.
                        // Formula: dX = distance between x and previous node
                        //                  / distance between nodes
                        xDistance = x - prevPoint[0];
                        nodeDistance = point[0] - prevPoint[0];
                        lambdaY = xDistance / nodeDistance;

                        y = qd.math.lerp(prevPoint[1], point[1], lambdaY);

                        return qd.Point2D.create(x, y);
                    }
                }

                return undefined;
            }
        },

        Radians: function (radians) {
            var _radians = radians;

            this.rotateRadians = function (radians) {
                _radians = qd.math.addRadians(_radians, radians);
            };

            this.rotateDegrees = function (degrees) {
                _radians = qd.math.addRadians(_radians, qd.math.toRadians(degrees));
            };

            this.radians = function () {
                return _radians;
            };

            this.degrees = function () {
                return qd.math.toDegrees(_radians);
            };

            this.toDegrees = function () {
                return new qd.math.Degrees(qd.math.toDegrees(_radians));
            }
        },

        Degrees: function (degrees) {
            var _degrees = degrees;

            this.rotateRadians = function (radians) {
                _degrees = qd.math.addDegrees(_degrees, qd.math.toDegrees(radians));
            };

            this.rotateDegrees = function (degrees) {
                _degrees = qd.math.addDegrees(_degrees, degrees);
            };

            this.radians = function () {
                return qd.math.toRadians(_degrees);
            };

            this.degrees = function () {
                return _degrees;
            };

            this.toRadians = function () {
                return new qd.math.Radians(qd.math.toRadians(_degrees));
            }
        },

        toDegrees: function (radians) {
            return radians * qd.math.TO_DEGREES;
        },

        toRadians: function (degrees) {
            return degrees * qd.math.TO_RADIANS;
        },

        radians: function (r) {
            var angle = r,
                TAU = this.TAU;

            if (r > TAU) {
                angle = r % TAU;
            } else if (r < 0) {
                angle = (r % TAU) + TAU;
            }


            return angle;
        },

        degrees: function (r) {
            var angle = r,
                CIRCLE = this.CIRCLE;

            if (r > CIRCLE) {
                angle = r % CIRCLE;
            } else if (r < 0) {
                angle = (r % CIRCLE) + CIRCLE;
            }

            return angle;
        },

        addRadians: function (r, dr) {
            return qd.math.radians(r + dr);
        },

        addDegrees: function (r, dr) {
            return qd.math.degrees(r + dr);
        },

        biasGreaterThan: function (a, b) {
            var kBiasRelative = 0.95,
                kBiasAbsolute = 0.01;

            return a >= b * kBiasRelative + a * kBiasAbsolute;
        },

        biasLessThan: function (a, b) {
            var kBiasRelative = 0.95,
                kBiasAbsolute = 0.01;

            return a <= b * kBiasRelative + a * kBiasAbsolute;
        }

    };

    qd.math.sinTable = qd.math.generateTable(0, 360, 1, function (degrees) {
        return Math.sin(qd.math.toRadians(degrees));
    });

    qd.math.fastSin = function (x) {
        var y,
            degrees = qd.math.degrees(x),
            shift = new Number(degrees);

        if ((shift | 0) === degrees) {
            y = qd.math.sinTable[degrees];
        } else {
            y = Math.sin(x);
        }

        return y;
    };

    qd.math.fasterSin = function (x) {
        var degrees = qd.math.fastFloor(x);

        return qd.math.sinTable[degrees];
    };

    qd.math.cosTable = qd.math.generateTable(0, 360, 1, function (degrees) {
        return Math.cos(qd.math.toRadians(degrees));
    });

    qd.math.fastCos = function (x) {
        var y,
            degrees = qd.math.degrees(x),
            shift = new Number(degrees);

        if ((shift | 0) === degrees) {
            y = qd.math.cosTable[degrees];
        } else {
            y = Math.cos(x);
        }

        return y;
    };

    qd.math.fasterCos = function (x) {
        var degrees = qd.math.fastFloor(x);
        return qd.math.cosTable[degrees];
    };

    qd.math.Line = function () {
        var args = new qd.Args(arguments);

        this._pointA = null;
        this._pointB = null;

        if (args.matches(Number, Number, Number, Number)) {
            this._pointA = qd.Point2D.create(args.get(0), args.get(1));
            this._pointB = qd.Point2D.create(args.get(2), args.get(3));
        } else if (args.matches(qd.Point2D, qd.Point2D)) {
            this._pointA = args.get(0);
            this._pointB = args.get(1);
        } else if (args.matches(qd.math.Line)) {
            this._pointA = args.get(0).pointA();
            this._pointB = args.get(0).pointA();
        }
    };

    qd.math.Line.prototype.pointA = function (pointA) {
        if (qd.isDefinedAndNotNull(pointA)) {
            this._pointA = pointA;
            return this;
        }

        return this._pointA;
    };

    qd.math.Line.prototype.pointB = function (pointB) {
        if (qd.isDefinedAndNotNull(pointB)) {
            this._pointB = pointB;
            return this;
        }

        return this._pointB;
    };

    qd.math.Line.prototype.dx = function () {
        return this._pointB.x - this._pointA.x;
    };

    qd.math.Line.prototype.dy = function () {
        return this._pointB.y - this._pointA.y;
    };

    qd.math.Line.prototype.gradient = function () {
        return this.dy() / this.dx();
    };

    qd.math.Line.prototype.lineLength = function () {
        return qd.Point2D.distance(this._pointA, this._pointB);
    };

    qd.math.Line.prototype.angle = function () {
        return Math.atan2(this.dy(), this.dx());
    };

    qd.math.Line.prototype.copy = function () {
        return new qd.math.Line(this._pointA, this._pointB);
    };

    /**
     * Circle shape.
     */
    qd.math.Circle = function (centre, radius) {
        this.centre = centre;
        this.radius = radius;
    };

    qd.math.Circle.prototype.clone = function () {
        return new qd.Circle(this.centre, this.radius);
    };

    qd.math.Circle.prototype.copy = function (circle) {
        this.centre = circle.centre;
        this.radius = circle.radius;
        return this;
    };

    qd.math.Circle.prototype.diameter = function () {
        return this.radius * 2;
    };

    qd.math.Circle.prototype.perimeter = function () {
        return qd.math.TAU * this.radius;
    };

    qd.math.Circle.prototype.area = function () {
        return qd.math.HALF_TAU * this.radius * this.radius;
    };

    qd.math.Circle.prototype.pointAt = function (angle) {
        var x = qd.math.rotateXPosition(0, angle, this.radius),
            y = qd.math.rotateYPosition(0, angle, this.radius);

        return new qd.Point2D.create(x, y);
    };

    /**
     *
     * @param pointA
     * @param pointB
     * @constructor
     */
    qd.math.Rectangle = function (pointA, pointB) {
        this.min;
        this.max;
        this.width;
        this.height;

        this.init(pointA, pointB);
    };

    qd.math.Rectangle.prototype.init = function (pointA, pointB) {
        var width = pointB[0] - pointA[0],
            height = pointB[1] - pointA[1];

        if (width < 0 && height < 0) {
            this.min = pointB;
            this.max = pointA;
            this.width = -width;
            this.height = -height;
        } else if (width < 0 && height > 0) {
            this.min = qd.Point2D.create(pointB[0], pointA[1]);
            this.max = qd.Point2D.create(pointA[0], pointB[1]);
            this.width = -width;
            this.height = height;
        } else if(width > 0 && height < 0) {
            this.min = qd.Point2D.create(pointA[0], pointB[1]);
            this.max = qd.Point2D.create(pointB[0], pointA[1]);
            this.width = width;
            this.height = -height;
        } else {
            this.min = pointA;
            this.max = pointB;
            this.width = width;
            this.height = height;
        }
    };

    qd.math.Rectangle.prototype.area = function () {
        return this.width * this.height;
    };
}(qd));
(function (qd) {

    /**
     * TODO: Should be able to use "instanceof"
     * TODO: Consider wrapping canvas coordinates into the same point (might be confusing and unnecessary)
     * TODO: Points and Vectors are the same thing. We can remove duplication by treating both as points.
     *
     * @type {Object}
     */
    qd.Point2D = {

        ORIGIN: qd.Tuple.create(0, 0),

        /**
         * Create a point.
         *
         * @param {Number?} x
         * @param {Number?} y
         */
        create: function (x, y) {
            return qd.Tuple.create(x || 0.0, y || 0.0);
        },

        /**
         * Set the coordinate of the point {@code a}.
         *
         * @param {qd.Point2D} out
         * @param {Number} x
         * @param {Number} y
         * @return {qd.Point2D} out
         */
        set: function (out, x, y) {
            out[0] = x;
            out[1] = y;
            return out;
        },

        /**
         * Copy a point.
         *
         * @param {qd.Point2D} out
         * @param {qd.Point2D} point to copy
         * @return {qd.Point2D} out
         */
        copy: function (out, point) {
            out[0] = point[0];
            out[1] = point[1];
            return out;
        },

        /**
         * Copy points in array.
         *
         * @param {Array} out
         * @param {Array} points
         * @return {Array} out
         */
        copyAll: function (out, points) {
            var i;

            for (i = 0; i < points.length; i += 1) {
                this.copy(out[i], points[i]);
            }

            return out;
        },

        /**
         * Copy scalar values.
         *
         * @param out
         * @param x
         * @param y
         * @return {*}
         */
        copyScalar: function (out, x, y) {
            out[0] = x;
            out[1] = y;
            return this;
        },

        /**
         * Clone a point
         *
         * @param {qd.Point2D} point to clone
         * @return {qd.Point2D}
         */
        clone: function (point) {
            return this.create(point[0], point[1]);
        },

        /**
         * Clone the array.
         *
         * @param {Array} points
         * @return {Array} cloned points
         */
        cloneAll: function (points) {
            var i,
                out = new Array(points.length);

            for (i = 0; i < points.length; i += 1) {
                out[i] = this.clone(points[i]);
            }

            return out;
        },

        /**
         * Equality operator.
         *
         * @param {qd.Point2D} a
         * @param {qd.Point2D} b
         * @return {Boolean} true if a is equal to b, otherwise false
         */
        equals: function (a, b) {
            var i;

            if (a == null || b == null) {
                return false;
            }

            if (a === b) {
                return true;
            }

            if (a.length !== b.length) {
                return false;
            }

            for (i = 0; i < a.length; i += 1) {
                if (a[i] !== b[i]) {
                    return false;
                }
            }

            return true;
        },

        /**
         * Zero the point.
         *
         * @param {qd.Point2D} out
         * @return {qd.Point2D} point
         */
        mutateZero: function (out) {
            out[0] = 0;
            out[1] = 0;
            return out;
        },

        /**
         * Negate the {@code point}
         *
         * @param {qd.Point2D} out
         * @return {qd.Point2D} the negated point
         */
        mutateNegate: function (out) {
            out[0] = -out[0];
            out[1] = -out[1];
            return out;
        },

        /**
         * Scale the {@code point} by {@code (sx, sy)}.
         *
         * @param out
         * @param sx
         * @param sy
         * @return {qd.Point2D} point
         */
        mutateScale: function (out, sx, sy, origin) {
            var originX = origin[0] || 0.0,
                originY = origin[1] || 0.0;

            out[0] = (out[0] - originX) * sx + originX;
            out[1] = (out[1] - originY) * sy + originX;
            return out;
        },

        mutateInverseScale: function (out, sx, sy, origin) {
            var originX = origin[0] || 0.0,
                originY = origin[1] || 0.0;

            out[0] = (out[0] - originX) / sx + originX;
            out[1] = (out[1] - originY) / sy + originX;
            return out;
        },

        mutateAddScalar: function (out, s) {
            out[0] += s;
            out[1] += s;
            return out;
        },

        mutateSubtractScalar: function (out, s) {
            out[0] += s;
            out[1] += s;
            return out;
        },

        mutateMultiplyScalar: function (out, s) {
            out[0] *= s;
            out[1] *= s;
            return out;
        },

        mutateDivideScalar: function (out, s) {
            out[0] /= s;
            out[1] /= s;
            return out;
        },

        /**
         * Add the point {@code point} to {@code out} point.
         *
         * @param {qd.Point2D} out
         * @param {qd.Point2D} point
         * @return {qd.Point2D} out
         */
        mutateAdd: function (out, point) {
            out[0] = out[0] + point[0];
            out[1] = out[1] + point[1];
            return out;
        },

        /**
         * Subtract the point {@code point} from {@code out} point.
         *
         * @param {qd.Point2D} out
         * @param {qd.Point2D} point
         * @return {qd.Point2D} out
         */
        mutateSubtract: function (out, point) {
            out[0] = out[0] - point[0];
            out[1] = out[1] - point[1];
            return out;
        },

        /**
         * Project this point out to a distance of {@code length} starting from a point
         * and by the given {@code angle}.
         *
         * @param {qd.Point2D} out
         * @param {qd.Point2D} point
         * @param {Number} angle in degrees
         * @param {Number} length
         * @return {qd.Point2D} out
         */
        project: function (out, point, angle, length) {
            out[0] = (point[0] + qd.math.fasterCos(angle) * length);
            out[1] = (point[1] + qd.math.fasterSin(angle) * length);
            return out;
        },

        /**
         * Get the distance between {@code pointA} and {@code pointB}
         *
         * @param {qd.Point2D} pointA
         * @param {qd.Point2D} pointB
         * @return {Number} distance between {@code pointA} and {@code pointB}
         */
        distance: function (pointA, pointB) {
            var dx = pointB[0] - pointA[0],
                dy = pointB[1] - pointA[1];
            return Math.sqrt(dx * dx + dy * dy);
        },

        /**
         * Scale the point {@code a} by {@code (sx, sy)}.
         *
         * @param {qd.Point2D}out
         * @param {Number} sx
         * @param {Number} sy
         * @param {qd.Point2D} a
         * @return {qd.Point2D}
         */
        scale: function (out, sx, sy, a) {
            out[0] = a[0] * sx;
            out[1] = a[1] * sy;
            return out;
        },

        scaled: function (out, s) {
            out[0] = out[0] * s;
            out[1] = out[0] * s;
            return out;
        },

        /**
         * Apply the inverse scale to the point {@code a} by {@code (sx, sy)}.
         *
         * @param {qd.Point2D}out
         * @param {Number} sx
         * @param {Number} sy
         * @param {qd.Point2D} a
         * @return {qd.Point2D}
         */
        inverseScale: function (out, sx, sy, a) {
            out[0] = a[0] / sx;
            out[1] = a[1] / sy;
            return out;
        },

        /**
         * Multiply the point {@code a} by the scalar {@code s}.
         *
         * @param {qd.Point2D}out
         * @param {Number} sx
         * @param {Number} sy
         * @param {qd.Point2D} a
         * @return {qd.Point2D}
         */
        multiplyScalar: function (out, s, a) {
            out[0] = a[0] * s;
            out[1] = a[1] * s;
            return out;
        },

        /**
         * Divide the point {@code a} by the scalar {@code s}.
         *
         * @param {qd.Point2D}out
         * @param {Number} sx
         * @param {Number} sy
         * @param {qd.Point2D} a
         * @return {qd.Point2D}
         */
        divideScalar: function (out, s, a) {
            out[0] = a[0] / s;
            out[1] = a[1] / s;
            return out;
        },

        /**
         * Add points {@code pointA} and {@code pointB}.
         *
         * @param {qd.Point2D} out
         * @param {qd.Point2D} pointA
         * @param {qd.Point2D} pointB
         * @return {qd.Point2D} out
         */
        add: function (out, pointA, pointB) {
            out[0] = pointA[0] + pointB[0];
            out[1] = pointA[1] + pointB[1];
            return out;
        },

        /**
         * Subtract {@code pointB} from {@code pointA}.
         *
         * @param {qd.Point2D} out
         * @param {qd.Point2D} pointA
         * @param {qd.Point2D} pointB
         * @return {qd.Point2D} out
         */
        subtract: function (out, pointA, pointB) {
            out[0] = pointA[0] - pointB[0];
            out[1] = pointA[1] - pointB[1];
            return out;
        },

        /**
         * Move the {@code point} to position {@code (x, y)}.
         *
         * @param {qd.Point2D} point
         * @param {Number} x
         * @param {Number} y
         * @return {qd.Point2D} point
         */
        position: function (point, x, y) {
            point[0] = x;
            point[1] = y;
            return point;
        },

        /**
         * Move all the {@code points} to position {@code (x, y)}.
         *
         * @param {Array} points
         * @param {Number} x
         * @param {Number} y
         * @return {Array} points
         */
        positionAll: function (points, x, y) {
            var i,
                point;

            for (i = 0; i < points.length; i += 1) {
                point = points[i];
                point[0] = x;
                point[1] = y;
            }

            return points;
        },

        /**
         * Translate the {@code point) by {@code (dx, dy)}.
         *
         * @param {qd.Point2D} point
         * @param {Number} dx
         * @param {Number} dy
         * @return {qd.Point2D} point
         */
        translate: function (point, dx, dy) {
            point[0] = point[0] + dx;
            point[1] = point[1] + dy;
            return point;
        },

        /**
         * Translate all the {@code points) by {@code (dx, dy)}.
         *
         * @param {Array} points
         * @param dx
         * @param dy
         * @return {Array} points
         */
        translateAll: function (points, dx, dy) {
            var i,
                point;

            for (i = 0; i < points.length; i += 1) {
                point = points[i];
                point[0] += dx;
                point[1] += dy;
            }

            return points;
        },

        /**
         * Scale all the {@code points} by {@code (sx, sy)}.
         *
         * @param {Array} points
         * @param {Number} sx
         * @param {Number} sy
         * @return {Array} points
         */
        scaleAll: function (points, sx, sy, origin) {
            var i,
                point,
                originX = origin[0] || 0.0,
                originY = origin[1] || 0.0,
                dx,
                dy;

            for (i = 0; i < points.length; i += 1) {
                point = points[i];

                dx = point[0] - originX;
                dy = point[1] - originY;

                point[0] = (point[0] - originX) * sx + originX;
                point[1] = (point[1] - originY) * sy + originY;
            }

            return points;
        },

        /**
         * Skew the {@code point} by {@code (kx, ky)} with respect
         * to the {@code origin}.
         *
         * @param {qd.Point} point
         * @param {Number} kx
         * @param {Number} ky
         * @param {qd.Point} origin
         * @return {qd.Point} point
         */
        skew: function (point, kx, ky, origin) {
            var x,
                y,
                originX = origin[0] || 0.0,
                originY = origin[1] || 0.0;

            x = point[0] - originX;
            y = point[1] - originY;
            point[0] = (1 + kx * ky) * x + kx * y + originX;
            point[1] = ky * x + y + originY;

            return point;
        },

        /**
         * Skew all the {@code points} by {@code (kx, ky)} with respect
         * to the {@code origin}.
         *
         * @param {Array} points
         * @param {Number} kx
         * @param {Number} ky
         * @param {qd.Point} origin
         * @return {Array} points
         */
        skewAll: function (points, kx, ky, origin) {
            var i,
                point,
                x,
                y,
                originX = origin[0] || 0.0,
                originY = origin[1] || 0.0;

            for (i = 0; i < points.length; i += 1) {
                point = points[i];
                x = point[0] - originX;
                y = point[1] - originY;
                point[0] = (1 + kx * ky) * x + kx * y + originX;
                point[1] = ky * x + y + originY;
            }

            return points;
        },

        /**
         * Rotate the {@code point} around the {@code pivot} by
         * {@code angle} radians.
         *
         * @param {qd.Point2D} point
         * @param dtheta in radians
         * @param {qd.Point2D} pivot point to rotate around
         * @return {qd.Point2D} point
         */
        rotate: function (point, dtheta, pivot) {
            var cos = Math.cos(dtheta),
                sin = Math.sin(dtheta),
                x,
                y,
                pivotX = pivot[0] || 0.0,
                pivotY = pivot[1] || 0.0;

            x = point[0] - pivotX;
            y = point[1] - pivotY;
            point[0] = x * cos + y * sin + pivotX;
            point[1] = -x * sin + y * cos + pivotY;

            return point;
        },

        /**
         * Rotate all the {@code points} around the {@code pivot} by
         * {@code angle} radians.
         *
         * @param {Array} points
         * @param {Number} dtheta in radians
         * @param {qd.Point2D} pivot point to rotate around
         * @return {Array} points
         */
        rotateAll: function (points, dtheta, pivot) {
            var i,
                point,
                cos = Math.cos(dtheta),
                sin = Math.sin(dtheta),
                x,
                y,
                pivotX = pivot[0] || 0.0,
                pivotY = pivot[1] || 0.0;

            for (i = 0; i < points.length; i += 1) {
                point = points[i];
                x = point[0] - pivotX;
                y = point[1] - pivotY;
                point[0] = x * cos + y * sin + pivotX;
                point[1] = -x * sin + y * cos + pivotY;
            }

            return points;
        },

        /**
         * Rotate the {@code point} around the {@code pivot} by
         * {@code angle} radians, then translate by {@code (dx, dy)}.
         *
         * @param {qd.Point2D} point
         * @param dtheta in radians
         * @param {qd.Point2D} pivot point to rotate around
         * @param {Number} dx translation along x-axis
         * @param {Number} dy translation along y-axis
         * @return {qd.Point2D} point
         */
        rotateAndTranslate: function (point, dtheta, pivot, dx, dy) {
            var cos = Math.cos(dtheta),
                sin = Math.sin(dtheta),
                x,
                y,
                pivotX = pivot[0] || 0.0,
                pivotY = pivot[1] || 0.0;

            x = point[0] - pivotX;
            y = point[1] - pivotY;
            point[0] = x * cos + y * sin + pivotX + dx;
            point[1] = -x * sin + y * cos + pivotY + dy;

            return point;
        },

        /**
         * Rotate all the {@code points} around the {@code pivot} by
         * {@code angle} radians, then translate by {@code (dx, dy)}.
         *
         * @param {Array} points
         * @param {Number} dtheta in radians
         * @param {qd.Point2D} pivot point to rotate around
         * @param {Number} dx translation along x-axis
         * @param {Number} dy translation along y-axis
         * @return {Array} points
         */
        rotateAndTranslateAll: function (points, dtheta, pivot, dx, dy) {
            var i,
                point,
                cos = Math.cos(dtheta),
                sin = Math.sin(dtheta),
                x,
                y,
                pivotX = pivot[0] || 0.0,
                pivotY = pivot[1] || 0.0;

            for (i = 0; i < points.length; i += 1) {
                point = points[i];
                x = point[0] - pivotX;
                y = point[1] - pivotY;
                point[0] = x * cos + y * sin + pivotX + dx;
                point[1] = -x * sin + y * cos + pivotY + dy;
            }

            return points;
        },

        /**
         * Reflect the {@code point} around the {@code line}
         * positioned at {@code linePos}.
         *
         * @param {qd.Point2D} point
         * @param {qd.Vector2D} line
         * @param {qd.Point2D} linePos
         * @return {qd.Point2D} point
         */
        reflect: function (point, line, linePos) {
            // TODO

            return point;
        },

        /**
         * Reflect all the {@code points} around the {@code line}
         * positioned at {@code linePos}.
         *
         * @param {Array} points
         * @param {qd.Vector2D} line
         * @param {qd.Point2D} linePos
         * @return {Array} points
         */
        reflectAll: function (points, line, linePos) {
            var i,
                point,
                x,
                y,
                lx,
                ly,
                lXSquared,
                lYSquared,
                twoLxLy,
                linePosX,
                linePosY;

            line = line.normalise();
            lx = line[0];
            ly = line[1];
            lXSquared = lx * lx;
            lYSquared = ly * ly;
            twoLxLy = 2 * lx * ly;

            linePosX = linePos[0] || 0.0;
            linePosY = linePos[1] || 0.0;

            for (i = 0; i < points.length; i += 1) {
                point = points[i];
                x = point[0] - linePosX;
                y = point[1] - linePosY;
                point[0] = (lXSquared - lYSquared) * x + (twoLxLy * y) + linePosX
                point[1] = (lYSquared - lXSquared) * y + (twoLxLy * x) + linePosY;
            }

            return points;
        },

        /**
         * Transform the {@code point} by the {@code matrix}.
         *
         * @param point
         * @param matrix
         * @return point
         */
        transform: function (point, matrix) {
            // TODO

            return point;
        }
    }

}(qd));
(function (qd) {

    "use strict";

    /**
     * qd.Vector2D
     *
     * @module
     */
    qd.Vector2D = {

        /**
         * Create a vector with components {@code (x, y)}.
         *
         * @param {Number} x
         * @param {Number} y
         * @return {qd.Vector2D}
         */
        create: function (x, y) {
            return qd.Tuple.create(x || 0.0, y || 0.0);
        },

        /**
         * Set the direction of the vector {@code a}.
         *
         * @param {qd.Vector2D} out
         * @param {Number} x
         * @param {Number} y
         * @return {qd.Vector2D} out
         */
        set: function (out, x, y) {
            out[0] = x;
            out[1] = y;
            return out;
        },

        /**
         * Copy the vector {@code a}.
         *
         * @param {qd.Vector2D} out
         * @param {qd.Vector2D} a
         * @return {qd.Vector2D} out
         */
        copy: function (out, a) {
            out[0] = a[0];
            out[1] = a[1];
            return out;
        },

        /**
         * Clone the vector {@code a}.
         *
         * @param {qd.Vector2D} a
         * @return {qd.Vector2D} the cloned vector
         */
        clone: function (a) {
            return qd.Vector2D.create(a[0], a[1]);
        },

        /**
         * Equality operator.
         *
         * @param {qd.Vector2D} a
         * @param {qd.Vector2D} b
         * @return {Boolean} true if a is equal to b, otherwise false
         */
        equals: function (a, b) {
            var i;

            if (a == null || b == null) {
                return false;
            }

            if (a === b) {
                return true;
            }

            if (a.length !== b.length) {
                return false;
            }

            for (i = 0; i < a.length; i += 1) {
                if (!qd.math.equalish(a[i], b[i])) {
                    return false;
                }
            }

            return true;
        },

        /**
         * Create an array of qd.Vector2D vectors with the specified {@code length}.
         *
         * Each vector is initialised with  {@code initialX} and {@code initialY} components.
         *
         * @param {Number} length
         * @param {Number?} initialX
         * @param {Number?} initialY
         * @return {Array} array of qd.Vector2D vectors initialised
         *   with {@code initialX} and {@code initialY} components.
         */
        createArray: function (length, initialX, initialY) {
            var x,
                y,
                i,
                array = [];

            x = (initialX != null) ? initialX : 0;
            y = (initialY != null) ? initialY : 0;

            for (i = 0; i < length; i += 1) {
                array.push(qd.Vector2D.create(x, y));
            }

            return array;
        },

        /**
         * Zero the vector {@code out}.
         *
         * @param {qd.Vector2D} out
         * @return {qd.Vector2D} out
         */
        mutateZero: function (out) {
            out[0] = 0;
            out[1] = 0;

            return out;
        },

        /**
         * Negate the vector {@code out}.
         *
         * @param {qd.Vector2D} out
         * @return {qd.Vector2D} the negated vector
         */
        mutateNegate: function (out) {
            out[0] = -out[0];
            out[1] = -out[1];

            return out;
        },

        /**
         * Normalise the vector {@code out}.
         *
         * @param {qd.Vector2D} out
         * @return {qd.Vector2D} out
         */
        mutateNormalise: function (out) {
            var x = out[0],
                y = out[1],
                distanceSquared = (x * x) + (y * y),
                magnitude;

            if (distanceSquared === 0) {
                return out;
            }

            magnitude = 1 / Math.sqrt(distanceSquared);

            out[0] = (x * magnitude);
            out[1] = (y * magnitude);

            return out;
        },

        /**
         * Multiply the vector {@code out} by the scalar {@code s}.
         *
         * @param {qd.Vector2D} out
         * @param {Number} s
         * @return {qd.Vector2D} out
         */
        mutateScale: function (out, s) {
            out[0] *= s;
            out[1] *= s;

            return out;
        },

        /**
         * Divide the vector {@code out} by the scalar {@code s}.
         *
         * @param {qd.Vector2D} out
         * @param {Number} s
         * @return {qd.Vector2D} out
         */
        mutateInverseScale: function (out, s) {
            if (s === 0) {
                qd.error("error.divisionByZero");
            }

            out[0] /= s;
            out[1] /= s;

            return out;
        },

        /**
         * Add the vector {@code b} to {@code out} vector.
         *
         * @param {qd.Vector2D} out
         * @param {Number} b
         * @return {qd.Vector2D} out
         */
        mutateAdd: function (out, b) {
            out[0] += b[0];
            out[1] += b[1];

            return out;
        },

        /**
         * Subtract the vector {@code b} to {@code out} vector.
         *
         * @param {qd.Vector2D} out
         * @param {Number} b
         * @return {qd.Vector2D} a
         */
        mutateSubtract: function (out, b) {
            out[0] -= b[0];
            out[1] -= b[1];

            return out;
        },

        /**
         * Negate the vector {@code a}.
         *
         * @param {qd.Vector2D} out
         * @param {qd.Vector2D} a
         * @return {qd.Vector2D} the negated vector
         */
        negate: function (out, a) {
            out[0] = -a[0];
            out[1] = -a[1];

            return out;
        },

        /**
         * Normalise the vector {@code a}.
         *
         * @param {qd.Vector2D} out
         * @param {qd.Vector2D} a
         */
        normalise: function (out, a) {
            var x = a[0],
                y = a[1],
                distanceSquared = (x * x) + (y * y),
                magnitude;

            if (distanceSquared === 0) {
                return out;
            }

            magnitude = 1 / Math.sqrt(distanceSquared);

            out[0] = (x * magnitude);
            out[1] = (y * magnitude);

            return out;
        },

        /**
         * Multiply the vector {@code a} by the scalar {@code s}.
         *
         * @param {qd.Vector2D} out
         * @param {Number} s
         * @param {qd.Vector2D} a
         * @return {qd.Vector2D} out
         */
        scale: function (out, s, a) {
            out[0] = a[0] * s;
            out[1] = a[1] * s;
            return out;
        },

        /**
         * Divide the vector {@code a} by the scalar {@code s}
         *
         * @param {qd.Vector2D} out
         * @param {Number} s
         * @param {qd.Vector2D} a
         * @return {qd.Vector2D} out
         */
        inverseScale: function (out, s, a) {
            var inverseS;

            if (s === 0) {
                qd.error("error.divisionByZero");
            }

            inverseS = 1 / s;

            out[0] = a[0] * inverseS;
            out[1] = a[1] * inverseS;
            return out;
        },

        /**
         * Add vectors {@code a} and {@code b}.
         *
         * @param {qd.Vector2D} out
         * @param {qd.Vector2D} a
         * @param {qd.Vector2D} b
         * @return {qd.Vector2D} vector
         */
        add: function (out, a, b) {
            out[0] = a[0] + b[0];
            out[1] = a[1] + b[1];
            return out;
        },

        /**
         * Subtract vectors {@code a} and {@code b}.
         *
         * @param {qd.Vector2D} out
         * @param {qd.Vector2D} a
         * @param {qd.Vector2D} b
         * @return {qd.Vector2D} out
         */
        subtract: function (out, a, b) {
            out[0] = a[0] - b[0];
            out[1] = a[1] - b[1];
            return out;
        },

        /**
         * Get the magnitude of the vector {@code a}.
         *
         * @param {qd.Vector2D} a
         * @return {Number}
         */
        magnitude:function (a) {
            var x = a[0],
                y = a[1];

            return Math.sqrt((x * x) + (y * y));
        },

        /**
         * Get the magnitude squared of the vector {@code a}
         *
         * @param a
         * @return {Number}
         */
        magnitudeSquared: function (a) {
            var x = a[0],
                y = a[1];

            return (x * x) + (y * y);
        },

        /**
         * Get the dot product of vectors {@code a} and {@code b}.
         *
         * @param {qd.Vector2D} a
         * @param {qd.Vector2D} b
         * @return {Number} the magnitude of the dot product
         */
        dot: function (a, b) {
            return a[0] * b[0] + a[1] * b[1];
        },

        /**
         * Get the 2D cross product of vectors {@code a} and {@code b}.
         *
         * @param {qd.Vector2D} a
         * @param {qd.Vector2D} b
         * @return {Number} the magnitude of the cross product
         */
        cross: function (a, b) {
            return a[0] * b[1] - a[1] * b[0];
        },

        /**
         * Cross the scalar {@code s} with the vector {@code a}.
         *
         * @param {qd.Vector2D} out
         * @param {Number} s
         * @param {qd.Vector2D} a
         * @return {qd.Vector2D} out
         */
        scaleCross: function (out, s, a) {
            out[0] = s * a[1];
            out[1] = -s * a[0];

            return out;
        },

        /**
         * Cross the vector {@code a} with the scalar {@code s}.
         *
         * @param {qd.Vector2D} out
         * @param {qd.Vector2D} a
         * @param {Number} s
         * @return {qd.Vector2D} out
         */
        crossScale: function (out, a, s) {
            out[0] = -s * a[1];
            out[1] = s * a[0];

            return out;
        },

        /**
         * Get the un-normalised anti-clockwise perpendicular on the outer edge of vector {@code a}.
         *
         * @param {qd.Vector2D} out
         * @param {qd.Vector2D} a
         * @return {qd.Vector2D} out the un-normalised counter-clockwise perpendicular
         */
        antiClockwisePerpendicular: function (out, a) {
            out[0] = -a[1];
            out[1] = a[0];

            return out;
        },

        /**
         * Get the un-normalised clockwise perpendicular on the inner edge of vector {@code a}.
         *
         * @param {qd.Vector2D} out
         * @param {qd.Vector2D} a
         * @return {qd.Vector2D} out the un-normalised clockwise perpendicular
         */
        clockwisePerpendicular: function (out, a) {
            out[0] = a[1];
            out[1] = -a[0];

            return out;
        },

        /**
         * Get the normalised counter-clockwise normal on the outer edge of vector {@code a}.
         *
         * @param {qd.Vector2D} out
         * @param {qd.Vector2D} a
         * @return {qd.Vector2D} out the normalised counter-clockwise normal
         */
        antiClockwiseNormal: function (out, a) {
            var x = -a[1],
                y = a[0],
                distanceSquared = (x * x) + (y * y),
                magnitude;


            if (distanceSquared === 0) {
                qd.error("error.divisionByZero");
            }

            magnitude = 1 / Math.sqrt(distanceSquared);

            out[0] = (x * magnitude);
            out[1] = (y * magnitude);

            return out;
        },

        /**
         * Get the normalised clockwise normal on the inner edge of vector {@code a}.
         *
         * @param {qd.Vector2D} out
         * @param {qd.Vector2D} a
         * @return {qd.Vector2D} out the un-normalised clockwise normal
         */
        clockwiseNormal: function (out, a) {
            var x = a[1],
                y = -a[0],
                distanceSquared = (x * x) + (y * y),
                magnitude;

            if (distanceSquared === 0) {
                qd.error("error.divisionByZero");
            }

            magnitude = 1 / Math.sqrt(distanceSquared);

            out[0] = (x * magnitude);
            out[1] = (y * magnitude);

            return out;
        },

        /**
         * Creates an edge vector for each adjacent pair of points in {@code points} and
         * copies it to the corresponding index in edgesOut.
         *
         * This function will throw an error if the length of {@code edgesOut} is not
         * equal to the length of {@code points}.
         *
         * @param {Array} edgesOut an array of qd.Vector2D
         * @param {Array} points an array of qd.Point2D
         * @return {Array} edgesOut
         */
        polygonEdges: function (edgesOut, points) {
            var i,
                edgesLength,
                pointsLength,
                initialPoint,
                finalPoint;

            edgesLength = edgesOut.length;
            pointsLength = points.length;

            if (edgesLength !== pointsLength) {
                qd.error("error.arrayLengthMismatch");
            }

            for (i = 0; i < points.length; i += 1) {
                initialPoint = points[i];
                finalPoint = points[(i + 1 === pointsLength) ? 0 : i + 1];

                qd.Vector2D.subtract(edgesOut[i], finalPoint, initialPoint);
            }

            return edgesOut;

        },

        polygonEdgesAndNormals: function (edgesOut, normalsOut, points) {
            var i,
                edgesCount,
                normalsCount,
                pointsCount,
                windingSum,
                out,
                edge,
                normal,
                initialPoint,
                finalPoint;

            edgesCount = edgesOut.length;
            normalsCount = normalsOut.length;
            pointsCount = points.length;

            if (edgesCount !== pointsCount && normalsCount !== pointsCount) {
                qd.error("error.arrayLengthMismatch");
            }

            windingSum = qd.math.polygonWindingSum(points);

            out = { edges: edgesOut, normals: normalsOut };

            if (windingSum === 0) {
                // No edges, so early exit
                return out;
            }

            for (i = 0; i < pointsCount; i += 1) {
                edge = edgesOut[i];
                normal = normalsOut[i];

                initialPoint = points[i];
                finalPoint = points[(i + 1 === pointsCount) ? 0 : i + 1];

                // TODO: Need to set the coordinate system
                //   (in our case we are using canvas coordinate system)
                if (windingSum <= 0) {
                    // clockwise winding
                    qd.Vector2D.subtract(edge, finalPoint, initialPoint);
                    qd.Vector2D.clockwiseNormal(normal, edge);
                } else {
                    // anti-clockwise winding
                    qd.Vector2D.subtract(edge, initialPoint, finalPoint);
                    qd.Vector2D.antiClockwiseNormal(normal, edge);
                }
            }

            return out;
        },

        draw: function (canvas, pointA, pointB) {
            var deltaX,
                deltaY,
                r,
                lambda = 0.8,
                x,
                y;

            deltaX = pointB[0] - pointA[0];
            deltaY = pointB[1] - pointA[1];
            r = qd.Point2D.create(pointB[0] - deltaY, pointB[1] + deltaX);


            x = qd.math.lerp(pointB[0], r[0], lambda);
            y = qd.math.lerp(pointB[1], r[1], lambda);


            canvas.view()
                .path()
                .traceLine(pointA[0], pointA[1], pointB[0], pointB[1])
                .draw( { stroke: "blue" } );
        }
    };

}(qd));

(function (qd) {

    "use strict";

    /**
     * qd.Vector3D
     */
    qd.Vector3D = {

        /**
         * Create a vector with components {@code (x, y, z)}.
         *
         * @param {Number} x
         * @param {Number} y
         * @param {Number} z
         */
        create: function (x, y, z) {
            //noinspection JSCheckFunctionSignatures
            return qd.Tuple.create(x || 0.0, y || 0.0, z || 0.0);
        },

        /**
         * Copy the vector {@code a}.
         *
         * @param {qd.Vector3D} out
         * @param {qd.Vector3D} a
         * @return {qd.Vector3D} out
         */
        copy: function (out, a) {
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            return out;
        },

        /**
         * Clone the vector {@code a}.
         *
         * @param {qd.Vector3D} a
         * @return {qd.Vector3D} the cloned vector
         */
        clone: function (a) {
            return qd.Vector3D.create(a[0], a[1], a[2]);
        },

        /**
         * Negate the vector.
         *
         * @param {qd.Vector3D} out
         * @return {qd.Vector3D} the negated vector
         */
        mutateNegate: function (out) {
            out[0] = -out[0];
            out[1] = -out[1];
            out[2] = -out[2];
        },

        /**
         * Get the magnitude of the vector {@code a}.
         *
         * @param {qd.Vector3D} a
         * @return {Number}
         */
        magnitude:function (a) {
            var x = a[0],
                y = a[1],
                z = a[2];

            return Math.sqrt((x * x) + (y * y) + (z * z));
        },

        /**
         * Normalise the vector {@code a}.
         *
         * @param {qd.Vector3D} out
         * @param {qd.Vector3D} a
         */
        mutateNormalise: function (out, a) {
            var x = a[0],
                y = a[1],
                z = a[2],
                mag = 1 / Math.sqrt((x * x) + (y * y) + (z * z));

            out[0] = (x * mag);
            out[1] = (y * mag);
            out[2] = (z * mag);
        },

        /**
         * Get the dot product of vectors {@code a} and {@code b}
         *
         * @param {qd.Vector3D} a
         * @param {qd.Vector3D} b
         * @return {Number} the magnitude of the dot product
         */
        dot: function (out, a, b) {
            return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        },

        /**
         * Cross product of vectors {@code a} and {@code b}.
         *
         * @param {qd.Vector3D} out
         * @param {qd.Vector3D} a
         * @param {qd.Vector3D} b
         * @return {qd.Vector3D} out
         */
        cross: function (out, a, b) {

            var ax = a[0],
                ay = a[1],
                az = a[2],
                bx = b[0],
                by = b[1],
                bz = b[2];

            out[0] = -az * by + ay * bz;
            out[1] = az * bx - ax * bz;
            out[2] = -ay * bx + ax * by;
            return out;
        },

        /**
         * Add the vectors {@code a} and {@code b}.
         *
         * @param {qd.Vector3D} out
         * @param {qd.Vector3D} a
         * @param {qd.Vector3D} b
         * @return {qd.Vector3D} out
         */
        add: function (out, a, b) {
            out[0] = a[0] + b[0];
            out[1] = a[1] + b[1];
            out[2] = a[2] + b[2];
            return out;
        },

        /**
         * Subtract the vectors {@code a} and {@code b}
         *
         * @param {qd.Vector3D} out
         * @param {qd.Vector3D} a
         * @param {qd.Vector3D} b
         * @return {qd.Vector3D} out
         */
        subtract: function (out, a, b) {
            out[0] = a[0] - b[0];
            out[1] = a[1] - b[1];
            out[2] = a[2] - b[2];
            return out;
        },

        /**
         * Multiply the vector {@code a} by the {@code scalar}.
         *
         * @param {Number} s
         * @param {qd.Vector3D} a
         * @return {qd.Vector3D} out
         */
        scale: function (out, s, a) {
            out[0] = a[0] * s;
            out[1] = a[1] * s;
            out[2] = a[2] * s;
            return out;
        }
    };

}(qd));
(function (qd) {

    qd.Angle = function (degrees) {
        this.init(degrees);
    };

    /* Private Methods */
    qd.Angle.prototype._toRadians = qd.math.toRadians;
    qd.Angle.prototype._toDegrees = qd.math.toDegrees;
    qd.Angle.prototype._addDegrees = qd.math.addDegrees;
    qd.Angle.prototype._sin = qd.math.fasterSin;
    qd.Angle.prototype._cos = qd.math.fasterCos;

    /* Public Methods */

    qd.Angle.prototype.init = function (degrees) {
        /* Private Attributes */
        this._direction = qd.Vector2D.create(this.cos(), this.sin());

        /* Public Attributes */
        this.degrees = degrees || 0;

        return this;
    };

    qd.Angle.prototype.rotate = function (angle) {
        this.rotateDegrees(angle.degrees);
        return this;
    };

    qd.Angle.prototype.rotateRadians = function (radians) {
        this.rotateDegrees(this._toDegrees(radians));
        return this;
    };

    qd.Angle.prototype.rotateDegrees = function (degrees) {
        this.degrees = this._addDegrees(this.degrees, degrees);
        return this;
    };

    qd.Angle.prototype.toRadians = function () {
        return this._toRadians(this.degrees);
    };

    qd.Angle.prototype.direction = function () {
        return qd.Vector2D.set(this._direction, this.cos(), this.sin());
    };

    qd.Angle.prototype.sin = function () {
        return this._sin(this.degrees);
    };

    qd.Angle.prototype.cos = function () {
        return this._cos(this.degrees);
    };

    return qd;
}(qd));
qd.ArraySet = function (equalator) {
    var _set = [],
        _equalator = equalator || (function (elementA, elementB) {
            return (elementA === elementB);
        }),
        _findIndex = function (element) {
            var i,
                foundIndex = -1;

            for (i = 0; i < _set.length; i += 1) {
                if (_equalator(_set[i]), element) {
                    foundIndex = i;
                    break;
                }
            }

            return foundIndex;
        };

    this.add = function (element) {
        if (!this.has(element)) {
            this.push(element);
        }

        return this;
    };

    this.has = function (element) {
        return _findIndex(element) > -1;
    };

    this.remove = function (element) {
        var index = _findIndex(element);

        if (index > -1) {
            _set.splice(index, 1);
        }

        return this;
    };

    this.size = function () {
        return _set.length;
    };

    this.toArray = function () {
        return _set.splice();
    };

    this.union = function (setArg)  {

    };

    this.intersect = function (setArg) {

    };

    this.difference = function (setArg) {

    };

};


/*
 * License:
 *
 * Copyright (c) 2011 Trevor Lalish-Menagh (http://www.trevmex.com/)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
qd.BinarySearchTree = function () {
    /*
     * Private Class: Node
     *
     * A BST node constructor
     *
     * Parameters:
     *        leftChild - a reference to the left child of the node.
     *        key - The key of the node.
     *        value - the value of the node.
     *        rightChild - a reference to the right child of the node.
     *        parent - a reference to the parent of the node.
     *
     * Note: All parameters default to null.
     */
    var Node = function (leftChild, key, value, rightChild, parent) {
            return {
                leftChild: (typeof leftChild === "undefined") ? null :
                    leftChild,
                key: (typeof key === "undefined") ? null : key,
                value: (typeof value === "undefined") ? null : value,
                rightChild: (typeof rightChild === "undefined") ? null :
                    rightChild,
                parent: (typeof parent === "undefined") ? null : parent
            };
        },

    /*
     * Private Variable: root
     *
     * The root nade of the BST.
     */
        root = new Node(),

    /*
     * Private Method: searchNode
     *
     * Search through a binary tree.
     *
     * Parameters:
     *     node - the node to search on.
     *     key - the key to search for (as an integer).
     *
     * Returns:
     *     the value of the found node,
     *     or null if no node was found.
     *
     */
        searchNode = function (node, key) {
            if (node.key === null) {
                return null; // key not found
            }

            var nodeKey = parseInt(node.key, 10);

            if (key < nodeKey) {
                return searchNode(node.leftChild, key);
            } else if (key > nodeKey) {
                return searchNode(node.rightChild, key);
            } else { // key is equal to node key
                return node.value;
            }
        },

    /*
     * Private Method: insertNode
     *
     * Insert into a binary tree.
     *
     * Parameters:
     *     node - the node to search on.
     *     key - the key to insert (as an integer).
     *     value - the value to associate with the key (any type of
     *             object).
     *
     * Returns:
     *     true.
     *
     */
        insertNode = function (node, key, value, parent) {
            if (node.key === null) {
                node.leftChild = new Node();
                node.key = key;
                node.value = value;
                node.rightChild = new Node();
                node.parent = parent;
                return true;
            }

            var nodeKey = parseInt(node.key, 10);

            if (key < nodeKey) {
                insertNode(node.leftChild, key, value, node);
            } else if (key > nodeKey) {
                insertNode(node.rightChild, key, value, node);
            } else { // key is equal to node key, update the value
                node.value = value;
                return true;
            }
        },

    /*
     * Private Method: traverseNode
     *
     * Call a function on each node of a binary tree.
     *
     * Parameters:
     *     node - the node to traverse.
     *     callback - the function to call on each node, this function
     *                takes a key and a value as parameters.
     *
     * Returns:
     *     true.
     *
     */
        traverseNode = function (node, callback) {
            if (node.key !== null) {
                traverseNode(node.leftChild, callback);
                callback(node.key, node.value);
                traverseNode(node.rightChild, callback);
            }

            return true;
        },

    /*
     * Private Method: minNode
     *
     * Find the key of the node with the lowest key number.
     *
     * Parameters:
     *     node - the node to traverse.
     *
     * Returns: the key of the node with the lowest key number.
     *
     */
        minNode = function (node) {
            while (node.leftChild.key !== null) {
                node = node.leftChild;
            }

            return node.key;
        },

    /*
     * Private Method: maxNode
     *
     * Find the key of the node with the highest key number.
     *
     * Parameters:
     *     node - the node to traverse.
     *
     * Returns: the key of the node with the highest key number.
     *
     */
        maxNode = function (node) {
            while (node.rightChild.key !== null) {
                node = node.rightChild;
            }

            return node.key;
        },

    /*
     * Private Method: successorNode
     *
     * Find the key that successes the given node.
     *
     * Parameters:
     *		node - the node to find the successor for
     *
     * Returns: the key of the node that successes the given node.
     *
     */
        successorNode = function (node) {
            var parent;

            if (node.rightChild.key !== null) {
                return minNode(node.rightChild);
            }

            parent = node.parent;
            while (parent.key !== null && node == parent.rightChild) {
                node = parent;
                parent = parent.parent;
            }

            return parent.key;
        },

    /*
     * Private Method: predecessorNode
     *
     * Find the key that preceeds the given node.
     *
     * Parameters:
     *		node - the node to find the predecessor for
     *
     * Returns: the key of the node that preceeds the given node.
     *
     */
        predecessorNode = function (node) {
            var parent;

            if (node.leftChild.key !== null) {
                return maxNode(node.leftChild);
            }

            parent = node.parent;
            while (parent.key !== null && node == parent.leftChild) {
                node = parent;
                parent = parent.parent;
            }

            return parent.key;
        };

    return {
        /*
         * Method: search
         *
         * Search through a binary tree.
         *
         * Parameters:
         *     key - the key to search for.
         *
         * Returns:
         *     the value of the found node,
         *     or null if no node was found,
         *     or undefined if no key was specified.
         *
         */
        search: function (key) {
            var keyInt = parseInt(key, 10);

            if (isNaN(keyInt)) {
                return undefined; // key must be a number
            } else {
                return searchNode(root, keyInt);
            }
        },

        /*
         * Method: insert
         *
         * Insert into a binary tree.
         *
         * Parameters:
         *     key - the key to search for.
         *     value - the value to associate with the key (any type of
         *             object).
         *
         * Returns:
         *     true,
         *     or undefined if no key was specified.
         *
         */
        insert: function (key, value) {
            var keyInt = parseInt(key, 10);

            if (isNaN(keyInt)) {
                return undefined; // key must be a number
            } else {
                return insertNode(root, keyInt, value, null);
            }
        },

        remove: function (key) {
            // TODO
            return false;
        },

        /*
         * Method: traverse
         *
         * Call a function on each node of a binary tree.
         *
         * Parameters:
         *     callback - the function to call on each node, this function
         *                takes a key and a value as parameters.
         * Returns:
         *     true.
         *
         */
        traverse: function (callback) {
            if (typeof callback === "undefined") {
                callback = function (key, value) {

                };
            }

            return traverseNode(root, callback);
        },

        /*
         * Method: min
         *
         * Find the key of the node with the lowest key number.
         *
         * Parameters: none
         *
         * Returns: the key of the node with the lowest key number.
         *
         */
        min: function () {
            return minNode(root);
        },

        /*
         * Method: max
         *
         * Find the key of the node with the highest key number.
         *
         * Parameters: none
         *
         * Returns: the key of the node with the highest key number.
         *
         */
        max: function () {
            return maxNode(root);
        },

        /*
         * Method: successor
         *
         * Find the key that successes the root node.
         *
         * Parameters: none
         *
         * Returns: the key of the node that successes the root node.
         *
         */
        successor: function () {
            return successorNode(root);
        },

        /*
         * Method: predecessor
         *
         * Find the key that preceeds the root node.
         *
         * Parameters: none
         *
         * Returns: the key of the node that preceeds the root node.
         *
         */
        predecessor: function () {
            return predecessorNode(root);
        }
    };
};
qd.DynamicStack = function () {
    var _elements = [];

    this.push = function (element) {
        _elements.push(element);
    };

    this.pop = function () {
        return _elements.pop();
    };

    this.element = function (index) {
        var element = undefined;

        if (_elements.length > 0) {
            element = _elements[index];
        }

        return element;
    };

    this.findIndex = function (element) {
        return qd.findIndex(_elements, function (_elem) {
            return _elem === element;
        });
    };

    this.delete = function (element)  {
        qd.remove(_elements, function (_elem) {
            return _elem === element;
        });
    };

    this.top = function () {
        var top = undefined;

        if (_elements.length > 0) {
            top = _elements[_elements.length - 1];
        }

        return top;
    };

    this.bottom = function () {
        var bottom = undefined;

        if (_elements.length > 0) {
            bottom = _elements[0];
        }

        return bottom;
    };

    this.size = function () {
        return  _elements.length;
    };

    this.moveUp = function (element) {
        var index,
            topIndex = _elements.length - 1;

        if (this.size() > 1) {
            index = this.findIndex(element);

            if (index > -1 && index !== topIndex) {
                qd.swap(_elements, index, index + 1);
            }
        }
    };

    this.moveDown = function (element) {
        var index,
            bottomIndex = 0;

        if (this.size() > 1) {
            index = this.findIndex(element);

            if (index > -1 && index !== bottomIndex) {
                qd.swap(_elements, index, index - 1);
            }
        }
    };

    this.each = function (callback) {
        var i;

        for (i = 0; i < _elements.length; i+= 1) {
            callback(_elements[i]);
        }
    };
};
qd.LinkedList = function () {

    /* Private */

    var _Link = function (data) {
            this.data = data;
            this.next = null;
        },
        _length = 0,
        _head = null;

    /* Public */

    this.add = function (value) {
        var link = new _Link(value),
            current = _head;

        if (!current) {
            _head = link;
        } else {
            while (current.next) {
                current = current.next;
            }

            current.next = link;
        }

        _length++;

        return link.data;
    };

    this.addAll = function (values) {
        qd.each(values, function (value) {
            this.add(value);
        }, this);
    };

    this.get = function(index) {
        var current = _head,
            length = _length,
            count = 0;

        if (length === 0 || index < 0 || index > length) {
            return undefined;
        }

        while (count < index) {
            current = current.next;
            count++;
        }

        return current.data;
    };

    this.insert = function (index, data) {

    };

    this.removeAt = function(index) {
        var current = _head,
            previous = null,
            length = _length,
            count = 0;

        if (index < 0 || index >= length) {
            return undefined;
        }

        if (index === 0) {
            _head = current.next;
        } else {
            while (count < index) {
                previous = current;
                current = current.next;
                count++;
            }

            previous.next = current.next;
        }

        if (!current) {
            return undefined;
        }

        _length--;

        return current.data;
    };

    this.remove = function (data) {
        var current = _head,
            previous = null,
            found = null;

        if (_length === 0) {
            return undefined;
        }

        // Check head
        if (data === current.data) {
            _head = current.next;
            found = current;

        } else {

            // Check tail
            while (current !== null) {
                if (data === current.data) {
                    previous.next = current.next;
                    found = current;
                    break;
                }

                previous = current;
                current = current.next;
            }
        }

        if (!found) {
            return undefined;
        }

        _length--;

        return found.data;
    };

    this.find = function (data) {
        var current = _head,
            found = null;

        if (_length === 0) {
            return undefined;
        }

        while (current !== null) {
            if (data === current.data) {
                found = current;
                break;
            }

            current = current.next;
        }

        if (!found) {
            return undefined;
        }

        return found.data;
    };

    this.has = function (data) {
        var current = _head,
            found = false;

        while (current !== null) {
            if (data === current.data) {
                found = true;
                break;
            }

            current = current.next;
        }

        return found;
    };

    this.clear = function () {
        _length = 0;
        _head = null;
    };

    this.iterator = function () {
        return new qd.Iterator(_head);
    };

    this.each = function (callback, context) {
        this.iterator().iterate(callback, context);
    };

    this.empty = function () {
        return (_length === 0);
    };

    this.size = function () {
        return _length;
    };

    this.toArray = function () {
        var array = [],
            current = _head;

        if (current) {
            array.push(current.data);

            while (current.next) {
                current = current.next;
                array.push(current.data);
            }
        }

        return array;
    };
};
qd.Set = function (identicator) {
    var _set = {},
        _identicator = identicator || (function (element) {
            return element.toString();
        });

    this.add = function (element) {
        _set[_identicator(element)] = element;
    };

    this.has = function (element) {
        var element = _set[_identicator(element)];
        return (!element);
    };

    this.remove = function (element) {
        delete _set[_identicator(element)];
    };

    this.size = function () {
        return qd.size(_set);
    };

    this.toArray = function () {
        return qd.values(_set);
    };

    this.union = function (setArg)  {

    };

    this.intersect = function (setArg) {

    };

    this.difference = function (setArg) {

    };

};
(function (qd) {

    /**
     * qd.Body2D represents a rigid, solid body with physical properties
     * such as position, velocity, rotation angle, rotational velocity,
     * and mass.
     *
     * TODO: Should bounds and body be the same object?
     *
     * @constructor
     */
    qd.Body = function (bounds, material) {
        this.init(bounds, material);
    };

    qd.Body.prototype.init = function (bounds, material) {

        /* Bounds */

        this.bounds = bounds;

        this.bounds.onResize("qd.BoundingBox.onResize:qd.Body2D._reposition",
            this._reposition,
            this);

        /* Material */

        this.material = qd.cloneProperties(material);

        /* State */

        this.active = false;  // TODO: Maybe deactivating just removes it from the list of bodies to simulate
        this.asleep = false;

        /* Linear motion */

        this.position = bounds.centroid();
        this.deltaPosition = qd.Vector2D.create(0.0, 0.0);

        this.velocity = qd.Vector2D.create(0.0, 0.0);
        this.deltaVelocity = qd.Vector2D.create(0.0, 0.0);

        // Inertial Mass
        this.mass = 0.0;
        this.inverseMass = 0.0;

        // Gravitational Mass
        this.gMass = 0.0;
        this.inverseGMass = 0.0;

        /* Moment of Inertia */
        this.moment = 0.0;
        this.inverseMoment = 0.0;

        // Density sets both inertial and gravitational mass
        this.density(this.material.density);

        // TODO: Needs to calculate from the shape
        this.momentOfInertia(qd.Physics.rotationalInertia(
            "circular-disk", {
                mass: this.mass,
                radius: this.bounds.radius()
            }
        ));

        this.angle = 0.0;    // Radians
        this.deltaAngle = 0.0;

        this.angularVelocity = 0.0;        // Radians/second

        /* Force, Acceleration, Change of Momentum */

        this.force = qd.Vector2D.create(0.0, 0.0);

        this.torque = 0.0;

        /* Verlet integrator specific */
        this.previousPosition = qd.Point2D.clone(this.position); // Used by Verlet integrator
        this.previousAngle = this.angle;

        /* Collision */
        this.collisionData = {
            contacts: [],
            radialContacts: [],
            edges: []
        };

        /* Constraints */

        // TODO

        return this;
    };

    qd.Body.prototype.destroy = function () {
        this.bounds.offResize("qd.BoundingBox.onResize:qd.Body2D._reposition",
            this._reposition,
            this);

        this.bounds = undefined;
        this.material = undefined;
        this.active = undefined;
        this.asleep = undefined;
        this.position = undefined;
        this.velocity = undefined;
        this.mass = undefined;
        this.inverseMass = undefined;
        this.moment = undefined;
        this.inverseMoment = undefined;
        this.angle = undefined;
        this.angularVelocity = undefined;
        this.force = undefined;
        this.torque = undefined;
    };

    qd.Body.prototype.clone = function (bounds) {
        var bodyCopy = new qd.Body(bounds, this.material);

        bodyCopy.active = this.active;
        bodyCopy.asleep = this.asleep;

        // bodyCopy.position = this.bounds.centroid();
        bodyCopy.velocity = qd.Vector2D.clone(this.velocity);

        bodyCopy.mass = this.mass;
        bodyCopy.inverseMass = this.inverseMass;

        bodyCopy.moment = this.moment;
        bodyCopy.inverseMoment = this.inverseMoment;

        bodyCopy.angle = this.angle;
        bodyCopy.angularVelocity = this.angularVelocity;

        bodyCopy.force = qd.Vector2D.clone(this.force);

        bodyCopy.torque = this.torque;

        return bodyCopy;
    };

    qd.Body.prototype.setProperty = function (property, value) {
        switch (property) {
            case "active":
                this.active = qd.isTruthy(value);
                qd.debug("body.active = " + this.active);
                break;
            case "density":
                this.density(value);
                qd.debug("body.density = " + this.material.density);
                break;
            case "moment":
                this.momentOfInertia(value);
                qd.debug("body.moment = " + this.moment);
                break;
            case "restitution":
                this.restitution(value);
                qd.debug("body.restitution = " + this.material.restitution);
                break;
            default:
                // nothing to set
        }
    };

    /* Private Methods */

    qd.Body.prototype._reposition = function () {
        var position = this.position,
            previousPosition = this.previousPosition,
            deltaPosition = this.deltaPosition,
            bounds = this.bounds,
            centroidX = bounds.centroidX(),
            centroidY = bounds.centroidY();

        // TODO: Should not be repositioning if it was the body that translated the bbox.
        previousPosition[0] = centroidX - deltaPosition[0];
        previousPosition[1] = centroidY - deltaPosition[1];

        position[0] = centroidX;
        position[1] = centroidY;

    //    qd.debug("Repositioning Body to Bounds Centroid");
    };

    qd.Body.prototype.density = function (density) {
        var mass;

        if (density != null) {
            this.material.density = density;
            mass = this.bounds.area() * density;

            this.inertialMass(mass);
            this.gravitationalMass(mass);

            return this;
        }

        return this.material.density;

    };

    /* Public Methods */

    /**
     * Get or set the inertial mass of the body.
     *
     * Note that the mass will override this change if the bounds is resized.
     * @param {Number} mass
     * @return {Number|qd.Body}
     */
    qd.Body.prototype.inertialMass = function (mass) {

        if (mass != null) {
            if (mass > 0) {
                this.mass = mass;
                this.inverseMass = 1 / mass;
            } else {
                this.mass = 0;
                this.inverseMass = 0;

                qd.Vector2D.mutateZero(this.velocity);
            }

            return this;
        }

        return this.mass;
    };

    /**
     * Get or set the gravitational mass of the body.
     *
     * Note that the mass will override this change if the bounds is resized.
     *
     * @param {Number} mass
     * @return {Number|qd.Body}
     */
    qd.Body.prototype.gravitationalMass = function (mass) {

        if (mass != null) {
            if (mass > 0) {
                this.gMass = mass;
                this.inverseGMass = 1 / mass;
            } else {
                this.gMass = 0;
                this.inverseGMass = 0;
            }

            return this;
        }

        return this.gMass;
    };

    /**
     * Calculate rotational inertia given the bounds.
     *
     * @param bounds
     */
    qd.Body.prototype.momentOfInertia = function (moment) {
        if (moment != null) {
            if (moment > 0) {
                this.moment = moment;
                this.inverseMoment = 1 / moment;
            } else {
                this.moment = 0;
                this.inverseMoment = 0;
            }

            return this;
        }

        return this.moment;
    };

    qd.Body.prototype.restitution = function (restitution) {
        if (restitution != null) {
            this.material.restitution = restitution;
            return this;
        }

        return this.material.restitution;
    };

    qd.Body.prototype.activate = function () {
        if (this.active === false) {
            this.active = true;
        }
        return this;
    };

    qd.Body.prototype.deactivate = function () {
        if (this.active) {
            this.active = false;
            qd.Vector2D.mutateZero(this.velocity);
        }
        return this;
    };

    qd.Body.prototype.draw = function (canvas) {
        var cd,
            view,
            contact,
            radialContact,
            position,
            edge,
            i;

        // Draw Body debug features
        cd = this.collisionData;

        if (cd != null) {
            view = canvas.view();

            for (i = 0; i < cd.edges.length; i += 1) {
                // Draw collision edge
                edge = cd.edges[i];
                view.path()
                    .traceLine(edge.pointA[0], edge.pointA[1], edge.pointB[0], edge.pointB[1])
                    .draw({ stroke: "orange", lineWidth: "3" });

                view.path()
                    .traceRectangle(edge.supportPoint[0], edge.supportPoint[1], 5, 5)
                    .draw({ stroke: cd.colour })
            }

            for (i = 0; i < cd.contacts.length; i += 1) {
                // Draw contacts
                contact = cd.contacts[i];
                view.path().traceCircle(contact[0], contact[1], 3);

                // Draw radial contact lines
                position = this.position;
                radialContact = cd.radialContacts[i];
                view.arrow(position, radialContact)
                    .draw({ stroke: cd.colour, fill: cd.colour });
            }
        }
    };

    qd.Body.prototype.clearForcesAndDeltas = function () {
        this.force[0] = 0.0;
        this.force[1] = 0.0;
        this.torque = 0.0;

        this.deltaPosition[0] = 0.0;
        this.deltaPosition[1] = 0.0;

        this.deltaAngle = 0.0;

        this.deltaVelocity[0] = 0.0;
        this.deltaVelocity[1] = 0.0;

        // Clear collision data for debugging
        this.collisionData.contacts = [];
        this.collisionData.radialContacts = [];
        this.collisionData.edges = [];

        return this;
    };

    qd.Body.prototype.accelerate = function (acceleration) {

    };
}(qd));
(function (qd) {

    qd.Collision = function (physics) {
        this.init(physics);
    };

    qd.Collision.prototype.init = function (physics) {
        this._physics = physics;
        this._penetrationPercent = physics.settings.penetrationPercent;
        this._penetrationSlop = physics.settings.penetrationSlop;

        // Cache manifold for collision detection
        // All points and vectors required for collision resolution
        // are pre-created and reused for each collision.
        this._manifold = {

            // Body A
            a: {
                body: null,
                shape: null,
                radius: null,
                bounds: null,
                position: null,
                deltaPosition: null,
                velocity: null,
                inverseMass: null,
                angularVelocity: null,
                inverseMoment: null,
                restitution: null,
                linearStaticFriction: null,
                linearDynamicFriction: null,
                positionCorrection: qd.Vector2D.create(0, 0),
                radialContacts: [qd.Vector2D.create(0, 0), qd.Vector2D.create(0, 0)],
                edgeDirection: qd.Vector2D.create(0, 0),
                contactEdge: null
            },

            // Body B
            b: {
                body: null,
                shape: null,
                radius: null,
                bounds: null,
                position: null,
                deltaPosition: null,
                velocity: null,
                inverseMass: null,
                angularVelocity: null,
                inverseMoment: null,
                restitution: null,
                linearStaticFriction: null,
                linearDynamicFriction: null,
                positionCorrection: qd.Vector2D.create(0, 0),
                radialContacts: [qd.Vector2D.create(0, 0), qd.Vector2D.create(0, 0)],
                edgeDirection: qd.Vector2D.create(0, 0),
                contactEdge: null
            },

            // Collision data
            normal: qd.Vector2D.create(0, 0),
            negNormal: qd.Vector2D.create(0, 0),
            tangent: qd.Vector2D.create(0, 0),
            penetration: 0,

            // relativeContactVelocity
            relativeContactVelocity: qd.Vector2D.create(0, 0),
            radialVelocityA: qd.Vector2D.create(0, 0),
            radialVelocityB: qd.Vector2D.create(0, 0),
            contactVelocityA: qd.Vector2D.create(0, 0),
            contactVelocityB: qd.Vector2D.create(0, 0),

            // resolveCollision
            impulseScalar: null,
            impulse: qd.Vector2D.create(0, 0),

            // applyMutualImpulse
            relativePosition: qd.Vector2D.create(0, 0),
            normalVelocity: qd.Vector2D.create(0, 0),
            normalSpeed: 0,

            // applyFrictionImpulse
            frictionImpulse: qd.Vector2D.create(0, 0),

            // correctPositions
            positionCorrection: qd.Vector2D.create(0, 0),

            // NOTE: Do NOT use contacts.length! Use contactsCount instead.
            //  The contacts array is a cache and it will never be resized.
            //  Update the contactsCount if the number of contacts changes.
            contacts: [qd.Point2D.create(0, 0), qd.Point2D.create(0, 0)],
            contactsCount: 0,
            contactsDepth: [0, 0],

            closestPoint: qd.Point2D.create(0, 0),

            // getContactByClipping
            referenceEdgeNormalised: qd.Vector2D.create(0, 0),
            negReferenceEdgeNormalised: qd.Vector2D.create(0, 0),
            referenceEdgeNormal: qd.Vector2D.create(0, 0),
            incidenceEdgeNormal: qd.Vector2D.create(0, 0),

            // clip
            clipContactIndex: 0,
            clipContacts: [qd.Point2D.create(0, 0), qd.Point2D.create(0, 0)]
        };
    };

    qd.Collision.prototype.resolve = function (bodies) {
        var manifold = this._manifold;

        this._physics.eachInteraction(bodies, function (bodyA, bodyB) {
            var boundsA = bodyA.bounds,
                boundsB = bodyB.bounds;

            if (boundsA.boxOnBoxCollisionTest(boundsB)) {
                // Resolve broad-phase collision
                this.prepareManifold(manifold, bodyA, bodyB);

                if (this.collide(manifold)) {
                    // Resolve narrow-phase collision
                    this.resolveCollision(manifold);
                    this.applyFrictionImpulse(manifold);
                    this.separateCollidingBodies(manifold);
//                    this.debug(manifold);
                }
            }
        }, this);
    };

    qd.Collision.prototype.prepareManifold = function (manifold, bodyA, bodyB) {
        var a = manifold.a,
            b = manifold.b,
            boundsA = bodyA.bounds,
            boundsB = bodyB.bounds,
            materialA,
            materialB;

        materialA = bodyA.material;
        materialB = bodyB.material;

        a.body = bodyA;
        a.bounds = boundsA;
        a.shape = boundsA._shape;
        a.radius = boundsA.radius();
        a.position = bodyA.position;
        a.deltaPosition = bodyA.deltaPosition;
        a.velocity = bodyA.velocity;
        a.inverseMass = bodyA.inverseMass;
        a.angularVelocity = bodyA.angularVelocity;
        a.inverseMoment = bodyA.inverseMoment;
        a.restitution = materialA.restitution;
        a.linearStaticFriction = materialA.linearStaticFriction;
        a.linearDynamicFriction = materialA.linearDynamicFriction;

        b.body = bodyB;
        b.bounds = boundsB;
        b.shape = boundsB._shape;
        b.radius = boundsB.radius();
        b.position = bodyB.position;
        b.deltaPosition = bodyB.deltaPosition;
        b.velocity = bodyB.velocity;
        b.inverseMass = bodyB.inverseMass;
        b.angularVelocity = bodyB.angularVelocity;
        b.inverseMoment = bodyB.inverseMoment;
        b.restitution = materialB.restitution;
        b.linearStaticFriction = materialB.linearStaticFriction;
        b.linearDynamicFriction = materialB.linearDynamicFriction;

        manifold.contactsCount = 0;
    };

    qd.Collision.prototype.debug = function (manifold) {
        var a = manifold.a,
            b = manifold.b,
            bodyA = a.body,
            bodyB = b.body,
            cdA = bodyA.collisionData,
            cdB = bodyB.collisionData,
            contact,
            radialContact,
            i;

        cdA.colour = "blue";
        bodyB.collisionData.colour = "red";

    //        qd.debug("debug contactsCount: ", manifold.contactsCount)

        for (i = 0; i < manifold.contactsCount; i += 1) {
            contact = manifold.contacts[i];

            cdA.contacts.push(qd.Point2D.clone(contact));
            cdA.radialContacts.push(qd.Vector2D.clone(a.radialContacts[i]));

            cdB.contacts.push(qd.Point2D.clone(contact));
            cdB.radialContacts.push(qd.Vector2D.clone(b.radialContacts[i]));
        }

        cdA.edges.push(a.contactEdge);
        cdB.edges.push(b.contactEdge);

    //                    var m = qd.cloneProperties(manifold),
    //                        tempBoundsA = m.a.bounds,
    //                        tempBoundsB = m.b.bounds,
    //                        tempBodyA = m.a.body,
    //                        tempBodyB = m.b.body;
    //
    //                    m.a.bounds=null;
    //                    m.b.bounds=null;
    //                    m.a.body=null;
    //                    m.b.body=null;
    //                    qd.debug("####### AFTER #######")
    //                    qd.debug(manifold)
    //                    m.a.bounds=tempBoundsA;
    //                    m.b.bounds=tempBoundsB;
    //                    m.a.body=tempBodyA;
    //                    m.b.body=tempBodyB;
    };

    qd.Collision.prototype.collide = function (manifold) {
        var collisionType = "polygonOnPolygon"; // TODO: Determine type

    //        var collisionType = "circleOnCircle"; // TODO: Determine type

    //        var collisionType = "boxOnBox";

        switch (collisionType) {
            case "circleOnCircle":
                return this.collideCircleOnCircle(manifold);
                break;
            case "boxOnBox":
                return this.collideBoxOnBox(manifold);
                break;
            case "boxOnCircle":
                return this.collideBoxOnCircle(manifold);
            case "circleOnBox":
                return this.collideCircleOnBox(manifold);
                break;
            case "polygonOnPolygon":
                return this.collidePolygonOnPolygon(manifold);
                break;
            case "circleOnPolygon":
                return false;
                break;
            case "polygonOnCircle":
                return false;
                break;
            case "lineOnPolygon":
                return false;
                break;
            case "polygonOnLine":
                return false;
                break;
        }
    };

    qd.Collision.prototype.collideCircleOnCircle = function (manifold) {
        var a = manifold.a,
            b = manifold.b,
            positionA = a.position,
            positionB = b.position,
            radiusA = a.radius,
            radiusB = b.radius,
            normal = manifold.normal,
            radiiSum,
            distance,
            distanceSquared,
            contact,
            radialContactA,
            radialContactB;

        // Vector from A to B (un-normalised)
        normal = qd.Vector2D.subtract(normal, positionB, positionA);

        distanceSquared = qd.Vector2D.magnitudeSquared(normal);

        radiiSum = radiusA + radiusB;

        if(distanceSquared > radiiSum * radiiSum) {
            return false;
        }

        // Circles have collided, now compute contacts

        // Circle on circle collisions only have one contact
        manifold.contactsCount = 1;

        // Grab the contact and radial contacts cache
        contact = manifold.contacts[0];

        radialContactA = a.radialContacts[0];
        radialContactB = b.radialContacts[0];

        distance = Math.sqrt(distanceSquared);

        if(distance === 0) {
            // Circles are at the same position, so contact is made at the
            // colliding circles' mutual centre.

            manifold.penetration = radiusA;

            qd.Vector2D.set(normal, 1, 0);

            qd.Vector2D.mutateZero(radialContactA);
            qd.Point2D.copy(contact, positionA);

            qd.Vector2D.mutateZero(radialContactB);
            qd.Point2D.copy(contact, positionB);
        } else {
            // Circles are overlapping but not at the same position

            manifold.penetration = radiiSum - distance;

            // Normalise the normal using the already calculated distance
            qd.Vector2D.mutateInverseScale(normal, distance);

            qd.Vector2D.scale(radialContactA, radiusA, normal);
            qd.Point2D.add(contact, radialContactA, positionA);

            qd.Vector2D.scale(radialContactB, -radiusB, normal);
            qd.Point2D.add(contact, radialContactB, positionB);
        }

        return true;
    };

    qd.Collision.prototype.collideBoxOnBox = function (manifold) {
        var a = manifold.a,
            b = manifold.b,
            relativePosition,
            boundsA = a.bounds,
            boundsB = b.bounds,
            halfWidthA,
            halfWidthB,
            halfHeightA,
            halfHeightB,
            overlapX,
            overlapY,
            normal = manifold.normal;

        // Vector from A to B
        relativePosition = qd.Vector2D.subtract(manifold.relativePosition, b.position, a.position);

        // Calculate half extents along x axis for each object
        halfWidthA = boundsA.halfWidth();
        halfWidthB = boundsB.halfWidth();

        // Calculate overlap on x axis
        overlapX = halfWidthA + halfWidthB - Math.abs(relativePosition[0]);

        // Calculate half extents along x axis for each object
        halfHeightA = boundsA.halfHeight();
        halfHeightB = boundsB.halfHeight();

        // Calculate overlap on y axis
        overlapY = halfHeightA + halfHeightB - Math.abs(relativePosition[1]);

        // Find out which axis is axis of least penetration
        if(overlapX > overlapY) {
            // Point towards B knowing that n points from A to B
            if(relativePosition[0] < 0) {
                qd.Vector2D.set(normal, -1, 0);
            } else {
                qd.Vector2D.set(normal, 1, 0);
            }

            // Point toward B knowing that n points from A to B
            if(relativePosition[1] < 0) {
                qd.Vector2D.set(normal, 0, -1);
            } else {
                qd.Vector2D.set(normal, 0, 1);
            }

            manifold.normal = normal;
            manifold.penetration = overlapY;

            return true
        } else {
            // Point towards B knowing that n points from A to B
            if(relativePosition[0] < 0) {
                qd.Vector2D.set(normal, -1, 0);
            } else {
                qd.Vector2D.set(normal, 1, 0);
            }

            // Point toward B knowing that n points from A to B
            if(relativePosition[1] < 0) {
                qd.Vector2D.set(normal, 0, -1);
            } else {
                qd.Vector2D.set(normal, 0, 1);
            }

            manifold.normal = normal;
            manifold.penetration = overlapX;

            return true
        }
    };

    qd.Collision.prototype.collideBoxOnCircle = function (manifold) {
        var box = manifold.a,
            circle = manifold.b;

        // TODO: Only collides with box corners, not the box sides

        return this._collideBoxOnCircle(manifold, box, circle);
    };

    qd.Collision.prototype.collideCircleOnBox = function (manifold) {
        var box = manifold.b,
            circle = manifold.a,
            collisionResult = this._collideBoxOnCircle(manifold, box, circle);

        if (collisionResult) {
            manifold.normal = qd.Vector2D.mutateNegate(manifold.normal);
        }

        return collisionResult;
    };

    qd.Collision.prototype._collideBoxOnCircle = function (manifold, box, circle) {
        var relativePosition,
            closestPoint,
            boundingBox = box.bounds,
            boxHalfWidth,
            boxHalfHeight,
            insideBox,
            normal,
            normalLengthSquared,
            radius = circle.radius,
            normalLength;

        // Vector from A to B
        relativePosition = qd.Vector2D.subtract(manifold.relativePosition, circle.position, box.position);

        // Closest point on A to center of B
        closestPoint = qd.Point2D.copy(manifold.closestPoint, relativePosition);

        // Calculate half extents along each axis
        boxHalfWidth = boundingBox.halfWidth();
        boxHalfHeight = boundingBox.halfHeight();

        // Clamp point to edges of the AABB
        closestPoint[0] = qd.clamp(-boxHalfWidth, boxHalfWidth, closestPoint[0]);
        closestPoint[1] = qd.clamp(-boxHalfHeight, boxHalfHeight, closestPoint[1]);

        insideBox = false;

        // Circle is inside the bounding box, so we need to clamp the circle's center to the closest edge
        if(relativePosition === closestPoint) {
            insideBox = true;

            // Find closest axis
            if(Math.abs(relativePosition[0]) > Math.abs(relativePosition[1])) {
                // Clamp to closest extent
                closestPoint[0] = qd.clamp(-boxHalfWidth, boxHalfWidth, closestPoint[0]);
            } else {
                // y axis is shorter

                // Clamp to closest extent
                closestPoint[1] = qd.clamp(-boxHalfHeight, boxHalfHeight, closestPoint[1]);
            }
        }

        normal = qd.Vector2D.subtract(manifold.normal, relativePosition, closestPoint);
        normalLengthSquared = qd.Vector2D.magnitudeSquared(normal);

        // Early out of the radius is shorter than distance to closest point and
        // Circle not inside the bounding box
        if (normalLengthSquared > radius * radius && !insideBox) {
            return false;
        }

        // Avoided sqrt until we needed
        normalLength = Math.sqrt(normalLengthSquared);

        // Normalise the normal
        normal = qd.Vector2D.mutateInverseScale(normal, normalLength);

        // Collision normal needs to be flipped to point outside if circle was inside the bounding box
        if (insideBox) {
            manifold.normal = qd.Vector2D.mutateNegate(normal);
            manifold.penetration = radius - normalLength;
        } else {
            manifold.normal = normal;
            manifold.penetration = radius - normalLength;
        }

        return true
    };

    qd.Collision.prototype.collidePolygonOnPolygon = function (manifold) {
        var a = manifold.a,
            b = manifold.b,
            bodyA = a.body,
            bodyB = b.body,
            shapeA = bodyA.bounds._shape,
            shapeB = bodyB.bounds._shape,
            axesA = shapeA.externalNormals(),
            axesB = shapeB.externalNormals(),
            i,
            axis,
            projectionA,
            projectionB,
            overlap,
            min,
            max,
            penetration = Number.MAX_SAFE_INTEGER,
            normal = manifold.normal,
            positionA = bodyA.position,
            positionB = bodyB.position;

        // loop over the axesA
        for (i = 0; i < axesA.length; i += 1) {
            axis = axesA[i];

            projectionA = shapeA.project(axis);
            projectionB = shapeB.project(axis);

            if (!projectionA.overlap(projectionB)) {
                return false;
            } else {
                overlap = projectionA.overlap(projectionB);

                if (projectionA.contains(projectionB) || projectionB.contains(projectionA)) {
                    // get the overlap plus the distance from the minimum end points
                    min = Math.abs(projectionA.min - projectionB.min);
                    max = Math.abs(projectionA.max - projectionB.max);
                    // NOTE: depending on which is smaller you may need to
                    // negate the separating axis!!
                    if (min < max) {
                        qd.Vector2D.mutateNegate(axis);
                        overlap += min;
                    } else {
                        overlap += max;
                    }
                }

                // Find the axis with the smallest penetration
                if (overlap < penetration) {
                    penetration = overlap;
                    qd.Vector2D.copy(normal, axis);
                }
            }
        }

        // loop over the axesB
        for (i = 0; i < axesB.length; i += 1) {
            axis = axesB[i];

            projectionA = shapeA.project(axis);
            projectionB = shapeB.project(axis);

            if (!projectionA.overlap(projectionB)) {
                return false;
            } else {
                overlap = projectionA.overlap(projectionB);

                if (projectionA.contains(projectionB) || projectionB.contains(projectionA)) {
                    // get the overlap plus the distance from the minimum end points
                    min = Math.abs(projectionA.min - projectionB.min);
                    max = Math.abs(projectionA.max - projectionB.max);
                    // NOTE: depending on which is smaller you may need to
                    // negate the separating axis!!
                    if (min < max) {
                        qd.Vector2D.mutateNegate(axis);
                        overlap += min;
                    } else {
                        overlap += max;
                    }
                }

                // Find the axis with the smallest penetration
                if (overlap < penetration) {
                    penetration = overlap;
                    qd.Vector2D.copy(normal, axis);
                }
            }
        }

        // make sure the vector is pointing from shape1 to shape2
        if (qd.Vector2D.dot(qd.Vector2D.subtract(manifold.relativePosition, positionB, positionA), normal) < 0) {
            // negate the normal if its not
            qd.Vector2D.mutateNegate(normal);
        }

        manifold.penetration = penetration;
        manifold.normal = normal;

        this.getContactsByClipping(manifold);

        return true;
    };

    qd.Collision.prototype.getContactsByClipping = function (manifold) {
        var a = manifold.a,
            b = manifold.b,
            bodyA = a.body,
            bodyB = b.body,
            shapeA = bodyA.bounds._shape,
            shapeB = bodyB.bounds._shape,
            normal,
            negNormal,
            contactEdgeA,
            contactEdgeB,
            projectionA,
            projectionB,
            referenceEdgeNormalised,
            negReferenceEdgeNormalised,
            offsetA,
            offsetB,
            clips,
            referenceEdgeNormal,
            incidenceEdgeNormal,
            maxSeparation,
            reference,
            incidence,
            flipped,
            contact,
            i;

        normal = manifold.normal;
        negNormal = qd.Vector2D.negate(manifold.negNormal, normal);

        contactEdgeA = shapeA.contactEdge(normal);
        contactEdgeB = shapeB.contactEdge(negNormal);

        // Cache the contact edges for debugging
        a.contactEdge = contactEdgeA;
        b.contactEdge = contactEdgeB;


        // Identify the reference and incident edges.
        // The reference edge is the edge most perpendicular to the separation normal.
        // The edge that is most perpendicular to a normal will have a dot product closer to zero.
        // So whichever edge has the smallest projection is the reference edge.
        projectionA = Math.abs(qd.Vector2D.dot(contactEdgeA.direction, normal));
        projectionB = Math.abs(qd.Vector2D.dot(contactEdgeB.direction, normal));

        if (projectionA <= projectionB) {
            reference = contactEdgeA;
            incidence = contactEdgeB;
            flipped = false
        } else {
            // Reference and incidence edges are flipped
            reference = contactEdgeB;
            incidence = contactEdgeA;
            // Flag the flip so the correct edge normal is used when clipping
            flipped = true;
        }

    //    qd.debug("Contact Edge A: ", a.contactEdge.direction)
    //    qd.debug("Contact Edge B: ", b.contactEdge.direction);
    //    qd.debug("Contact Edge " + ((flipped) ? "B" : "A") + " is the reference edge.");
    //    qd.debug("Separation Normal: ", manifold.normal)

        // Normalise the reference edge's direction
        referenceEdgeNormalised = qd.Vector2D.normalise(manifold.referenceEdgeNormalised, reference.direction);

        offsetA = qd.Vector2D.dot(referenceEdgeNormalised, reference.pointA);
        clips = this.clip(incidence.pointA, incidence.pointB, referenceEdgeNormalised, offsetA);

        if (clips.length < 2) {
    //        qd.debug("No clips 1: ", clips.length)
            return false;
        }

        negReferenceEdgeNormalised = qd.Vector2D.negate(manifold.negReferenceEdgeNormalised, referenceEdgeNormalised);

        offsetB = -qd.Vector2D.dot(referenceEdgeNormalised, reference.pointB);
        clips = this.clip(clips[0], clips[1], negReferenceEdgeNormalised, offsetB);

        if (clips.length < 2) {
    //        qd.debug("No clips 2", clips.length)
            return false;
        }

        // Get the reference edge normal (depends on the winding of the reference shape)
        if (reference.shape.clockwiseWinding()) {
            referenceEdgeNormal = qd.Vector2D.clockwisePerpendicular(manifold.referenceEdgeNormal, reference.direction);
        } else {
            referenceEdgeNormal = qd.Vector2D.antiClockwisePerpendicular(manifold.referenceEdgeNormal, reference.direction);
        }

        // If the incident and reference edges were flipped
        // then flip the reference edge normals to clip properly
        if (flipped) {
            qd.Vector2D.mutateNegate(referenceEdgeNormal);
        }

        // Get the largest separation depth
        maxSeparation = qd.Vector2D.dot(referenceEdgeNormal, reference.supportPoint);

        var clip1 = clips[0],
            clip2 = clips[1];

        // make sure the final points are not past this maximum
        var depth = [];
        depth[0] = qd.Vector2D.dot(referenceEdgeNormal, clip1) - maxSeparation;

        if (depth[0] < 0) {
            qd.remove(clips, function (point) {
                return point === clip1;
            });
        }

        depth[1] = qd.Vector2D.dot(referenceEdgeNormal, clip2) - maxSeparation;

        if (depth[1] < 0) {
            qd.remove(clips, function (point) {
                return point === clip2;
            });
        }

    //    qd.debug("Number of contacts: ", clips.length)

        manifold.contactsCount = clips.length;

        for (i = 0; i < clips.length; i += 1) {
    //        manifold.contactsDepth[i] = depth[i];
            contact = manifold.contacts[i];
            qd.Vector2D.copy(contact, clips[i]);
            qd.Vector2D.subtract(a.radialContacts[i], contact, a.position);
            qd.Vector2D.subtract(b.radialContacts[i], contact, b.position);
        }
    };

    /**
     * Clips the line segment between points {@code pointA} and {@code pointB}
     * if they are past the {@code offset} along the {@code normal}.
     *
     * @param {qd.Point2D} pointA
     * @param {qd.Point2D} pointB
     * @param {qd.Vector2D} normal
     * @param {Number} offset
     * @return {Array} the clipped points
     */
    qd.Collision.prototype.clip = function (pointA, pointB, normal, offset) {
        var clips,
            d1,
            d2,
            clipContact,
            clipContactScale;

        clips = [];

        d1 = qd.Vector2D.dot(normal, pointA) - offset;
        d2 = qd.Vector2D.dot(normal, pointB) - offset;

        if (d1 > 0.0) {
            d1 -= qd.math.EPSILON;
        } else {
            d1 += qd.math.EPSILON;
        }

        if (d2 > 0.0) {
            d2 -= qd.math.EPSILON;
        } else {
            d2 += qd.math.EPSILON;
        }
        // If either point is past offset along normal then keep the point
        if (d1 <= 0.0) {
            clips.push(pointA);
        } else {
    //            qd.debug("d1 ", d1)
        }

        if (d2 <= 0.0) {
            clips.push(pointB);
        } else {
    //            qd.debug("d2 ", d2)
        }

        // Check if the points are on opposing sides so that we can
        // compute the correct point
        if (d1 * d2 < 0.0) {
            // if they are on different sides of the
            // offset, d1 and d2 will be a (+) * (-)
            // and will yield a (-) and therefore be
            // less than zero
            // get the vector for the edge we are clipping
            // compute the location along e
            clipContact = qd.Vector2D.subtract(qd.Vector2D.create(0, 0), pointB, pointA);
            clipContactScale = d1 / (d1 - d2);
            qd.Vector2D.mutateScale(clipContact, clipContactScale);
            qd.Vector2D.mutateAdd(clipContact, pointA);
            clips.push(clipContact);
        }

        return clips;
    };

    qd.Collision.prototype.resolveCollision = function (manifold, dt) {
        var i,
            contactsCount = manifold.contactsCount,
            a = manifold.a,
            b = manifold.b,
            bodyA = a.body,
            bodyB = b.body,

            radialContactsA = a.radialContacts,
            radialContactsB = b.radialContacts,
            radialContactA,
            radialContactB,
            relativeContactVelocity,

            normal = manifold.normal,
            normalSpeed,

            restitution,
            inverseMomentA = a.inverseMoment,
            inverseMomentB = b.inverseMoment,
            inverseMassA = a.inverseMass,
            inverseMassB = b.inverseMass,

            impulseScalar,
            impulseScalarDivider,
            impulse;

        for (i = 0; i < contactsCount; i += 1) {

            // Calculate relative velocity

            radialContactA = radialContactsA[i];
            radialContactB = radialContactsB[i];
            relativeContactVelocity = this.relativeContactVelocity(manifold, radialContactA, radialContactB);

            // Calculate speed along normal
            normalSpeed = qd.Vector2D.dot(relativeContactVelocity, normal);

            // Cache normal speed
            manifold.normalSpeed = normalSpeed;

            // Do not resolve if bodies are separating
            if(normalSpeed >= 0) {
                return;
            }

            // Calculate restitution
            // TODO: If only gravity moving object, set restitution to zero
            restitution = Math.min(a.restitution, b.restitution);

            // Calculate impulse scalar
            impulseScalar = -(1.0 + restitution) * normalSpeed;

            impulseScalarDivider = (inverseMassA + inverseMassB)
                + (qd.math.square(qd.Vector2D.cross(radialContactA, normal)) * inverseMomentA)
                + (qd.math.square(qd.Vector2D.cross(radialContactB, normal)) * inverseMomentB);

            if (impulseScalarDivider !== 0) {
                impulseScalar /= (impulseScalarDivider * contactsCount);

                // Cache impulse scalar
                manifold.impulseScalar = impulseScalar;

                // Calculate and cache impulse vector
                impulse = qd.Vector2D.set(manifold.impulse, impulseScalar * normal[0], impulseScalar * normal[1]);

                // Apply impulse
                this.applyMutualImpulse(impulse, radialContactA, radialContactB, bodyA, bodyB);
            }
        }
    };

    qd.Collision.prototype.relativeContactVelocity = function (manifold, radialContactA, radialContactB) {
        var a = manifold.a,
            b = manifold.b,

            radialVelocityA = qd.Vector2D.scaleCross(manifold.radialVelocityA, a.angularVelocity, radialContactA),
            contactVelocityA = qd.Vector2D.subtract(manifold.contactVelocityA, a.velocity, radialVelocityA),

            radialVelocityB = qd.Vector2D.scaleCross(manifold.radialVelocityB, b.angularVelocity, radialContactB),
            contactVelocityB = qd.Vector2D.add(manifold.contactVelocityB, b.velocity, radialVelocityB);

        return qd.Vector2D.subtract(manifold.relativeContactVelocity, contactVelocityB, contactVelocityA);
    };

    /**
     * Apply a mutual impulse to a pair of bodies (body A and body B).
     */
    qd.Collision.prototype.applyMutualImpulse = function (impulse, radialContactA, radialContactB, bodyA, bodyB) {
        var deltaVelocityA = bodyA.deltaVelocity,
            deltaVelocityB = bodyB.deltaVelocity,
            deltaAngularVelocityA,
            deltaAngularVelocityB;

        // Calculate change in velocity
        qd.Vector2D.scale(deltaVelocityA, -bodyA.inverseMass, impulse);
        qd.Vector2D.scale(deltaVelocityB, bodyB.inverseMass, impulse);

        // Update velocity
        qd.Vector2D.mutateAdd(bodyA.velocity, deltaVelocityA);
        qd.Vector2D.mutateAdd(bodyB.velocity, deltaVelocityB);

        // Update angular velocity
        // Note that the impulse on body A is opposite to the impulse on body B
//        bodyA.torque += qd.Vector2D.cross(radialContactA, impulse);
        deltaAngularVelocityA = bodyA.inverseMoment * qd.Vector2D.cross(radialContactA, impulse);
        bodyA.angularVelocity += deltaAngularVelocityA;

//        bodyB.torque -= qd.Vector2D.cross(radialContactB, impulse);
        deltaAngularVelocityB = -bodyB.inverseMoment * qd.Vector2D.cross(radialContactB, impulse);
        bodyB.angularVelocity += deltaAngularVelocityB;
    };

    qd.Collision.prototype.applyFrictionImpulse = function (manifold) {
        var i,
            contactsCount = manifold.contactsCount,
            a = manifold.a,
            b = manifold.b,
            bodyA = a.body,
            bodyB = b.body,
            relativeContactVelocity,
            radialContactsA = a.radialContacts,
            radialContactsB = b.radialContacts,
            radialContactA,
            radialContactB,
            tangent = manifold.tangent,
            normal = manifold.normal,
            normalVelocity = manifold.normalVelocity,
            tangentImpulseScalar,
            inverseMassA = a.inverseMass,
            inverseMassB = b.inverseMass,
            sumInverseMass = inverseMassA + inverseMassB,
            mu,
            impulseScalar = manifold.impulseScalar,
            staticFrictionA = a.linearStaticFriction,
            staticFrictionB = b.linearStaticFriction,
            dynamicFrictionA = a.linearDynamicFriction,
            dynamicFrictionB = b.linearDynamicFriction,
            frictionImpulse = manifold.frictionImpulse,
            dynamicFriction;

        for (i = 0; i < contactsCount; i += 1) {

            // Need to re-calculate relative velocity after the normal impulse has been applied
            radialContactA = radialContactsA[i];
            radialContactB = radialContactsB[i];
            relativeContactVelocity = this.relativeContactVelocity(manifold, radialContactA, radialContactB);

            // Solve for the tangent vector
            normalVelocity = qd.Vector2D.scale(
                normalVelocity, qd.Vector2D.dot(relativeContactVelocity, normal), normal);

            tangent = qd.Vector2D.subtract(tangent, relativeContactVelocity, normalVelocity);

            qd.Vector2D.mutateNormalise(tangent);

            // Solve for magnitude to apply along the friction vector
            tangentImpulseScalar = -qd.Vector2D.dot(relativeContactVelocity, tangent);

            if (sumInverseMass !== 0) {
                tangentImpulseScalar /= (sumInverseMass * contactsCount);

                // Use to approximate mu given friction coefficients of each body
                mu = qd.math.pythagoreanSolve(staticFrictionA, staticFrictionB);

                // Clamp magnitude of friction and create impulse vector
                if (Math.abs(tangentImpulseScalar) < impulseScalar * mu) {
                    frictionImpulse = qd.Vector2D.scale(frictionImpulse, tangentImpulseScalar, tangent);
                } else {
                    dynamicFriction = qd.math.pythagoreanSolve(dynamicFrictionA, dynamicFrictionB);
                    frictionImpulse = qd.Vector2D.mutateNegate(
                        qd.Vector2D.scale(frictionImpulse, impulseScalar * dynamicFriction, tangent));
                }

                //            qd.debug("Friction Mag: ", qd.Vector2D.magnitude(frictionImpulse));

                this.applyMutualImpulse(frictionImpulse, radialContactA, radialContactB, bodyA, bodyB);
            }
        }
    };

    qd.Collision.prototype.separateCollidingBodies = function (manifold) {
        var a,
            b,
            sumInverseMass,
            inverseMassA,
            inverseMassB,
            normal,
            penetrationCorrection,
            correctionScalar,
            positionCorrection,
            positionCorrectionA,
            positionCorrectionB;

        a = manifold.a;
        b = manifold.b;

        inverseMassA = a.inverseMass;
        inverseMassB = b.inverseMass;

        sumInverseMass = inverseMassA + inverseMassB;

        if (sumInverseMass !== 0) {
            normal = manifold.normal;
            penetrationCorrection = Math.max(manifold.penetration - this._penetrationSlop, 0.0);
            correctionScalar = (penetrationCorrection / sumInverseMass) * this._penetrationPercent;
            positionCorrection = qd.Vector2D.scale(manifold.positionCorrection, correctionScalar, normal);
            positionCorrectionA = qd.Vector2D.scale(a.positionCorrection, inverseMassA, positionCorrection);
            positionCorrectionB = qd.Vector2D.scale(b.positionCorrection, inverseMassB, positionCorrection);

            qd.Point2D.mutateSubtract(a.position, positionCorrectionA);
            qd.Point2D.mutateAdd(b.position, positionCorrectionB);
        }
    };
}(qd));
(function (qd) {

    /**
     * qd.Physics
     *
     * @param {Object?} options
     * @constructor
     */
    qd.Physics = function (options) {
        this.init(options);
    };

    /* Static */

    qd.Physics.rotationalInertia = function (name, properties) {
        var p = properties,
            moment;

        switch (name) {
            case "two-point-masses":
                moment = ((p.massA * p.massB) / (p.massA + p.massB)) * (p.separation * p.separation);
                break;
            case "rod-centre":
                moment = p.mass * p.length * p.length / 12;
                break;
            case "rod-end":
                moment = p.mass * p.length * p.length / 3;
                break;
            case "circular-hoop":
                moment = p.mass * p.radius * p.radius;
                break;
            case "circular-disk":
                moment = p.mass * p.radius * p.radius / 2;
                break;
            case "cylinder":
                moment = p.mass * p.radius * p.radius / 2;
                break;
            case "rectangle":
                moment = (p.mass / 12) * (p.height * p.height + p.width * p.width);
                break;
            case "polygon":
                // TODO:
                break;
            case "point-mass":
            default:
                moment = p.mass * p.radius * p.radius;
        }

        return moment;
    };

    /* Public Methods */

    qd.Physics.prototype.init = function (options) {
        this.settings = qd.mergeProperties({
            linearDamping: 1,
            rotationalDamping: 1,
            gravity: 0,
            gravitationalConstant: 0,
            integrator: "euler",
            penetrationPercent: 1,
            penetrationSlop: 0.02,
            canvas: null
        }, (options || {}));

        this._integrator = this.integrator(this.settings.integrator);
        this._collision = new qd.Collision(this);
        this._forceFields = [];
        this._bodies = [];

        this._linearDamping = this.settings.linearDamping;
        this._rotationalDamping = this.settings.rotationalDamping;
        this._gravitationalConstant = this.settings.gravitationalConstant;
        this._gravitationalField = this.forceField("gravitational-field", { "gravity": this.settings.gravity } );
        this._forceFields.push(this._gravitationalField);
        this._constraints = [];
        this._energy = {
            kinetic: 0,
            potential: 0
        };
    };

    qd.Physics.prototype.clear = function () {
        this._bodies = [];
        return this;
    };

    qd.Physics.prototype.setting = function (setting, value) {
        qd.debug("qd.Physics.setting: ", setting, ", ", value);

        switch (setting) {
            case "linearDamping":
                this._linearDamping = value;
                break;
            case "rotationalDamping":
                this._rotationalDamping = value;
                break
            case "gravity":
                this._gravitationalField._gravity = value;
                break;
            case "gravitationalConstant":
                this._gravitationalConstant = value;
                break;
            default:
            // Nothing to set
        }

        return this;
    };

    /**
     * Simulate a physic's time step.
     *
     * @param {Number} t current simulation time
     * @param {Number} dt current simulation time step
     * @return {qd.Physics}
     */
    qd.Physics.prototype.step = function (t, dt) {
        var bodies = this._bodies,
            i,
            body,
            integrate = this._integrator.integrate;

        // Add up all forces on all bodies

        for (i = 0; i < bodies.length; i += 1) {
            body = bodies[i];

            if (body.active) {
                body.clearForcesAndDeltas();
                this.applyForceFields(body, dt);
            }
        }

        // Apply gravitation

        if (this._gravitationalConstant > 0) {
            this.eachActiveInteraction(bodies, this.gravitate);
        }

        // Apply Constraints
        for (i = 0; i < this._constraints.length; i += 1) {
            this._constraints[i].apply();
        }

        // Resolve collisions
        this._collision.resolve(bodies);

        // Displacement, Derivative, Acceleration
        for (i = 0; i < bodies.length; i += 1) {
            body = bodies[i];

            if (body.active) {
                integrate(body, t, dt);
                this.applyDamping(body);
            }
        }

        return this;
    };

    qd.Physics.prototype.add = function (object) {
        if (object.constructor === qd.Body) {

            this._bodies.push(object);

        } else if (object.constructor === qd.Physics.ConstantGravitationalField
                || object.constructor === qd.Physics.VariableGravitationalField) {

            this._forceFields.push(object);

        } else if (object.constructor === qd.EulerIntegrator
                || object.constructor === qd.SymplecticEulerIntegrator
                || object.constructor === qd.VerletIntegrator) {

            this.integrator = object;

        } else if (object.constructor === qd.Physics.DistanceConstraint) {

            this._constraints.push(object);

        }

        return this;
    };

    qd.Physics.prototype.remove = function (object) {
        if (object.constructor === qd.Body) {

            qd.remove(this._bodies, function (body) {
                return object === body;
            });

        } else if (object.constructor === qd.Physics.ConstantGravitationalField
                || object.constructor === qd.Physics.VariableGravitationalField) {

            qd.remove(this._forceFields, function (forceField) {
                return object === forceField;
            });

        } else if (object.constructor === qd.Physics.DistanceConstraint) {

            qd.remove(this._constraints, function (constraint) {
                return object === constraint;
            });

        }

        return this;
    };

    /**
     * Body factory method.
     *
     * @param type
     * @param bounds
     * @return {*}
     */
    qd.Physics.prototype.body = function (type, options) {
        var body;

        switch (type) {
            case "dynamic":
                body = new qd.Body(options.bounds, this.material(options.material));
                break;
            case "static":
            default:
                body = new qd.Body(options.bounds, this.material("static"));
        }

        return body;
    };

    /**
     * Material factory method.
     *
     * @param {String} type
     */
    qd.Physics.prototype.material = function (type) {
        var material;

        switch (type) {
            case "rock":
                material = {
                    density: 0.0006,
                    restitution: 0.1,
                    linearStaticFriction: 0.9,
                    linearDynamicFriction: 0.9
                };
                break;
            case "wood":
                material = {
                    density: 0.0003,
                    restitution: 0.01,
                    linearStaticFriction: 0.7,
                    linearDynamicFriction: 0.6
                };
                break;
            case "metal":
                material = {
                    density: .0012,
                    restitution: 0.05,
                    linearStaticFriction: 0.4,
                    linearDynamicFriction: 0.3
                };
                break;
            case "bouncyBall":
                material = {
                    density: 0.0003,
                    restitution: 0.8,
                    linearStaticFriction: 0.5,
                    linearDynamicFriction: 0.5
                };
                break;
            case "superBall":
                material = {
                    density: 0.0003,
                    restitution: 0.95,
                    linearStaticFriction: 0.5,
                    linearDynamicFriction: 0.5
                };
                break;
            case "pillow":
                material = {
                    density: 0.0001,
                    restitution: 0.02,
                    linearStaticFriction: 0.6,
                    linearDynamicFriction: 0.5
                };
                break;
            case "static":
            default:
                material = {
                    density: 0.0,
                    restitution: 0.4,
                    linearStaticFriction: .1,
                    linearDynamicFriction: .1
                };
        }

        return material
    };

    qd.Physics.ConstantField = function (vectorField) {
        this._vectorField = vectorField;
    };

    qd.Physics.ConstantField.prototype.apply = function (body, dt) {
        var field = this._vectorField,
            mass = body.mass,
            force = body.force;

        force[0] = field[0] * mass;
        force[1] = field[1] * mass;
    };

    qd.Physics.ConstantGravitationalField = function (gravity) {
        this._gravity = gravity;
    };

    qd.Physics.ConstantGravitationalField.prototype.apply = function (body, dt) {
        body.force[1] += this._gravity * body.gMass;
    };

    qd.Physics.VariableGravitationalField = function (vectorFieldEquation) {
        this._fieldEquation = vectorFieldEquation;
    };

    qd.Physics.VariableGravitationalField.prototype.apply = function (body, dt) {
        var position = body.position,
            mass = body.mass,
            force = body.force,
            field = this._fieldEquation.evaluate(position[0], position[1]);

        force[0] += field[0] * mass;
        force[1] += field[1] * mass;
    };

    qd.Physics.DynamicGravitationalField = function (fieldEquation) {
        this._fieldEquation = fieldEquation;
    };

    qd.Physics.DynamicGravitationalField.prototype.apply = function (body, dt) {
        var position = body.position,
            mass = body.mass,
            force = body.force,
            field = this._fieldEquation.evaluate(position[0], position[1], dt);

        force[0] += field[0] * mass;
        force[1] += field[1] * mass;
    };

    /**
     * Force field builder.
     *
     * @param fieldVector
     */
    qd.Physics.prototype.forceField = function (type, properties) {
        var forceField;

        switch (type) {
            case "gravitational-field":
            case "constant-gravitational-field":
                forceField = new qd.Physics.ConstantGravitationalField(properties.gravity);
                break;
            case "variable-gravitational-field":
                forceField = new qd.Physics.VariableGravitationalField(properties._fieldEquation);
                break;
            case "dynamic-gravitational-field":
                forceField = new qd.Physics.DynamicGravitationalField(properties._fieldEquation);
                break;
            default:
                forceField = new qd.Physics.ConstantGravitationalField(this.settings.gravity);
        }

        return forceField;
    };

    /**
     * Integrator factory method.
     *
     * @param {String} name
     * @return {Function}
     */
    qd.Physics.prototype.integrator = function (name, settings) {
        var integrator;

        switch (name) {
            case "semi-implicit-euler":
            case "symplectic-euler":
                integrator = new qd.Physics.SymplecticEulerIntegrator(this, settings);
                break;
            case "verlet":
                integrator = new qd.Physics.VerletIntegrator(this, settings);
                break;
            case "euler":
            case "explicit-euler":
            default:
                integrator = new qd.Physics.EulerIntegrator(this, settings);
        }

        return integrator;
    };

    /**
     * Euler Integrator.
     *
     * @constructor
     */
    qd.Physics.EulerIntegrator = function () {

    };

    qd.Physics.EulerIntegrator.prototype.integrate = function (body, t, dt) {
        var inverseMass,
            position,
            deltaPosition,
            dx,
            dy,
            velocity,
            force,
            inverseMoment,
            deltaAngle;

        inverseMass = body.inverseMass;

        if (inverseMass > 0) {
            // Linear displacement
            position = body.position;
            deltaPosition = body.deltaPosition;
            velocity = body.velocity;

            dx = velocity[0] * dt;
            dy = velocity[1] * dt;

            deltaPosition[0] = dx;
            deltaPosition[1] = dy;

            position[0] += dx;
            position[1] += dy;

            // Linear acceleration
            force = body.force;

            velocity[0] += force[0] * inverseMass * dt;
            velocity[1] += force[1] * inverseMass * dt;
        }

        inverseMoment = body.inverseMoment;

        if (inverseMoment > 0) {
            // Rotational displacement
            deltaAngle = body.angularVelocity * dt;
            body.deltaAngle = deltaAngle;
            body.angle += deltaAngle;

            // Rotational acceleration
            body.angularVelocity += body.torque * inverseMoment * dt;
        }
    };

    qd.Physics.SymplecticEulerIntegrator = function () {

    };

    qd.Physics.SymplecticEulerIntegrator.prototype.integrate = function (body, t, dt) {
        var force,
            velocity,
            position,
            deltaPosition,
            dx,
            dy,
            inverseMass,
            inverseMoment,
            deltaAngle;

        inverseMass = body.inverseMass;

        if (inverseMass > 0) {
            // Linear acceleration
            force = body.force;
            velocity = body.velocity;

            velocity[0] += (force[0] * inverseMass * dt);
            velocity[1] += (force[1] * inverseMass * dt);

            // Linear displacement
            position = body.position;
            deltaPosition = body.deltaPosition;

            dx = velocity[0] * dt;
            dy = velocity[1] * dt;

            deltaPosition[0] = dx;
            deltaPosition[1] = dy;

            position[0] += dx;
            position[1] += dy;
        }

        inverseMoment = body.inverseMoment;

        if (inverseMoment > 0) {
            // Rotational acceleration
            body.angularVelocity += body.torque * inverseMoment * dt;

            // Rotational displacement
            deltaAngle = body.angularVelocity * dt;
            body.deltaAngle = deltaAngle;
            body.angle += deltaAngle;
        }
    };

    qd.Physics.VerletIntegrator = function () {

    };

    qd.Physics.VerletIntegrator.prototype.integrate = function (body, t, dt) {
        var force,
            position,
            positionX,
            positionY,
            previousPosition,
            deltaPosition,
            inverseMass,
            accelerationX,
            accelerationY,
            velocity,
            deltaVelocityX,
            deltaVelocityY,
            inverseMoment,
            angularAcceleration,
            deltaAngularVelocity;

        // Linear motion
        inverseMass = body.inverseMass;

        if (inverseMass > 0) {
            // Get position data
            position = body.position;
            previousPosition = body.previousPosition;
            deltaPosition = body.deltaPosition;

            // Calculate acceleration
            force = body.force;
            accelerationX = force[0] * inverseMass;
            accelerationY = force[1] * inverseMass;

            // Update velocity
            deltaVelocityX = accelerationX * dt;
            deltaVelocityY = accelerationY * dt;

            velocity = body.velocity;
            velocity[0] += deltaVelocityX;
            velocity[1] += deltaVelocityY;

            // Update position
            positionX = position[0];
            positionY = position[1];

            deltaPosition[0] = (positionX - previousPosition[0]) + deltaVelocityX * dt;
            deltaPosition[1] = (positionY - previousPosition[1]) + deltaVelocityY * dt;

            position[0] += deltaPosition[0];
            position[1] += deltaPosition[1];

            previousPosition[0] = position[0];
            previousPosition[1] = position[1];
        }

        // Angular motion
        inverseMoment = body.inverseMoment;

        if (inverseMoment > 0) {
            // Rotational displacement
            angularAcceleration = body.torque * inverseMoment;
            deltaAngularVelocity = angularAcceleration * dt;
            body.deltaAngle = (body.angle - body.previousAngle) + deltaAngularVelocity * dt;
            body.angle += body.deltaAngle;
            body.previousAngle = body.angle;

            // Rotational acceleration
            body.angularVelocity += deltaAngularVelocity;
        }
    };

    qd.Physics.prototype.constraint = function (name, properties) {
        switch (name) {
            case "distance":
                return new qd.Physics.DistanceConstraint(properties.bodyA, properties.bodyB, properties.distance);
                break;

            default:
            // Maximum world collision box
        }
    };

    qd.Physics.DistanceConstraint = function (bodyA, bodyB, target) {
        this.bodyA = bodyA;
        this.bodyB = bodyB;
        this.target = target;

        // Cache
        this.direction = qd.Vector2D.create(0.0, 0.0);
    };

    qd.Physics.DistanceConstraint.prototype.apply = function () {
        var positionA = this.bodyA.position,
            positionB = this.bodyB.position,
            direction = qd.Vector2D.subtract(this.direction, positionB, positionA),
            length = qd.Vector2D.magnitude(direction),
            factor = (length - this.target) / (length * 2.0),
            correction = qd.Vector2D.mutateScale(direction, factor);

        qd.Vector2D.mutateAdd(positionA, correction);
        qd.Vector2D.mutateSubtract(positionB, correction);
    };

    qd.Physics.prototype.applyDamping = function (body) {
        var linearDamping,
            velocity;

        if (body.mass > 0) {
            // Linear Damping
            velocity = body.velocity;
            linearDamping = this._linearDamping;
            velocity[0] *= linearDamping;
            velocity[1] *= linearDamping;
        }

        if (body.moment > 0) {
            // Rotational Damping
            body.angularVelocity *= this._rotationalDamping;
        }

        return this;
    };

    qd.Physics.prototype.applyForceFields = function (body) {
        var i,
            forceFields = this._forceFields,
            forceField;

        for (i = 0; i < forceFields.length; i += 1) {
            forceField = forceFields[i];
            forceField.apply(body);
        }
    };

    qd.Physics.prototype.kineticEnergy = function (body) {
        var speed = qd.Vector2D.magnitude(body.velocity);

        return 0.5 * body.mass * speed * speed;
    };

    /**
     * Applies the interactor function for each pair of active {@code bodies}.
     *
     * @param {Array<qd.Body>} bodies
     * @param {Function} interactor function(bodyA, bodyB}
     * @return {qd.Physics}
     */
    qd.Physics.prototype.eachActiveInteraction = function (bodies, interactor, context) {
        var i,
            j,
            bodyA,
            bodyB,
            interactorCtx = context || this;

        for (i = 0; i < bodies.length - 1; i += 1) {
            bodyA = bodies[i];
            if (bodyA.active) {
                for (j = i + 1; j < bodies.length; j += 1) {
                    bodyB = bodies[j];
                    if (bodyB.active) {
                        interactor.call(interactorCtx, bodyA, bodyB);
                    }
                }
            }
        }
        return this;
    };

    /**
     * Applies the interactor function for each pair of {@code bodies}, whether they are active or not.
     *
     * @param {Array<qd.Body>} bodies
     * @param {Function} interactor function(bodyA, bodyB}
     * @return {qd.Physics}
     */
    qd.Physics.prototype.eachInteraction = function (bodies, interactor, context) {
        var i,
            j,
            bodyA,
            bodyB,
            interactorCtx = context || this;

        for (i = 0; i < bodies.length - 1; i += 1) {
            bodyA = bodies[i];

            for (j = i + 1; j < bodies.length; j += 1) {
                bodyB = bodies[j];

                interactor.call(interactorCtx, bodyA, bodyB);
            }
        }
        return this;
    };

    qd.Physics.prototype.gravitate = function (bodyA, bodyB) {
        var pA,
            pB,
            dx,
            dy,
            distSquared,
            oneOverDistSquared,
            oneOverNormalLength,
            massA,
            massB,
            forceScalar,
            forceX,
            forceY,
            fA,
            fB,
            normalX,
            normalY;

        massA = bodyA.gMass;
        massB = bodyB.gMass;

        if (massA !== 0 && massB !== 0) {
            pA = bodyA.position;
            pB = bodyB.position;

            dx = pB[0] - pA[0];
            dy = pB[1] - pA[1];

            distSquared = dx * dx + dy * dy;

            if (distSquared >= 0) {
                oneOverDistSquared = 1 / distSquared;
                forceScalar = this._gravitationalConstant * massA * massB * oneOverDistSquared;

                oneOverNormalLength = Math.sqrt(oneOverDistSquared);
                normalX = dx * oneOverNormalLength;
                normalY = dy * oneOverNormalLength;

                forceX = forceScalar * normalX;
                forceY = forceScalar * normalY;

                fA = bodyA.force;
                fB = bodyB.force;

                fA[0] += forceX;
                fA[1] += forceY;

                fB[0] -= forceX;
                fB[1] -= forceY;

                // Calculate and cache gravitational potential energy
                var den = (Math.sqrt(distSquared) - bodyA.bounds.radius() - bodyB.bounds.radius());
                if (den > 0) {
                    this._energy.potential += -this._gravitationalConstant * massA * massB / den;
                }
            }
        }
    };

}(qd));
(function (qd) {

    /**
     * @constructor
     *
     * TODO: Refactor:
     *   - Rename to MinMaxBox.
     *   - Rename topLeft and bottomRight to min and max respectively.
     *   - Change contructor to accept any number of points. Zero points = origin.
     *   - MinMaxBox is a type of Bounds
     *   - Other types of Bounds include Circles and Convex Polygons
     *
     * TODO: Consider renaming qd.Shape back to qd.Path. qd.Path is for drawing and user manipulation.
     *   Changes to the path change the bounds. qd.Body2D directly uses and manipulates the bounds.
     *   Instead of the qd.Entity inspecting the qd.Body2D for position changes, the qd.Bod2D should
     *   have the responsibility to updating the bounds. This means every Path/Graphic also has an
     *   associated body. An entity is comprised of multiple Path/Graphic-Body/Bounds.
     *   Bodies and Graphics can move around and change within the entity. The entity is just a
     *   complex body/graphic that the user can interact with (dragging, changing graphics and body
     *   properties, etc).
     *   The Bounds is a representation of the Shape. It links to the Shape/Path?
     *
     *   Consider renaming Bounds to Boundary. It better expresses the shape.
     *
     */
    qd.BoundingBox = function (view) {
        this._min = qd.Point2D.create(0, 0);
        this._max = qd.Point2D.create(0, 0);
        this._centroid = qd.Point2D.create(0, 0);

        this._resizeEvent = new qd.EventTrigger();

        if (view) {
            this._shape = new qd.Shape(view, [this._min, this._max]);
        }
    };

    qd.BoundingBox.prototype.init = function (minX, minY, maxX, maxY) {
        return this.resize(minX || 0, minY || 0, maxX || 0, maxY || 0);
    };

    qd.BoundingBox.prototype.destroy = function () {
        this._resizeEvent.destroy();
        this._centroid = undefined;
        this._max = undefined;
        this._min = undefined;
    };

    qd.BoundingBox.prototype.resize = function (minX, minY, maxX, maxY) {
        this._min[0] = minX;
        this._min[1] = minY;
        this._max[0] = maxX;
        this._max[1] = maxY;

        this._width = Math.abs(maxX - minX);
        this._height = Math.abs(maxY - minY);

        this._halfWidth = (this._width * 0.5);
        this._halfHeight = (this._height * 0.5);

        this._radius = Math.max(this._halfWidth, this._halfHeight);

        this._centroid[0] = qd.math.lerp(minX, maxX, 0.5);
        this._centroid[1] = qd.math.lerp(minY, maxY, 0.5);

        this._angle = 0;  // radians

        qd.debug("Bounding Box firing Resize Event");
        this._resizeEvent.fire();

        return this;
    };

    qd.BoundingBox.prototype.resizeAsPolygon = function(points) {
        var i,
            point,
            minX,
            maxX,
            minY,
            maxY,
            x,
            y;

        if (points.length > 0) {
            point = points[0];
            minX = point[0];
            maxX = point[0];
            minY = point[1];
            maxY = point[1];

            for (i = 1; i < points.length; i += 1) {
                point = points[i];
                x = point[0];
                y = point[1];

                if (x < minX) {
                    minX = x;
                }

                if (x > maxX) {
                    maxX = x;
                }

                if (y < minY) {
                    minY = y;
                }

                if (y > maxY) {
                    maxY = y;
                }
            }

            this.resize(minX, minY, maxX, maxY);
        }

        return this;
    };

    qd.BoundingBox.prototype.clone = function () {
        return new qd.BoundingBox().init(this._min[0], this._min[1], this._max[0], this._max[1]);
    };

    qd.BoundingBox.prototype.min = function (min) {
        if (min) {
            this.resize(min[0], min[1], this._max[0], this._max[1]);
            return this;
        }

        return this._min;
    };

    qd.BoundingBox.prototype.max = function (max) {
        if (max) {
            this.resize(this._min[0], this._min[1], max[0], max[1]);
            return this;
        }

        return this._max;
    };

    qd.BoundingBox.prototype.left = function () {
        return this._min[0];
    };

    qd.BoundingBox.prototype.top = function () {
        return this._min[1];
    };

    qd.BoundingBox.prototype.right = function () {
        return this._max[0];
    };

    qd.BoundingBox.prototype.bottom = function () {
        return this._max[1];
    };

    qd.BoundingBox.prototype.centroid = function () {
        return qd.Point2D.clone(this._centroid);
    };

    qd.BoundingBox.prototype.centroidX = function () {
        return this._centroid[0];
    };

    qd.BoundingBox.prototype.centroidY = function () {
        return this._centroid[1];
    };

    qd.BoundingBox.prototype.angle = function () {
        return this._angle;
    };

    qd.BoundingBox.prototype.width = function () {
        return this._width;
    };

    qd.BoundingBox.prototype.halfHeight = function () {
        return this._halfHeight;
    };

    qd.BoundingBox.prototype.halfWidth = function () {
        return this._halfWidth;
    };

    qd.BoundingBox.prototype.height = function () {
        return this._height;
    };

    qd.BoundingBox.prototype.area = function () {
        return this._width * this._height;
    };

    qd.BoundingBox.prototype.radius = function () {
        return this._radius;
    };

    qd.BoundingBox.prototype.translate = function (dx, dy) {
        var min = this._min,
            max = this._max;

        this.resize(
            (min[0] + dx), (min[1] + dy),
            (max[0] + dx), (max[1] + dy));

        return this;
    };

    qd.BoundingBox.prototype.rotate = function (dtheta) {
        this._angle += dtheta;
    };

    qd.BoundingBox.prototype.hitTest = function (x, y) {
        var min = this._min,
            max = this._max;

       return !(x < min[0] ||
            x > max[0] ||
            y < min[1] ||
            y > max[1]);
    };

    qd.BoundingBox.prototype.boxOnBoxCollisionTest = function (bounds) {
        return this.boxCollisionTest(bounds._min, bounds._max);
    };

    qd.BoundingBox.prototype.boxCollisionTest = function (min, max) {
        var minA = this._min,
            maxA = this._max,
            leftA = minA[0],
            rightA = maxA[0],
            topA = minA[1],
            bottomA = maxA[1],

            leftB = min[0],
            rightB = max[0],
            topB = min[1],
            bottomB = max[1];

        return (leftA <= rightB &&
            leftB <= rightA &&
            topA <= bottomB &&
            topB <= bottomA);
    };

    qd.BoundingBox.prototype.circleOnCircleCollisionTest = function (bounds) {
        var centroidA = this._centroid,
            centroidB = bounds._centroid,
            minDistance = this._radius + bounds._radius,
            dx = centroidB[0] - centroidA[0],
            dy = centroidB[1] - centroidA[1];

        return minDistance * minDistance > ((dx * dx) + (dy * dy));
    };

    qd.BoundingBox.prototype.onResize = function (namespace, handler, context) {
        this._resizeEvent.bind(namespace, handler, context);
        return this;
    };

    qd.BoundingBox.prototype.offResize = function (namespace, handler, context) {
        this._resizeEvent.unbind(namespace, handler, context);
        return this;
    };

    qd.BoundingBox.prototype.drawCircle = function (canvas) {
        canvas.view()
            .path()
            .traceCircle(this._centroid[0], this._centroid[1], this._radius)
            .draw( { stroke: "blue" } );
    };

}(qd));
/**
 * Represents a 2D rectangular cloth with dimensions {@code width} X {@code height}.
 *
 * The cloth is divided into squares whose vertices are connected by springs with
 * the given {@code springConstant}.
 *
 * @param width
 * @param height
 * @param rows
 * @param columns
 * @param springConstant
 * @constructor
 */
qd.Cloth = function (height, width, rows, columns, springConstant) {
    var dx, dy,
        x, y,
        row, col,
        rowBodies,
        bodyA,
        bodyB,
        rowA,
        rowB;

    function buildSpring(bodyA, bodyB, springConstant) {
        return new qd.DynamicSpring(bodyA, bodyB, springConstant);
    }

    function buildBody(x, y) {
        return new qd.Body(x, y);
    }

    this.columns = columns;
    this.rows = rows;
    this.bodies = []; // 2D array of bodies
    this.springs = []; // flat array of springs

    dx = width / columns;
    dy = height / rows;

    for (row = 0; row < rows; row += 1) {
        y = dy * row;

        rowBodies = [];

        for (col = 0; col < columns; col += 1) {
            x = dx * col;
            rowBodies.push(buildBody(x, y));
        }

        this.bodies.push(rowBodies);
    }

    // Attach springs for each row
    for (row = 0; row < rows; row += 1) {
        for (col = 0; col < columns - 1; col += 1) {
            bodyA = this.bodies[row][col];
            bodyB = this.bodies[row][col + 1];
            this.springs.push(buildSpring(bodyA, bodyB, springConstant));
        }
    }

    // Attach springs for each column
    for (row = 0; row < rows - 1; row += 1) {
        rowA = this.bodies[row];
        rowB = this.bodies[row + 1];

        for (col = 0; col < columns; col += 1) {
            bodyA = rowA[col];
            bodyB = rowB[col];
            this.springs.push(buildSpring(bodyA, bodyB, springConstant));
        }
    }
};

qd.Cloth.prototype.getBodies = function () {
    return this.bodies;
};

qd.Cloth.prototype.getSprings = function () {
    return this.springs;
};

qd.Cloth.prototype.getPerimeterBodies = function () {
    var perimeterBodies = [],
        column,
        row;

    for (column = 0; column < this.columns; column += 1) {
        perimeterBodies.push(this.bodies[0][column]);
    }

    for (row = 1; row < this.rows - 1; row += 1) {
        perimeterBodies.push(this.bodies[row][this.columns - 1]);
    }

    for (column = this.columns - 1; column > 0; column -= 1) {
        perimeterBodies.push(this.bodies[this.rows - 1][column]);
    }

    for (row = this.rows - 1; row > 0; row = row - 1) {
        perimeterBodies.push(this.bodies[row][0]);
    }

    return perimeterBodies;
};qd.DynamicSpring = function (endPoint0, endPoint1, springConstant) {
    var springLength = qd.math.distance(endPoint0.x, endPoint0.y, endPoint1.x, endPoint1.y);
    this.endPoint0 = endPoint0;
    this.endPoint1 = endPoint1;
    this.spring0 = new qd.Spring(endPoint0, endPoint1, springLength, springConstant);
    this.spring1 = new qd.Spring(endPoint1, endPoint0, springLength, springConstant);
};

qd.DynamicSpring.prototype.update = function () {
    this.spring0.update();
    this.spring1.update();
};
// /**
//  * qd.Kinematics namespace.
//  *
//  * @type {Object}
//  */
// qd.Kinematics = {};
//
// /**
//  * Drag the {@code segment} to the target point (targetX, targetY).
//  *
//  * @param {qd.Kinematics.Segment} segment
//  * @param {Number} targetX
//  * @param {Number} targetY
//  */
// qd.Kinematics.dragSegment = function (segment, targetX, targetY) {
//     if (segment === null || !(segment instanceof qd.Kinematics.Segment)) {
//         return;
//     }
//
//     var dx, dy, angle, w, h;
//
//     dx = targetX - segment.x;
//     dy = targetY - segment.y;
//     angle = Math.atan2(dy, dx);
//
//     segment.r = angle;
//
//     w = segment.jointX() - segment.x;
//     h = segment.jointY() - segment.y;
//     segment.x = targetX - w;
//     segment.y = targetY - h;
//
//     qd.Kinematics.dragSegment(
//         segment.attachedSegment,
//         segment.x,
//         segment.y
//     );
// };
//
// /**
//  * qd.Kinematics.Segment extends qd.Body
//  *
//  * A kinematics segment has two endpoints (its Head and Joint) separated
//  * by a length. You can create a chain of segments by attaching the head
//  * of one segment to the joint of another segment.
//  *
//  * The head endpoint is treated like a {@code qd.Body}
//  * object and it is positioned by this segment's x and y properties.
//  * All physical interactions with the segment are applied to the head.
//  *
//  * The second endpoint is the segment's joint. Use
//  * {@code qd.Kinematics.Segment.prototype.attachSegment} to
//  * attach the head of another {qd.Physics.Segment} to this
//  * segment's joint.
//  *
//  * @type {qd.Kinematics.Segment|qd.Body}
//  */
// qd.Kinematics.Segment = qd.extendClass(
//     qd.Body,
//     "qd.Kinematics.Segment",
//     function (x, y, r, length) {
//         this.attachedSegment = null;
//         this.segmentLength = length || 0;
//         this.x = x || 0.0;
//         this.y = y || 0.0;
//         this.r = r || 0.0;
//         this.m = 1;
//     }
// );
//
// /**
//  * Builds a {qd.BoundingBox} for the {qd.Kinematics.Segment}.
//  *
//  * @return {qd.BoundingBox}
//  */
// qd.Kinematics.Segment.prototype.buildBoundingBox = function () {
//     var width = Math.abs(this.jointX() - this.x),
//         height = Math.abs(this.jointY() - this.y);
//     return new qd.BoundingBox(this, width, height);
// };
//
// /**
//  * Get this segment joint's x position.
//  *
//  * @return {Number}
//  */
// qd.Kinematics.Segment.prototype.jointX = function () {
//     return qd.Math.rotateXPosition(this.x, this.r, this.segmentLength);
// };
//
// /**
//  * Get the segment joint's y position.
//  *
//  * @return {Number}
//  */
// qd.Kinematics.Segment.prototype.jointY = function () {
//     return qd.Math.rotateYPosition(this.y, this.r, this.segmentLength);
// };
//
// /**
//  * Attach the head of the specified {@code segment} to the tail of this segment.
//  *
//  * @param segment
//  */
// qd.Kinematics.Segment.prototype.attachSegment = function (segment) {
//     this.attachedSegment = segment;
//     this.attachedSegment.x = qd.Math.rotateXPosition(this.x, this.r, this.segmentLength);
//     this.attachedSegment.y = qd.Math.rotateYPosition(this.y, this.r, this.segmentLength);
// };
//
// /**
//  * qd.Kinematics.Rod
//  *
//  * Represents a rod with two points (its Tip and End) separated by a length.
//  *
//  * The rod's tip and end are {qd.Body} objects, so you can
//  * interact with the rod by manipulating them.
//  *
//  * IMPORTANT: Never apply {qd.Physics.prototype.update} function on either of the rod's points.
//  * Instead use {@code qd.Kinematics.Rod.prototype.update} so that
//  * the length between its two points is maintained.
//  *
//  * @param {Number} tipX
//  * @param {Number} tipY
//  * @param {Number} endX
//  * @param {Number} endY
//  * @constructor
//  */
// qd.Kinematics.Rod = function (tipX, tipY, endX, endY) {
//     this.rodLength = qd.Math.distance(tipX, tipY, endX, endY);
//
//     this._tip = new qd.Body(tipX, tipY);
//     this._tip.m = 1;
//     this._tip.boundingBox = new qd.BoundingBox(this._tip, 0, 0);
//
//     this._end = new qd.Body(endX, endY);
//     this._end.m = 1;
//     this._end.boundingBox = new qd.BoundingBox(this._end, 0, 0);
// };
//
// /**
//  * Update the motion of this rod.
//  *
//  * @param {qd.Physics} physics
//  */
// qd.Kinematics.Rod.prototype.update = function (physics) {
//     physics.update(this._tip);
//     physics.update(this._end);
//
//     if (this._end.dragging) {
//         this.dragSegment(this._tip, this._end.x, this._end.y);
//     } else if (this._tip.dragging) {
//         this.dragSegment(this._end, this._tip.x, this._tip.y);
//     } else {
//         this.dragSegment(this._tip, this._end.x, this._end.y);
//         this.dragSegment(this._end, this._tip.x, this._tip.y);
//     }
// };
//
// /**
//  * Move the tip of this rod to the target point (targetX, targetY}. This rod's
//  * end will drag behind its tip.
//  *
//  * @param {qd.Body} body
//  * @param {Number} targetX
//  * @param {Number} targetY
//  */
// qd.Kinematics.Rod.prototype.dragSegment = function (body, targetX, targetY) {
//     var dx, dy, angle, jointX, jointY, w, h;
//
//     dx = targetX - body.x;
//     dy = targetY - body.y;
//     angle = Math.atan2(dy, dx);
//
//     jointX = (body.x + Math.cos(angle) * this.rodLength);
//     jointY = (body.y + Math.sin(angle) * this.rodLength);
//
//     w = jointX - body.x;
//     h = jointY - body.y;
//     body.x = targetX - w;
//     body.y = targetY - h;
// };
//
// /**
//  * Get the tip of this rod.
//  *
//  * @return {qd.Body}
//  */
// qd.Kinematics.Rod.prototype.tip = function () {
//     return this._tip;
// };
//
// /**
//  * Get the end of this rod.
//  *
//  * @return {qd.Body}
//  */
// qd.Kinematics.Rod.prototype.end = function () {
//     return this._end;
// };
//
// /**
//  * Constructs a flexible rod with the given {@code numberJoints}.
//  * Each joint is represented by a {@code qd.Spring.CoiledSpring}
//  * with the given {@code springConstant}.
//  *
//  * @param {qd.Point2D} tipPoint
//  * @param {qd.Point2D} endPoint
//  * @param numberInternalJoints internal joints between the tip and the end
//  * @param springConstant of each joint
//  * @constructor
//  */
// qd.Kinematics.FlexibleRod = function (tipPoint, endPoint, numberInternalJoints, springConstant) {
//     var numberJoints = numberInternalJoints + 2, // includes tip and end joints
//         angle,
//         i,
//         lambda,
//         dLambda,
//         jointPoint,
//         joint;
//
//     this.rodLength = tipPoint.distance(endPoint);
//
//     // Build the joints
//     this.joints = [];
//     angle = qd.Math.angleOf(tipPoint.x, tipPoint.y, endPoint.x, endPoint.y);
//
//     dLambda = 1 / (numberJoints - 1);
//
//     for (i = 0; i < numberJoints; i += 1) {
//         joint = new qd.Spring.CoiledSpring({
//             rotation: angle,
//             equilibriumAngle: angle,
//             springConstant: springConstant
//         });
//
//         lambda = i * dLambda;
//         jointPoint = qd.Math.lerpPoint2D(tipPoint, endPoint, lambda);
//         joint.x = jointPoint.x;
//         joint.y = jointPoint.y;
//         joint.m = 1;
//         joint.boundingBox = new qd.BoundingBox(joint, 10, 10);
//
//         this.joints.push(joint);
//     }
//
//     this.tip = this.joints[0];
//     this.end = this.joints[numberJoints - 1];
// };
//
// /**
//  * Update the motion of this rod.
//  *
//  * @param {qd.Physics} physics
//  */
// qd.Kinematics.FlexibleRod.prototype.update = function (physics) {
//     var joint0,
//         joint1,
//         i,
//         segmentLength = this.rodLength / (this.joints.length - 1);
//
//     for (i = 0; i < this.joints.length - 1; i += 1) {
//         joint0 = this.joints[i];
//         joint1 = this.joints[i + 1];
//
//         this.dragSegment(joint0, joint1.x, joint1.y, segmentLength);
//         //this.dragSegment(joint1, joint0.x, joint0.y, segmentLength);
//     }
// };
//
// /**
//  * Move the tip of this rod to the target point (targetX, targetY}. This rod's
//  * end will drag behind its tip.
//  *
//  * @param {qd.Body} body
//  * @param {Number} targetX
//  * @param {Number} targetY
//  */
// qd.Kinematics.FlexibleRod.prototype.dragSegment = function (body, targetX, targetY, segmentLength) {
//     var dx, dy, angle, jointX, jointY, w, h;
//
//     dx = targetX - body.x;
//     dy = targetY - body.y;
//     angle = Math.atan2(dy, dx);
//
//     jointX = (body.x + Math.cos(angle) * segmentLength);
//     jointY = (body.y + Math.sin(angle) * segmentLength);
//
//     w = jointX - body.x;
//     h = jointY - body.y;
//     body.x = targetX - w;
//     body.y = targetY - h;
// };
//
// qd.Kinematics.Joint = qd.extendClass(
//     qd.Body,
//     "qd.Kinematics.Joint",
//     function (minR, maxR) {
//         this.minR = minR;
//         this.maxR = maxR;
//     }
// );
/**
 * qd.Spring
 *
 * @constructor
 */
qd.Spring = function (endPoint0, endPoint1, springLength, springConstant) {
    this.endPoint0 = endPoint0 || new qd.Body();
    this.endPoint1 = endPoint1 || new qd.Body();
    this.springLength = springLength || 0;
    this.springConstant = springConstant || 0.85;
};

/**
 * Update physics of body which has a spring attached to target point
 * {@code (targetX, targetY)} with the specified {@code springConstant}.
 *
 * @param {qd.Body} body
 * @param {Number} targetX
 * @param {Number} targetY
 * @param {Number} springConstant
 */
qd.Spring.updateSpringToTarget = function (body, targetX, targetY, springConstant) {
    body.vx = body.vx + (targetX - body.x) * springConstant;
    body.vy = body.vy + (targetY - body.y) * springConstant;
};

/**
 * Simulates a fixed spring. A fixed spring is a spring that has a
 * fixed length that it tries to maintain.
 */
qd.Spring.prototype.update = function () {
    var dx = this.endPoint1.x - this.endPoint0.x,
        dy = this.endPoint1.y - this.endPoint0.y,
        angle = Math.atan2(dy, dx),
        targetX = this.endPoint0.x + Math.cos(angle) * this.springLength,
        targetY = this.endPoint0.y + Math.sin(angle) * this.springLength;
    this.endPoint1.vx = this.endPoint1.vx + (targetX - this.endPoint1.x) * this.springConstant;
    this.endPoint1.vy = this.endPoint1.vy + (targetY - this.endPoint1.y) * this.springConstant;
};

(function (qd) {

    /**
     * qd.Camera
     *
     * @constructor
     */
    qd.Camera = function (view) {

        /* Protected Methods */

        this.update = function () {
            // Update Camera canvas points
            this.canvasPos[0] = this.worldPos[0] * this.view.inverseScale();
            this.canvasPos[1] = this.worldPos[1] * this.view.inverseScale();

            // Notify observers that camera has been updated
            qd.debug("Firing Camera Pan or Zoom Event");
            this.panOrZoomTrigger.fire();
        };

        this.init(view);
    };

    /* Public Methods */

    qd.Camera.prototype.init = function (view) {
        this.view = view;
        this.worldPos = qd.Point2D.create(0, 0);
        this.canvasPos = qd.Point2D.create(0, 0);
        this.zoomStep = 0.1;
        this.panOrZoomTrigger = new qd.EventTrigger();
        return this;
    };

    qd.Camera.prototype.destroy = function () {
        this.panOrZoomTrigger.destroy();
        this.zoomStep = undefined;
        this.canvasPos = undefined;
        this.worldPos = undefined;
        this.view = undefined;
    };

    qd.Camera.prototype.worldXPos = function () {
        return this.worldPos[0];
    };

    qd.Camera.prototype.worldYPos = function () {
        return this.worldPos[1];
    };

    qd.Camera.prototype.canvasXPos = function () {
        return this.canvasPos[0];
    };

    qd.Camera.prototype.canvasYPos = function () {
        return this.canvasPos[1];
    };

    qd.Camera.prototype.position = function (x, y) {
        qd.Point2D.position(this.worldPos, x, y);
        this.update();

        return this;
    };

    // TODO: Rename to pan?
    qd.Camera.prototype.translate = function (dx, dy) {
        var x = this.worldPos[0] + dx,
            y = this.worldPos[1] + dy;

        return this.position(x, y);
    };

    qd.Camera.prototype.zoomLevel = function (zoomLevel) {
        if (zoomLevel) {
            this.view.scale(zoomLevel);
            this.update();
            return this;
        }

        return this.view.scale();
    };

    qd.Camera.prototype.zoomLevels = function (zoomLevels) {
        if (zoomLevels) {
            this.view.maxScale(zoomLevels);
            return this;
        }

        return this.view.maxScale();
    };

    qd.Camera.prototype.zoomOut = function (target) {
        var zoomDelta = this.view.scale() + this.zoomStep;

        if (zoomDelta <= this.view.maxScale()) {
            var centre = target || this.view.centre();
            this.translate(this.view.scale()*centre[0], this.view.scale()*centre[1]);
            this.view.scale(zoomDelta);
            this.translate(-this.view.scale()*centre[0], -this.view.scale()*centre[1]);
            this.update();
        }

        return this;
    };

    qd.Camera.prototype.zoomIn = function (target) {
        var zoomDelta = this.view.scale() - this.zoomStep;

        if (zoomDelta >= this.view.minScale()) {
            var centre = target || this.view.centre();
            this.translate(this.view.scale()*centre[0], this.view.scale()*centre[1]);
            this.view.scale(zoomDelta);
            this.translate(-this.view.scale()*centre[0], -this.view.scale()*centre[1]);
            this.update();
        }

        return this;
    };

    qd.Camera.prototype.onPanOrZoom = function (namespace, handler, context) {
        this.panOrZoomTrigger.bind(namespace, handler, context);
        return this;
    };

    qd.Camera.prototype.offPanOrZoom = function (namespace, handler, context) {
        this.panOrZoomTrigger.unbind(namespace, handler, context);
        return this;
    };

    qd.Camera.prototype.reset = function () {
        this.init(this.view);
    };

}(qd));
(function (qd) {

    /**
     * Canvas is a wrapper for HTMLCanvasElement and its CanvasRenderingContext2D.
     *
     * It provides proxy functions for most rendering operations.
     *
     * @param {Object} settings
     */
    var Canvas = function (settings) {
        this.init(settings);
    };

    /** Private Methods */

    Canvas.prototype._parseCanvasElement = function (canvas) {
        var canvasElem = null;

        if (typeof canvas === "string") {
            canvasElem = qd.getElementById(canvas);
        } else if (canvas instanceof HTMLCanvasElement) {
            canvasElem = canvas;
        } else {
            throw new Error("Failed to create the Canvas because cannot find the HTMLCanvasElement.")
        }

        return canvasElem;
    };

    Canvas.prototype._getContext2D = function (canvasElem) {
        var ctx = canvasElem.getContext("2d");

        if (qd.isUndefinedOrNull(ctx)) {
            throw new Error("2D Canvas not supported.")
        }

        return ctx;
    };

    /** Public Methods */

    /**
     * Default initialisation function.
     *
     * @param {Object} settings
     */
    Canvas.prototype.init = function (settings) {
        this._settings = qd.mergeProperties({
            canvas: "canvas"
        }, settings || {});
        this._canvas = this._parseCanvasElement(this._settings.canvas);
        this._ctx = this._getContext2D(this._canvas);
        this._styler = qd.Styler.defaultStyler();
        this._view = new qd.View(this._canvas.width, this._canvas.height);

        if (qd.isDefinedAndNotNull(this._settings.width)) {
            this._canvas.setAttribute("width", this._settings.width);
        }
        if (qd.isDefinedAndNotNull(this._settings.height)) {
            this._canvas.setAttribute("height", this._settings.height);
        }

        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = (window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                function (callback) {
                    return window.setTimeout(callback, 1000 / 60);
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

    Canvas.prototype.view = function () {
        this._view.canvas(this);
        return this._view;
    };

    /**
     * Get the CanvasRenderingContext2D.
     *
     * @return {CanvasRenderingContext2D} the CanvasRenderingContext2D
     */
    Canvas.prototype.context = function () {
        return this._ctx;
    };

    /**
     * Clear all the graphics from the canvas area.
     *
     * {@param backgroundColour?}
     * @return {Canvas}
     */
    Canvas.prototype.clear = function (backgroundColour) {
        if (backgroundColour) {
            this._ctx.save();
            this._ctx.fillStyle = backgroundColour;
            this._ctx.rect(0, 0, this._canvas.width, this._canvas.height);
            this._ctx.fill();
            this._ctx.restore();
        } else {
            this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        }
        return this;
    };

    /**
     * Clear graphics in a rectangle.
     *
     * @param {Number} x
     * @param {Number} y
     * @param {Number} width
     * @param {Number} height
     * @return {Canvas}
     */
    Canvas.prototype.clearRectangle = function (x, y, width, height) {
        this._ctx.clearRect(x, y, width, height);
        return this;
    };

    /**
     * Get the x position of canvas area's centre point.
     *
     * @return {Number} centre x within the canvas width
     */
    Canvas.prototype.centreX = function () {
        return Math.floor(this._canvas.width / 2);
    };

    /**
     * Get the y position of canvas area's centre point.
     *
     * @return {Number} centre y within the canvas height
     */
    Canvas.prototype.centreY = function () {
        return Math.floor(this._canvas.height / 2);
    };

    /**
     * Get the canvas area's centre point.
     *
     * @return {qd.Point2D}
     */
    Canvas.prototype.centre = function () {
        return qd.Point2D.create(this.centreX(), this.centreY());
    };

    /**
     * Get the x position of a random point in the canvas area.
     *
     * @return {Number} random x within the canvas width
     */
    Canvas.prototype.randomX = function () {
        return Math.floor(Math.random() * this._canvas.width);
    };

    /**
     * Get the y position of a random point in the canvas area.
     *
     * @return {Number} random y within the canvas height
     */
    Canvas.prototype.randomY = function () {
        return Math.floor(Math.random() * this._canvas.height);
    };

    /**
     * Get a random point in the canvas.
     *
     * @return {qd.Point2D} random point within the canvas
     */
    Canvas.prototype.randomPoint = function () {
        return qd.Point2D.create(this.randomX(), this.randomY());
    };

    Canvas.prototype.resize = function (width, height) {
        this._canvas.setAttribute("width", width);
        this._canvas.setAttribute("height", height);
        return this;
    };

    /**
     * Get the canvas width.
     *
     * @return {Number}
     */
    Canvas.prototype.width = function () {
        return this._canvas.width;
    };

    /**
     * Get the canvas height.
     *
     * @return {Number}
     */
    Canvas.prototype.height = function () {
        return this._canvas.height;
    };

    /**
     * Begin tracing paths to the canvas.
     *
     * @return {Canvas}
     */
    Canvas.prototype.path = function () {
        this._ctx.beginPath();
        return this;
    };

    /**
     * Start tracing a path at the {@code point}.
     *
     * @param {qd.Point2D} point
     * @return {Canvas}
     */
    Canvas.prototype.moveTo = function (point) {
        this._ctx.moveTo(point[0], point[1]);
        return this;
    };

    /**
     * Trace a line path to {@code point}.
     *
     * @param {qd.Point2D} point
     * @return {Canvas}
     */
    Canvas.prototype.lineTo = function (point) {
        this._ctx.lineTo(point[0], point[1]);
        return this;
    };

    /**
     * Trace a line path from coordinates {@code (x0, y0)} to {@code (x1, y1)}.
     *
     * @param {Number} x0
     * @param {Number} y0
     * @param {Number} x1
     * @param {Number} y1
     * @return {Canvas}
     */
    Canvas.prototype.traceLine = function (x0, y0, x1, y1) {
        var ctx = this._ctx;
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        return this;
    };

    Canvas.prototype.traceTriangle = function (v0, v1, v2) {
        var ctx = this._ctx;
        ctx.moveTo(v0[0], v0[1]);
        ctx.lineTo(v1[0], v1[1]);
        ctx.lineTo(v2[0], v2[1]);
        ctx.lineTo(v0[0], v0[1]);
        ctx.closePath();
        return this;
    };

    /**
     * Trace a rectangle path.
     *
     * @param {Number} x
     * @param {Number} y
     * @param {Number} width
     * @param {Number} height
     * @return {Canvas}
     */
    Canvas.prototype.traceRectangle = function (x, y, width, height) {
        this._ctx.rect(x, y, width, height);
        return this;
    };

    Canvas.prototype.traceRectangle2 = function (x0, y0, x1, y1) {
        this._ctx.rect(x0, y0, (x1 - x0), (y1 - y0));
        return this;
    };

    /**
     * Trace a circular arc path.
     *
     * @param {Number} x
     * @param {Number} y
     * @param {Number} radius
     * @param {Number} startAngle
     * @param {Number} endAngle
     * @param {Boolean} anticlockwise
     * @return {Canvas}
     */
    Canvas.prototype.traceCircularArc = function (x, y, radius, startAngle, endAngle, anticlockwise) {
        this._ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
        return this;
    };

    /**
     * Draw a circle positioned at (x, y) with the specified radius.
     *
     * @param {Number} x
     * @param {Number} y
     * @param {Number} radius
     * @return {Canvas}
     */
    Canvas.prototype.traceCircle = function (x, y, radius) {
        this._ctx.arc(x, y, radius, 0, qd.math.TAU, true);
        return this;
    };

    /**
     * Trace an ellipse.
     *
     * @param {Number} x
     * @param {Number} y
     * @param {Number} radiusX
     * @param {Number} radiusY
     * @param {Number} rotation
     * @param {Number} startAngle
     * @param {Number} endAngle
     * @param {Boolean} anticlockwise
     * @return {Canvas}
     */
    Canvas.prototype.traceEllipse = function (x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
        this._ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
        return this;
    };

    /**
     * Trace an ellipse path using four sets of bezier curves, one for each quadrant of the unit circle.
     *
     * {@code points} must contain exactly 13 points:
     *   - The first point is the starting point
     *   - Four sets of three points, each of which describe a bezier curve
     *
     *  Each set of three points contain:
     *    - Two control points
     *    - A terminal point
     *
     * @param {Array} points
     * @return {Canvas}
     */
    Canvas.prototype.traceEllipseAsBezierCurves = function (points) {
        // Ellipse code taken from: http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas
        var ctx = this._ctx,
            p0,

            q1cp1,
            q1cp2,
            q1p,

            q2cp1,
            q2cp2,
            q2p,

            q3cp1,
            q3cp2,
            q3p,

            q4cp1,
            q4cp2,
            q4p;

        if (points.length !== 13) {
            return this;
        }

        p0 = points[0];

        q1cp1 = points[1];
        q1cp2 = points[2];
        q1p = points[3];

        q2cp1 = points[4];
        q2cp2 = points[5];
        q2p = points[6];

        q3cp1 = points[7];
        q3cp2 = points[8];
        q3p = points[9];

        q4cp1 = points[10];
        q4cp2 = points[11];
        q4p = points[12];

        ctx.moveTo(p0[0], p0[1]);
        ctx.bezierCurveTo(q1cp1[0], q1cp1[1], q1cp2[0], q1cp2[1], q1p[0], q1p[1]);
        ctx.bezierCurveTo(q2cp1[0], q2cp1[1], q2cp2[0], q2cp2[1], q2p[0], q2p[1]);
        ctx.bezierCurveTo(q3cp1[0], q3cp1[1], q3cp2[0], q3cp2[1], q3p[0], q3p[1]);
        ctx.bezierCurveTo(q4cp1[0], q4cp1[1], q4cp2[0], q4cp2[1], q4p[0], q4p[1]);

        return this;
    };

    /**
     * Trace a polyline.
     *
     * @param {Array} points
     * @return {Canvas}
     */
    Canvas.prototype.tracePolyline = function (points) {
        var ctx = this._ctx,
            i,
            point = points[0];

        ctx.moveTo(point[0], point[1]);

        for (i = 1; i < points.length; i += 1) {
            point = points[i];
            ctx.lineTo(point[0], point[1]);
        }

        return this;
    };

    /**
     * Trace a polygon.
     *
     * @param {Array} points
     * @return {Canvas}
     */
    Canvas.prototype.tracePolygon = function (points) {
        var ctx = this._ctx,
            i,
            point = points[0];

        ctx.moveTo(point[0], point[1]);

        for (i = 1; i < points.length; i += 1) {
            point = points[i];
            ctx.lineTo(point[0], point[1]);
        }

        ctx.closePath();

        return this;
    };

    /**
     * Trace a quadratic curve.
     *
     * @param {Number} x0
     * @param {Number} y0
     * @param {Number} cpx
     * @param {Number} cpy
     * @param {Number} x1
     * @param {Number} y1
     * @return {Canvas}
     */
    Canvas.prototype.traceQuadratic = function (x0, y0, cpx, cpy, x1, y1) {
        var ctx = this._ctx;

        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(cpx, cpy, x1, y1);
        return this;
    };

    /**
     * Trace open quadratic curve using points.
     *
     * @param {Array} points must have a length of at least four points
     * @return {Canvas}
     */
    Canvas.prototype.traceQuadraticCurve = function (points) {
        var ctx = this._ctx,
            point,
            i,
            nextPoint,
            ctrlPointX,
            ctrlPointY;

        if (points.length < 3) {
            return this;
        }

        //move to the first point
        point = points[0];
        ctx.moveTo(point[0], point[1]);

        //curve through the rest, stopping at each midpoint
        for (i = 1; i < points.length - 2; i += 1) {
            point = points[i];
            nextPoint = points[i + 1];

            ctrlPointX = (point[0] + nextPoint[0]) * 0.5;
            ctrlPointY = (point[1] + nextPoint[1]) * 0.5;
            ctx.quadraticCurveTo(point[0], point[1], ctrlPointX, ctrlPointY);
        }

        //curve through the last two points
        point = points[i];
        nextPoint = points[i + 1];
        ctx.quadraticCurveTo(point[0], point[1], nextPoint[0], nextPoint[1]);

        return this;
    };

    /**
     * Trace a closed quadratic curve path using points.
     *
     * @param {Array} points
     * @return {Canvas}
     */
    Canvas.prototype.traceClosedQuadraticCurve = function (points) {
        var ctx = this._ctx,
            ctrlPoint1,
            ctrlPoint,
            i,
            numPoints,
            point;

        if (points.length < 3) {
            return this;
        }

        ctrlPoint1 = qd.Point2D.create(0, 0);
        ctrlPoint = qd.Point2D.create(0, 0);
        numPoints = points.length;

        //find the first midpoint and move to it
        ctrlPoint1[0] = (points[0][0] + points[numPoints - 1][0]) / 2;
        ctrlPoint1[1] = (points[0][1] + points[numPoints - 1][1]) / 2;
        ctx.moveTo(ctrlPoint1[0], ctrlPoint1[1]);

        //curve through the rest, stopping at each midpoint
        for (i = 0; i < numPoints - 1; i += 1) {
            point = points[i];
            ctrlPoint[0] = (point[0] + points[i + 1][0]) / 2;
            ctrlPoint[1] = (point[1] + points[i + 1][1]) / 2;
            ctx.quadraticCurveTo(point[0], point[1], ctrlPoint[0], ctrlPoint[1]);
        }
        //curve through the last point, back to the first midpoint
        point = points[i];
        ctx.quadraticCurveTo(point[0], point[1], ctrlPoint1[0], ctrlPoint1[1]);

        return this;
    };

    /**
     * Trace a bezier curve.
     *
     * @param {Number} x0
     * @param {Number} y0
     * @param {Number} cp1x
     * @param {Number} cp1y
     * @param {Number} cp2x
     * @param {Number} cp2y
     * @param {Number} x1
     * @param {Number} y1
     * @return {Canvas}
     */
    Canvas.traceBezier = function (x0, y0, cp1x, cp1y, cp2x, cp2y, x1, y1) {
        var ctx = this._ctx;

        ctx.moveTo(x0, y0);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x1, y1);
        return this;
    };

    /**
     * Trace bezier curve using points.
     *
     * @param {Array} points
     * @return {Canvas}
     */
    Canvas.prototype.traceBezierCurve = function (points) {
        var ctx = this._ctx;

        // TODO

        //ctx.moveTo(x0, y0);
        //ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x1, y1);
        return this;
    };

    /**
     * Trace a closed bezier curve using points.
     * @param {Array} points
     * @return {Canvas}
     */
    Canvas.prototype.traceClosedBezierCurve = function (points) {
        // TODO
    };

    /**
     * Not thread safe.
     *
     * @param origin
     * @param direction
     * @param style
     * @return {*}
     */
    Canvas.prototype.traceArrow = function (origin, direction, style) {
        var model = Canvas.prototype.arrow.model,

            arrowWidth = (style) ? style.arrowWidth : STYLES.ARROW_WIDTH.DEFAULT,
            arrowHalfWidth = arrowWidth * 0.5,

            tip = qd.Point2D.add(model.tip, origin, direction),
            end = origin,
            base = qd.math.lerpPoint2DByDistance(model.base, tip, end, arrowWidth),
            right = qd.math.perpendicularByDistance(model.right, end, base, -arrowHalfWidth),
            left = qd.math.perpendicularByDistance(model.left, end, base, arrowHalfWidth),

            tipX = tip[0],
            tipY = tip[1];

        this.traceLine(end[0], end[1], tip[0], tip[1]);
        this.traceLine(tipX, tipY, right[0], right[1]);
        this.traceLine(tipX, tipY, left[0], left[1]);

        return this;
    };

    Canvas.prototype.traceArrow.model = {
        tip: qd.Point2D.create(0, 0),
        base: qd.Point2D.create(0, 0),
        right: qd.Point2D.create(0, 0),
        left: qd.Point2D.create(0, 0)
    };

    /**
     * Trace an infinite grid starting at any arbitrary point (x, y).
     *
     * @param {Number} cellSize
     * @param {Number} x
     * @param {Number} y
     * @return {Canvas}
     */
    Canvas.prototype.grid = function (cellWidth, cellHeight, x, y) {
        var col,
            row,
            cols,
            rows,
            x0,
            y0,
            x1,
            y1,
            shiftX,
            shiftY,
            marginWidth,
            marginHeight,
            canvasWidth,
            canvasHeight,
            margins;

        margins = 1;

        shiftX = x % cellWidth;
        shiftY = y % cellHeight;

        marginWidth = margins * cellWidth;
        marginHeight = margins * cellHeight;

        canvasWidth = this.width();
        canvasHeight = this.height();

        cols = Math.ceil(canvasWidth / cellWidth);
        rows = Math.ceil(canvasHeight / cellHeight);

        x0 = -marginWidth - shiftX;
        x1 = canvasWidth + marginWidth - shiftX;

        for (row = -margins; row < rows + margins; row += 1)  {
            y0 = y1 = row * cellHeight - shiftY;

            this.traceLine(x0, y0, x1, y1);
        }

        y0 = -marginHeight - shiftY;
        y1 = canvasHeight + marginHeight - shiftY;

        for (col = -margins; col < cols + margins; col += 1)  {
            x0 = x1 = col * cellWidth  - shiftX;

            this.traceLine(x0, y0, x1, y1);
        }

        return this;
    };

    Canvas.prototype.traceLinearGradient = function (x1, y1, x2, y2) {
        // TODO: return Gradient
        return this._ctx.createLinearGradient(x1, y1, x2, y2);
    };

    Canvas.prototype.traceRadialGradient = function (x1, y1, r1, x2, y2, r2) {
        // TODO: return Gradient
        return this._ctx.createRadialGradient(x1, y1, r1, x2, y2, r2);
    };

    Canvas.prototype.tracePattern = function (image, type) {
        // TODO: return Pattern
        return this._ctx.createPattern(image, type);
    };

    Canvas.prototype.style = function (styleName, styleValue) {
        this._styler.style(styleName, styleValue);
        return this;
    };

    Canvas.prototype.styles = function (styles) {
        this._styler.styles(styles);
        return this;
    };

    Canvas.prototype.clearStyles = function () {
        this._styler.clear();
        return this;
    };

    Canvas.prototype.resetDefaultStyles = function () {
        this._styler.resetDefaults();
        return this;
    };

    Canvas.prototype.draw = function (styles) {
        var ctx = this._ctx;
        if (styles != null) {
            // apply one-off custom styles
            var customStyler = new qd.Styler(styles);
            customStyler.apply(ctx);
        } else {
            // apply current styles
            this._styler.apply(ctx);
        }
        return this;
    };

    Canvas.prototype.image = function (image, x, y, width, height) {
        this._ctx.drawImage(image, x, y, width, height);
    };

    Canvas.prototype.text = function (text, x, y, styles, maxWidth) {
        // TODO: Complete
        var ctx = this._ctx,
            stroke = false,
            fill = false,
            fontSize = null,
            fontFamily = null;

        ctx.save();

        qd.eachProperty(styles, function (style, value) {
            switch (style) {
                case "stroke":
                case "strokeColour":
                    if (value === "" || value === "transparent") {
                        stroke = false;
                    } else {
                        ctx.strokeStyle = value;
                        stroke = true;
                    }
                    break;
                case "fill":
                case "fillColour":
                    if (value === "" || value === "transparent") {
                        fill = false;
                    } else {
                        ctx.fillStyle = value;
                        fill = true;
                    }
                    break;
                case "fontSize":
                    fontSize = value;
                    break;
                case "fontFamily":
                    fontFamily = value;
                    break;

                default:
                    ctx[style] = value;
            }
        });

        ctx.font = qd.defaultValue(fontSize, STYLES.FONT_SIZE.DEFAULT)
            + " "
            + qd.defaultValue(fontFamily, STYLES.FONT_FAMILY.DEFAULT);

        if (fill) {
            ctx.fillText(text, x, y, maxWidth);
        }

        if (stroke) {
            ctx.strokeText(text, x, y, maxWidth);
        }

        ctx.restore();

        return this;
    };

    Canvas.prototype.measureText = function (text) {
        return this._ctx.measureText(text);
    };

    Canvas.prototype.toImage = function (mimeType) {
        return this._canvas.toDataURL(mimeType || "image/png");
    };

    Canvas.prototype.onFrame = function () {

    };

    Canvas.prototype.run = function () {
        var canvas = this;
        canvas._previousSeconds = Date.now();
        function frame() {
            canvas._frameRequest = window.requestAnimationFrame(frame);
            var currentSeconds = Date.now();
            var elapsedSeconds = (currentSeconds - canvas._previousSeconds);
            canvas._previousSeconds = currentSeconds;
            canvas.onFrame(elapsedSeconds);
        }
        frame();
    };

    qd.Canvas = Canvas;

}(qd));
(function (qd) {

    /**
     * qd.Colour.
     *
     */
    qd.Colour = function () {

    };

    // httP://WWW.W3.ORG/TR/CSS3-COLOR/#RGBA-COLOR
    qd.Colour.ALICE_BLUE = "#F0F8FF";
    qd.Colour.ANTIQUE_WHITE = "#FAEBD7";
    qd.Colour.AQUA = "#00FFFF";
    qd.Colour.AQUAMARINE = "#7FFFD4";
    qd.Colour.AZURE = "#F0FFFF";
    qd.Colour.BEIGE = "#F5F5DC";
    qd.Colour.BISQUE = "#FFE4C4";
    qd.Colour.BLACK = "#000000";
    qd.Colour.BLANCHED_ALMOND = "#FFEBCD";
    qd.Colour.BLUE = "#0000FF";
    qd.Colour.BLUE_VIOLET = "#8A2BE2";
    qd.Colour.BROWN = "#A52A2A";
    qd.Colour.BURLY_WOOD = "#DEB887";
    qd.Colour.CADET_BLUE = "#5F9EA0";
    qd.Colour.CHARTREUSE = "#7FFF00";
    qd.Colour.CHOCOLATE = "#D2691E";
    qd.Colour.CORAL = "#FF7F50";
    qd.Colour.CORNFLOWER_BLUE = "#6495ED";
    qd.Colour.CORNSILK = "#FFF8DC";
    qd.Colour.CRIMSON = "#DC143C";
    qd.Colour.CYAN = "#00FFFF";
    qd.Colour.DARK_BLUE = "#00008B";
    qd.Colour.DARK_CYAN = "#008B8B";
    qd.Colour.DARK_GOLDEN_RED = "#B8860B";
    qd.Colour.DARK_GRAY = "#A9A9A9";
    qd.Colour.DARK_GREEN = "#006400";
    qd.Colour.DARKKHAKI = "#BDB76B";
    qd.Colour.DARKMAGENTA = "#8B008B";
    qd.Colour.DARK_OLIVE_GREEN = "#556B2F";
    qd.Colour.DARK_ORANGE = "#FF8C00";
    qd.Colour.DARK_ORCHID = "#9932CC";
    qd.Colour.DARK_RED = "#8B0000";
    qd.Colour.DARK_SALMON = "#E9967A";
    qd.Colour.DARK_SEA_GREEN = "#8FBC8F";
    qd.Colour.DARK_SLATE_BLUE = "#483D8B";
    qd.Colour.DARK_SLATE_GRAY = "#2F4F4F";
    qd.Colour.DARK_TURQUOISE = "#00CED1";
    qd.Colour.DARK_VIOLET = "#9400D3";
    qd.Colour.DEEP_PINK = "#FF1493";
    qd.Colour.DEEP_SKY_BLUE = "#00BFFF";
    qd.Colour.DIM_GRAY = "#696969";
    qd.Colour.DODGER_BLUE = "#1E90FF";
    qd.Colour.FIREBRICK = "#B22222";
    qd.Colour.FLORAL_WHITE = "#FFFAF0";
    qd.Colour.FOREST_GREEN = "#228B22";
    qd.Colour.FUCHSIA = "#FF00FF";
    qd.Colour.GAINSBORO = "#DCDCDC";
    qd.Colour.GHOSTWHITE = "#F8F8FF";
    qd.Colour.GOLD = "#FFD700";
    qd.Colour.GOLDEN_RED = "#DAA520";
    qd.Colour.GRAY = "#808080";
    qd.Colour.GREEN = "#008000";
    qd.Colour.GREEN_YELLOW = "#ADFF2F";
    qd.Colour.HONEYDEW = "#F0FFF0";
    qd.Colour.HOT_PINK = "#FF69B4";
    qd.Colour.INDIAN_RED = "#CD5C5C";
    qd.Colour.INDIGO = "#4B0082";
    qd.Colour.IVORY = "#FFFFF0";
    qd.Colour.KHAKI = "#F0E68C";
    qd.Colour.LAVENDER = "#E6E6FA";
    qd.Colour.LAVENDER_BLUSH = "#FFF0F5";
    qd.Colour.LAWN_GREEN = "#7CFC00";
    qd.Colour.LEMON_CHIFFON = "#FFFACD";
    qd.Colour.LIGHT_BLUE = "#ADD8E6";
    qd.Colour.LIGHT_CORAL = "#F08080";
    qd.Colour.LIGHT_CYAN = "#E0FFFF";
    qd.Colour.LIGHT_GOLDEN_ROD_YELLOW = "#FAFAD2";
    qd.Colour.LIGHT_GREEN = "#90EE90";
    qd.Colour.LIGHTGREY = "#D3D3D3";
    qd.Colour.LIGHT_PINK = "#FFB6C1";
    qd.Colour.LIGHT_SALMON = "#FFA07A";
    qd.Colour.LIGHT_SEA_GREEN = "#20B2AA";
    qd.Colour.LIGHT_SKY_BLUE = "#87CEFA";
    qd.Colour.LIGHT_SLATE_GRAY = "#778899";
    qd.Colour.LIGHT_STEEL_BLUE = "#B0C4DE";
    qd.Colour.LIGHT_YELLOW = "#FFFFE0";
    qd.Colour.LIME = "#00FF00";
    qd.Colour.LIME_GREEN = "#32CD32";
    qd.Colour.LINEN = "#FAF0E6";
    qd.Colour.MAGENTA = "#FF00FF";
    qd.Colour.MAROON = "#800000";
    qd.Colour.MEDIUM_AUQAMARINE = "#66CDAA";
    qd.Colour.MEDIUM_BLUE = "#0000CD";
    qd.Colour.MEDIUM_ORCHID = "#BA55D3";
    qd.Colour.MEDIUM_PURPLE = "#9370D8";
    qd.Colour.MEDIUM_SEA_GREEN = "#3CB371";
    qd.Colour.MEDIUM_SLATE_BLUE = "#7B68EE";
    qd.Colour.MEDIUM_SPRING_GREEN = "#00FA9A";
    qd.Colour.MEDIUM_TURQUOISE = "#48D1CC";
    qd.Colour.MEDIUM_VIOLET_RED = "#C71585";
    qd.Colour.MIDNIGHT_BLUE = "#191970";
    qd.Colour.MINT_CREAM = "#F5FFFA";
    qd.Colour.MISTY_ROSE = "#FFE4E1";
    qd.Colour.MOCCASIN = "#FFE4B5";
    qd.Colour.NAVAJOW_HITE = "#FFDEAD";
    qd.Colour.NAVY = "#000080";
    qd.Colour.OLDLACE = "#FDF5E6";
    qd.Colour.OLIVE = "#808000";
    qd.Colour.OLIVED_RAB = "#688E23";
    qd.Colour.ORANGE = "#FFA500";
    qd.Colour.ORANGE_RED = "#FF4500";
    qd.Colour.ORCHID = "#DA70D6";
    qd.Colour.PALE_GOLDEN_ROD = "#EEE8AA";
    qd.Colour.PALE_GREEN = "#98FB98";
    qd.Colour.PALE_TURQUOISE = "#AFEEEE";
    qd.Colour.PALE_VIOLET_RED = "#D87093";
    qd.Colour.PAPAYA_WHIP = "#FFEFD5";
    qd.Colour.PEACH_PUFF = "#FFDAB9";
    qd.Colour.PERU = "#CD853F";
    qd.Colour.PINK = "#FFC0CB";
    qd.Colour.PLUM = "#DDA0DD";
    qd.Colour.POWDER_BLUE = "#B0E0E6";
    qd.Colour.PURPLE = "#800080";
    qd.Colour.RED = "#FF0000";
    qd.Colour.ROSY_BROWN = "#BC8F8F";
    qd.Colour.ROYAL_BLUE = "#4169E1";
    qd.Colour.SADDLE_BROWN = "#8B4513";
    qd.Colour.SALMON = "#FA8072";
    qd.Colour.SANDY_BROWN = "#F4A460";
    qd.Colour.SEA_GREEN = "#2E8B57";
    qd.Colour.SEASHELL = "#FFF5EE";
    qd.Colour.SIENNA = "#A0522D";
    qd.Colour.SILVER = "#C0C0C0";
    qd.Colour.SKY_BLUE = "#87CEEB";
    qd.Colour.SLATE_BLUE = "#6A5ACD";
    qd.Colour.SLATE_GRAY = "#708090";
    qd.Colour.SNOW = "#FFFAFA";
    qd.Colour.SPRING_GREEN = "#00FF7F";
    qd.Colour.STEEL_BLUE = "#4682B4";
    qd.Colour.TAN = "#D2B48C";
    qd.Colour.TEAL = "#008080";
    qd.Colour.THISTLE = "#D8BFD8";
    qd.Colour.TOMATO = "#FF6347";
    qd.Colour.TURQUOISE = "#40E0D0";
    qd.Colour.VIOLET = "#EE82EE";
    qd.Colour.WHEAT = "#F5DEB3";
    qd.Colour.WHITE = "#FFFFFF";
    qd.Colour.WHITE_SMOKE = "#F5F5F5";
    qd.Colour.YELLOW = "#FFFF00";
    qd.Colour.YELLOW_GREEN = "#9ACD32";

    /**
     * Returns a color in the format: "#RRGGBB", or as a hex number if specified.
     *
     * @param {Number|String} colour
     * @param {Boolean=} toNumber=false  Return colour as a hex number.
     * @return String|Number
     */
    qd.Colour.parseColour = function (colour, toNumber) {
        if (toNumber === true) {
            if (typeof colour === "number") {
                return (colour | 0); //chop off decimal
            }
            if (typeof colour === "string" && colour[0] === "#") {
                colour = colour.slice(1);
            }
            return window.parseInt(colour, 16);
        } else {
            if (typeof colour === "number") {
                colour = "#" + ("00000" + (colour | 0).toString(16)).substr(-6); //pad
            }
            return colour;
        }
    };

}(qd));
(function (qd) {
    qd.Gradient = function () {

    };
}(qd));
(function (qd) {

    qd.Grid = function (canvasId, camera) {
        this.init(canvasId, camera);
    };

    qd.Grid.MIN_SPACING = 12;
    qd.Grid.STYLES = { lineWidth: 0.125, stroke: qd.Q_BLUE };

    qd.Grid.prototype.init = function (canvasId, camera) {
        this.canvasId = canvasId;
        this.canvas = new qd.Canvas({ canvas: canvasId });

        this.camera = camera.onPanOrZoom("qd.Camera.onPanOrZoom:qd.Grid.draw", this.draw, this);

        this.minSpacing = qd.Grid.MIN_SPACING;
        this.maxSpacing = qd.Grid.MIN_SPACING * camera.zoomLevels();
        this.style = qd.cloneProperties(qd.Grid.STYLES);

        this.visible = true;
    };

    qd.Grid.prototype.destroy = function () {
        this.camera.offPanOrZoom("qd.Camera.onPanOrZoom:qd.Grid.draw", this.draw, this);

        this.visible = undefined;
        this.style = undefined;
        this.minSpacing = undefined;
        this.camera = undefined;
        this.canvas = undefined;
        this.canvasId = undefined;
    };

    qd.Grid.prototype.reset = function () {
        return this.init(this.canvasId, this.camera);
    };

    qd.Grid.prototype.draw = function () {
        var canvas = this.canvas,
            camera = this.camera,
            cellSize;

        if (this.visible) {
            canvas.clear();
            canvas.path();

            cellSize = this.maxSpacing * (1 / camera.zoomLevel());

            while (cellSize >= this.minSpacing) {
                canvas.grid(cellSize, cellSize, camera.canvasXPos(), camera.canvasYPos());
                cellSize = cellSize / 2;
            }

            canvas.draw(this.style);
        }
    };

    qd.Grid.prototype.enable = function () {
        this.visible = true;
        this.draw();
    };

    qd.Grid.prototype.disable = function () {
        this.visible = false;
        this.canvas.clear();
    };

    qd.Grid.prototype.toggle = function () {
        if (this.visible === true) {
            this.visible = false;
            this.canvas.clear();
        } else if (this.visible === false) {
            this.visible = true;
            this.draw();
        }
    };

}(qd));
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
(function (qd) {

    qd.Pattern = function () {

    };

}(qd));

(function (qd) {

    /**
     *
     * @param view
     * @param points
     * @constructor
     */
    qd.Shape = function (view, points) {
        this.init(view, points || []);
    };

    /* Private Methods */

    qd.Shape.prototype._updateAll = function () {
        this._updateCanvasCoordinates();
        this._updateEdgesAndNormals(); // TODO: Make a getter and do lazy evaulation (update when points modified)
        this._updateBounds();
    };

    qd.Shape.prototype._updateCanvasCoordinates = function () {
        qd.debug("Updating Shape Canvas Coordinates");

        this._view.canvasPoints(this._canvasPoints, this._worldPoints);
        this._canvasLineWidth = this._view.canvasLength(this._worldLineWidth);
    };

    qd.Shape.prototype._updateEdgesAndNormals = function () {
        qd.Vector2D.polygonEdgesAndNormals(this._worldEdges, this._worldNormals, this._worldPoints);
    };

    qd.Shape.prototype._updateBounds = function() {
        qd.debug("Updating Shape Bounds");

        this._bounds.resizeAsPolygon(this._worldPoints);
        // Cache centroid
        this._worldCentroid = this._bounds.centroid();
        this._canvasCentroid = this._view.canvasPoint(this._canvasCentroid, this._worldCentroid);
    };

    qd.Shape.prototype._winding = function () {
        return qd.math.polygonWindingSum(this._worldPoints);
    };

    /* Public Methods */

    qd.Shape.prototype.init = function (view, points) {
        this._view = view;

        this._worldPoints = qd.Point2D.cloneAll(points);
        this._canvasPoints = view.newCanvasPoints(points);

        this._worldLineWidth = qd.Styler.STYLES.LINE_WIDTH.DEFAULT;
        this._canvasLineWidth = this._view.canvasLength(this._worldLineWidth);

        this._worldEdges = qd.Vector2D.createArray(points.length, 0, 0);
        this._worldNormals = qd.Vector2D.createArray(points.length, 0, 0);

        this._updateEdgesAndNormals();

        this._bounds = new qd.BoundingBox().resizeAsPolygon(this._worldPoints);
        this._bounds._shape = this;

        this._worldCentroid = this._bounds.centroid();  // Cached
        this._canvasCentroid = this._view.canvasPoint(qd.Point2D.create(0, 0), this._worldCentroid);

        this._view.camera().onPanOrZoom(
            "qd.Camera.onPanOrZoom:qd.Shape._updateAll",
            this._updateAll, this);

        this._winding = this._winding();
    };

    qd.Shape.prototype.destroy = function () {
        this._worldCentroid = undefined;
        this._bounds.destroy();
        this._bounds = undefined;
        this._worldNormals = undefined;
        this._worldEdges = undefined;
        this._canvasLineWidth = undefined;
        this._worldLineWidth = undefined;
        this._canvasPoints = undefined;
        this._worldPoints = undefined;

        this._view.camera().offPanOrZoom(
            "qd.Camera.onPanOrZoom:qd.Shape._update",
            this._updateAll, this);
        this._view = undefined;
    };

    qd.Shape.prototype.clone = function () {
        var clone;

        qd.debug("Cloning " + this.toString());

        clone = new qd.Shape(this._view, this._worldPoints);
        clone._worldLineWidth = this._worldLineWidth;
        clone._canvasLineWidth = this._canvasLineWidth;

        return clone;
    };

    qd.Shape.prototype.bounds = function () {
        return this._bounds;
    };

    qd.Shape.prototype.points = function (points) {
        if (points) {
            this._worldPoints = qd.Point2D.cloneAll(points);
            this._winding = this._winding();
            this._updateAll();

            return this;
        }

        return qd.Point2D.cloneAll(this._worldPoints);
    };

    qd.Shape.prototype.point = function () {
        var args = new qd.Args(arguments),
            index,
            worldPoint;

        if (args.matches(qd.Tuple.TYPE)) {
            worldPoint = args.get(0);
            this.addPoint(worldPoint);
        } else if (args.matches(Number, qd.Tuple.TYPE)) {
            index = args.get(0);
            worldPoint = args.get(1);
            this.modifyPoint(index, worldPoint[0], worldPoint[1]);
        } else if (args.matches(Number)) {
            worldPoint = this._worldPoints[args.get(0)];
            return qd.Point2D.clone(worldPoint);
        }

        return this;
    };

    qd.Shape.prototype.addPoint = function (point) {
        var worldPoint = qd.Point2D.clone(point),
            canvasPoint = this._view.canvasPoint(qd.Point2D.create(0, 0), point);

        this._worldPoints.push(worldPoint);
        this._canvasPoints.push(canvasPoint);
        this._updateEdgesAndNormals();
        this._updateBounds();

        return this;
    };

    qd.Shape.prototype.modifyPoint = function (index, x, y) {
        var worldVertex = this._worldPoints[index],
            canvasVertex = this._canvasPoints[index];

        worldVertex[0] = x;
        worldVertex[1] = y;

        this._view.canvasPoint(canvasVertex, worldVertex);
        this._updateEdgesAndNormals();
        this._updateBounds();

        return this;
    };

    qd.Shape.prototype.translatePoint = function (index, dx, dy) {
        var worldVertex = this._worldPoints[index],
            canvasVertex = this._canvasPoints[index];

        worldVertex[0] += dx;
        worldVertex[1] += dy;

        this._view.canvasPoint(canvasVertex, worldVertex);
        this._updateEdgesAndNormals();
        this._updateBounds();

        return this;
    };

    qd.Shape.prototype.pointCount = function () {
        return this._worldPoints.length;
    };

    qd.Shape.prototype.firstPoint = function (point) {
        if (point) {
            this.modifyPoint(0, point[0], point[1]);
            return this;
        }

        return qd.Point2D.clone(this._worldPoints[0]);
    };

    qd.Shape.prototype.lastPoint = function (point) {
        if (point) {
            this.modifyPoint(this._worldPoints.length - 1, point[0], point[1]);
            return this;
        }

        return qd.Point2D.clone(this._worldPoints[this._worldPoints.length - 1]);
    };

    qd.Shape.prototype.worldLineWidth = function (worldLineWidth) {
        if (qd.isDefinedAndNotNull(worldLineWidth)) {
            this._worldLineWidth = worldLineWidth;
            this._canvasLineWidth = this._view.canvasLength(worldLineWidth);
            return this;
        }

        return this._worldLineWidth;
    };

    qd.Shape.prototype.bounds = function () {
        return this._bounds;
    };

    qd.Shape.prototype.position = function (x, y, origin) {
        var centroid = origin || this._worldCentroid,
            dx = x - centroid[0],
            dy = y - centroid[1];

        this.translate(dx, dy);
    };

    qd.Shape.prototype.translate = function (dx, dy) {
        qd.debug("Translating Shape")
        qd.Point2D.translateAll(this._worldPoints, dx, dy);
        this._updateAll();
    };

    qd.Shape.prototype.scale = function (sx, sy, origin) {
        qd.Point2D.scaleAll(this._worldPoints, sx, sy, origin || this._worldCentroid);
        this._updateAll();
    };

    qd.Shape.prototype.skew = function (kx, ky, origin) {
        qd.Point2D.skewAll(this._worldPoints, kx, ky, origin || this._worldCentroid);
        this._updateAll();
    };

    qd.Shape.prototype.rotate = function (dtheta, origin) {
        qd.Point2D.rotateAll(this._worldPoints, dtheta, origin || this._worldCentroid);
        this._bounds.rotate(dtheta);
        this._updateAll();
    };

    qd.Shape.prototype.centroid = function () {
        return this._worldCentroid;
    };

    qd.Shape.prototype.handles = function (handleSet) {
        var i,
            worldPoint,
            canvasPoint;

        for (i = 0; i < this._worldPoints.length; i += 1) {
            worldPoint = this._worldPoints[i];
            canvasPoint = this._canvasPoints[i];

            handleSet.handle(this, i, worldPoint, canvasPoint);
        }
    };

    qd.Shape.prototype.project = function (axis) {
        var points,
            min,
            max,
            i,
            projection,
            interval;

        points = this._worldPoints;

        min = qd.Vector2D.dot(axis, points[0]);
        max = min;

        for (i = 1; i < points.length; i += 1) {
            projection = qd.Vector2D.dot(axis, points[i]);

            if (projection < min) {
                min = projection;
            } else if (projection > max) {
                max = projection;
            }
        }

        interval = new qd.Interval(min, max);

        return interval;

    };

    qd.Shape.prototype.contactEdge = function (separationNormal) {
        var i,
            points,
            pointsCount,
            projection,
            maxProjection,
            supportIndex,
            supportPoint,
            nextIndex,
            previousIndex,
            nextPoint,
            nextEdge,
            previousPoint,
            previousEdge;

        // Get the shape's support point.
        // The support point is the point which has the largest projection
        // against the separation normal
        points = this._worldPoints;
        pointsCount = this._worldPoints.length;
        maxProjection = -Number.MAX_SAFE_INTEGER;
        supportIndex = 0;

        for (i = 0; i < pointsCount; i += 1) {
            projection = qd.Vector2D.dot(separationNormal, points[i]);

            if (projection > maxProjection) {
                maxProjection = projection;
                supportIndex = i;
            }
        }

        supportPoint = points[supportIndex];

        // Find the edge that is the most perpendicular to the separation normal
        // The edge that is most perpendicular to the normal will have a dot product closer to zero

        previousIndex = (supportIndex - 1 >= 0) ? supportIndex - 1 : pointsCount - 1;
        nextIndex = (supportIndex + 1 < pointsCount) ? supportIndex + 1 : 0;

        previousPoint = points[previousIndex];
        nextPoint = points[nextIndex];

        // Both edges must point towards the support point.
        // If one doesn’t that edge may always be used since its pointing in the negative direction
        // and the other is pointing in the positive direction.
        previousEdge = qd.Vector2D.subtract(qd.Vector2D.create(0, 0), supportPoint, previousPoint);
        nextEdge = qd.Vector2D.subtract(qd.Vector2D.create(0, 0), supportPoint, nextPoint);

        qd.Vector2D.mutateNormalise(nextEdge);
        qd.Vector2D.mutateNormalise(previousEdge);

        // Don't need to use absolute values here because both
        // next and previous vectors point towards the support point
        if (qd.Vector2D.dot(previousEdge, separationNormal)
            <= qd.Vector2D.dot(nextEdge, separationNormal)) {
            // Previous edge more perpendicular

            return {
                shape: this,
                pointA: previousPoint,
                pointB: supportPoint,
                supportPoint: supportPoint,
                direction: previousEdge
            };
        } else {
            // Next edge more perpendicular
            return {
                shape: this,
                pointA: supportPoint,
                pointB: nextPoint,
                supportPoint: supportPoint,
                direction: nextEdge
            };
        }
    };

    /**
     * The support point is the point in the shape that is farthest along the normal.
     *
     * @param {qd.Vector2D} normal
     * @return {qd.Point2D} the shape's support point
     */
    qd.Shape.prototype.supportPoint = function (normal) {
        var points = this._worldPoints,
            pointsCount = this._worldPoints.length,
            point,
            projection,
            maxProjection = -Number.MAX_SAFE_INTEGER,
            supportIndex,
            i;

        for (i = 0; i < pointsCount; i += 1) {
            point = points[i];
            projection = qd.Vector2D.dot(point, normal);

            if (projection > maxProjection) {
                maxProjection = projection;
                supportIndex = i;
            }
        }

        return points[supportIndex];
    };

    qd.Shape.prototype.clockwiseWinding = function () {
        return this._winding <= 0;
    };

    qd.Shape.prototype.antiClockwiseWinding = function () {
        return this._winding > 0;
    };

    qd.Shape.prototype.externalNormals = function () {
        return this._worldNormals;
    };

    qd.Shape.prototype.halve = function () {
        var i,
            worldPoints,
            canvasPoints,
            halvedWorldPoints,
            halvedCanvasPoints;

        if (this.pointCount() < 4) {
            return this;
        }

        worldPoints = this._worldPoints;
        canvasPoints = this._worldPoints;
        halvedWorldPoints = [];
        halvedCanvasPoints = [];

        for (i = 0; i < worldPoints.length; i += 2) {
            halvedWorldPoints.push(worldPoints[i]);
            halvedCanvasPoints.push(canvasPoints[i]);
        }

        this._worldPoints = halvedWorldPoints;
        this._canvasPoints = halvedCanvasPoints;

        return this;
    };

    qd.Shape.prototype.double = function () {
        var i,
            worldPoints,
            canvasPoints,
            doubleWorldPoints,
            doubleCanvasPoints,
            worldPoint,
            nextWorldPoint,
            lerpWorldPoint,
            canvasPoint,
            nextCanvasPoint,
            lerpCanvasPoint;

        if (this.pointCount() < 2) {
            return this;
        }

        worldPoints = this._worldPoints;
        canvasPoints = this._canvasPoints;
        doubleWorldPoints = [];
        doubleCanvasPoints = [];

        for (i = 0; i < worldPoints.length - 1; i += 1) {
            worldPoint = worldPoints[i];
            nextWorldPoint = worldPoints[i + 1];
            lerpWorldPoint = qd.math.lerpPoint2D(
                qd.Point2D.create(0, 0), worldPoint, nextWorldPoint, 0.5);

            doubleWorldPoints.push(worldPoint);
            doubleWorldPoints.push(lerpWorldPoint);
            doubleWorldPoints.push(nextWorldPoint);

            canvasPoint = canvasPoints[i];
            nextCanvasPoint = canvasPoints[i + 1];
            lerpCanvasPoint = qd.math.lerpPoint2D(
                qd.Point2D.create(0, 0), canvasPoint, nextCanvasPoint, 0.5);

            doubleCanvasPoints.push(canvasPoint);
            doubleCanvasPoints.push(lerpCanvasPoint);
            doubleCanvasPoints.push(nextCanvasPoint);
        }

        this._worldPoints = doubleWorldPoints;
        this._canvasPoints = doubleCanvasPoints;

        return this;
    };

    qd.Shape.prototype.toString = function () {
        return "Shape";
    };

}(qd));
(function (qd) {


    /**
     *
     * @param view
     * @param src
     * @constructor
     */
    qd.Sprite = function (view, src) {
        this.init(view, src || "");
    };

    qd.Sprite.prototype.init = function (view, src) {
        this._view = view;
        this._src = src;
        this._shape = new qd.Shape(view, [qd.Point2D.create(0, 0), qd.Point2D.create(0, 0)]);
        this._image = new Image();
        this._loaded = false;
        this._visible = true;

        return this;
    };

    qd.Sprite.prototype.destroy = function () {
        this._shape.destroy();
        this._shape = undefined;
        this._visible = undefined;
        this._loaded = undefined;
        this._image = undefined;
        this._src = undefined;
        this._view = undefined;
    };

    qd.Sprite.prototype.clone = function () {
        var clone;

        qd.debug("Cloning " + this.toString());

        clone = new qd.Sprite(this._view, this._src);
        clone._shape = this._shape.copy();
        clone._image = this._image;
        clone._loaded = this._loaded;
        clone._visible = this._visible;

        return clone;
    };

    qd.Sprite.prototype.load = function (onload) {
        var self = this;

        if (!this._loaded) {
            this._image.onload = function () {
                var topLeftIndex = 0,
                    bottomRightIndex = 1,
                    width = self._view.worldLength(self._image.width),
                    height = self._view.worldLength(self._image.height),
                    halfWidth = width * 0.5,
                    halfHeight = height * 0.5;

                self._shape.translatePoint(topLeftIndex, -halfWidth, -halfHeight);
                self._shape.modifyPoint(bottomRightIndex, halfWidth, halfHeight);

                onload(self);
            };

            this._image.src = this._src;
        }

        return this;
    };

    qd.Sprite.prototype.visible = function () {
        return this._visible;
    };

    qd.Sprite.prototype.show = function () {
        this._visible = true;
        return this;
    };

    qd.Sprite.prototype.hide = function () {
        this._visible = false;
        return this;
    };

    qd.Sprite.prototype.min = function () {
        return this._shape.firstPoint();
    };

    qd.Sprite.prototype.max = function () {
        return this._shape.lastPoint();
    };

    qd.Sprite.prototype.width = function () {
        var shape = this._shape;
        return shape.lastPoint()[0] - shape.firstPoint()[0];
    };

    qd.Sprite.prototype.height = function () {
        var shape = this._shape;
        return shape.lastPoint()[1] - shape.firstPoint()[1];
    };

    qd.Sprite.prototype.pixelWidth = function () {
        return self.image.width;
    };

    qd.Sprite.prototype.pixelHeight = function () {
        return self.image.height;
    };

    qd.Sprite.prototype.scaleToWidth = function (width) {
        var spriteWidth = this._view.worldLength(this._image.width),
            sx = width / spriteWidth,
            sy = sx;

        return this.scale(sx, sy);
    };

    qd.Sprite.prototype.scaleToHeight = function (height) {
        var spriteHeight = this._view.worldLength(this._image.height),
            sy = height / spriteHeight,
            sx = sy;

        return this.scale(sx, sy);
    };

    qd.Sprite.prototype.rescale = function (width, height) {
        var spriteWidth = this._view.worldLength(this._image.width),
            spriteHeight = this._view.worldLength(this._image.height),
            sx = width / spriteWidth,
            sy = height / spriteHeight;

        return this.scale(sx, sy);
    };

    qd.Sprite.prototype.shape = function () {
        return this._shape;
    };

    qd.Sprite.prototype.style = function () {
        // TODO: Do sprites have styles?
        return this;
    };

    qd.Sprite.prototype.styles = function () {
        return this;
    };

    qd.Sprite.prototype.position = function (x, y) {
        if (arguments.length > 0) {
            this._shape.position(x, y);
            return this;
        }

        return this._shape.centroid();
    };

    qd.Sprite.prototype.translate = function (dx, dy) {
        this._shape.translate(dx, dy);
        return this;
    };

    qd.Sprite.prototype.scale = function (sx, sy, origin) {
        this._shape.scale(sx, sy, origin);
        return this;
    };

    qd.Sprite.prototype.skew = function (kx, ky, origin) {
        this._shape.skew(kx, ky, origin);

        // TODO
        return this;
    };

    qd.Sprite.prototype.rotate = function (angle, origin) {
        this._shape.rotate(angle, origin);

        // TODO: Do with transforms
        // See http://creativejs.com/2012/01/day-10-drawing-rotated-images-into-canvas/

        return this;
    };

    qd.Sprite.prototype.bounds = function () {
        return this._shape.bounds();
    };

    qd.Sprite.prototype.draw = function (canvas) {
        var topLeft,
            bottomRight,
            width,
            height;

        if (this._visible) {
            // Sprite is friends with Path
            topLeft = this._shape._canvasPoints[0];
            bottomRight = this._shape._canvasPoints[1];
            width = bottomRight[0] - topLeft[0];
            height = bottomRight[1] - topLeft[1];

            canvas.drawImage(this._image, topLeft[0], topLeft[1], width, height);
        }

        return this;
    };

    qd.Sprite.prototype.toString = function () {
        return "Sprite";
    };

}(qd));
(function (qd) {

    /**
     * Complete list of CanvasRenderingContext2D styles.
     *
     * @type {Object}
     */
    var STYLES = {
        STROKE_COLOUR: {
            NAME: "strokeColour",
            TYPE: String,
            DEFAULT: "black"
        },
        STROKE_GRADIENT: {
            NAME: "strokeGradient",
            TYPE: qd.Gradient,
            DEFAULT: "flat"
        },
        STROKE_PATTERN: {
            NAME: "strokePattern",
            TYPE: qd.Pattern,
            DEFAULT: "flat"
        },
        FILL_COLOUR: {
            NAME: "fillColour",
            TYPE: String,
            DEFAULT: "transparent"
        },
        FILL_GRADIENT: {
            NAME: "fillGradient",
            TYPE: qd.Gradient,
            DEFAULT: "flat"
        },
        FILL_PATTERN: {
            NAME: "fillPattern",
            TYPE: qd.Pattern,
            DEFAULT: "flat"
        },
        FILL_RULE: {
            NAME: "fillRule",
            TYPE: String,
            VALUES: ["nonzero", "evenodd"],
            DEFAULT: "nonzero"
        },
        LINE_WIDTH: {
            NAME: "lineWidth",
            TYPE: Number,
            DEFAULT: 1.0
        },
        LINE_CAP: {
            NAME: "lineCap",
            TYPE: String,
            VALUES: ["butt", "round", "square"],
            DEFAULT: "butt"
        },
        LINE_JOIN: {
            NAME: "lineJoin",
            TYPE: String,
            VALUES: ["round", "bevel", "miter"],
            DEFAULT: "miter"
        },
        LINE_MITER_LIMIT: {
            NAME: "lineMiterLimit",
            TYPE: Number,
            DEFAULT: 10
        },
        LINE_DASH: {
            NAME: "lineDash",
            TYPE: Array,
            DEFAULT: [],
            REGEX: /^(\d)+(, *(\d)+)*$|^(solid)$/
        },
        LINE_DASH_OFFSET: {
            NAME: "lineDashOffset",
            TYPE: Number,
            DEFAULT: 0
        },
        FONT_SIZE: {
            NAME: "fontSize",
            TYPE: String,
            DEFAULT: "10px"
        },
        FONT_FAMILY: {
            NAME: "font",
            TYPE: String,
            DEFAULT: "sans-serif"
        },
        TEXT_ALIGN: {
            NAME: "textAlign",
            TYPE: String,
            VALUES: ["left", "right", "center"],
            DEFAULT: "left"
        },
        TEXT_BASELINE: {
            NAME: "textBaseline",
            TYPE: String,
            VALUES: ["top", "hanging", "middle", "alphabetic", "bottom"],
            DEFAULT: "alphabetic"
        },
        TEXT_DIRECTION: {
            NAME: "textDirection",
            TYPE: String,
            VALUES: ["ltr", "rtl"],
            DEFAULT: "ltr"
        },
        SHADOW_BLUR: {
            NAME: "shadowBlur",
            TYPE: Number,
            DEFAULT: 0
        },
        SHADOW_COLOUR: {
            NAME: "shadowColour",
            TYPE: String,
            DEFAULT: "black"
        },
        SHADOW_OFFSET_X: {
            NAME: "shadowOffsetX",
            TYPE: Number,
            DEFAULT: 0
        },
        SHADOW_OFFSET_Y: {
            NAME: "shadowOffsetY",
            TYPE: Number,
            DEFAULT: 0
        },

        /* Canvas styles */
        ARROW_WIDTH: {
            NAME: "arrowTipWidth",
            TYPE: Number,
            DEFAULT: 9
        },

        ARROW_TIP: {
            NAME: "arrowTip",
            TYPE: String,
            VALUES: ["none", "open", "closed", "invertedOpen", "invertedClosed"],
            DEFAULT: "open"
        },

        ARROW_BASE: {
            NAME: "arrowBase",
            TYPE: String,
            VALUES: ["none", "open", "closed", "invertedOpen", "invertedClosed"],
            DEFAULT: ["none"]
        }
    };

    var Styler = function (styles) {
        this.init(styles);
    };

    /** Static functions **/

    Styler.getDefaultStyles = function () {
        var defaultStyles = {};
        qd.eachProperty(STYLES, function (id, style) {
            defaultStyles[style.NAME] = style.DEFAULT;
        });
        return defaultStyles;
    };

    Styler.emptyStyler = function () {
        return new Styler();
    };

    Styler.defaultStyler = function (styles) {
        var defaultStyles = Styler.getDefaultStyles();
        return new Styler(
            qd.mergeProperties(
                defaultStyles,
                styles || {}));
    };

    /** Private Methods */

    Styler.prototype.init = function (styles) {
        this._stroke = false;
        this._fill = false;
        this._fillRule = STYLES.FILL_RULE.DEFAULT;
        this._styles = {};
        qd.eachProperty(styles || {}, function (style, value) {
            this._process(style, value);
        }, this);

        return this;
    };

    Styler.prototype._process = function (style, value) {
        switch (style) {
            case "stroke":
            case "strokeStyle":
            case "strokeColor":
            case "strokeColour":
                if (value === "" || value === "transparent") {
                    // No Stroke
                    this._stroke = false
                } else {
                    this._styles["strokeStyle"] = value;
                    this._stroke = true;
                }
                break;

            case "fill":
            case "fillStyle":
            case "fillColor":
            case "fillColour":
                if (value === "" || value === "transparent") {
                    // No Fill
                    this._fill = false;
                } else {
                    this._styles["fillStyle"] = value;
                    this._fill = true;
                }
                break;

            case "fillRule":
                this._fillRule = value;
                break;

            case "lineDash":
                var lineDash = null;

                if (qd.isUndefinedOrNull(value)) {
                    lineDash = [];
                } else if (typeof value === "string") {
                    if (value === "" || value === "solid") {
                        lineDash = [];
                    } else if (STYLES.LINE_DASH.REGEX.test(value)) {
                        lineDash =  qd.map(value.split(/, */), function (str) {
                            return parseInt(str);
                        });
                    }
                } else if (value instanceof Array) {
                    lineDash = value;
                }

                if (lineDash != null) {
                    this._styles["lineDash"] = lineDash;
                }

                break;
            case "shadowColor":
            case "shadowColour":
                this._styles["shadowColor"] = value;
                break;

            default:
                this._styles[style] = value;
        }
    };

    /** Public Methods */

    Styler.prototype.clone = function () {
        return new Styler(this._styles);
    };

    Styler.prototype.style = function (styleName, styleValue) {
        var styles = {};
        styles[styleName] = styleValue;
        return this.styles(styles);
    };

    Styler.prototype.styles = function (styles) {
        return this.init(qd.mergeProperties(this._styles, styles))
    };

    Styler.prototype.clear = function () {
        return this.init();
    };

    Styler.prototype.resetDefaults = function () {
        return this.init(Styler.getDefaultStyles());
    };

    Styler.prototype.get = function (style) {
        return this._styles[style];
    };

    Styler.prototype.getAll = function () {
        return qd.cloneProperties(this._styles);
    };

    Styler.prototype.apply = function (ctx) {
        var i,
            styles = this._styles,
            keys = Object.keys(styles);

        ctx.save();

        for (i = 0; i < keys.length; i += 1) {
            var style = keys[i],
                value = styles[style];

            switch (style) {
                case "lineDash":
                    ctx.setLineDash(value);
                    break;
                default:
                    ctx[style] = value;
            }
        }

        if (this._fill) {
            if (this._fillRule) {
                ctx.fill(this._fillRule);
            } else {
                ctx.fill();
            }
        }

        if (this._stroke) {
            ctx.stroke();
        }

        ctx.restore();

        return this;
    };

    Styler.STYLES = STYLES;
    qd.Styler = Styler;
}(qd));
(function (qd) {

    /**
     * Styles used to apply style to canvas paths.
     *
     * @param {Object} styles
     * @constructor
     */
    qd.Styles = function (styles) {
        this.init(styles);
    };

    qd.Styles.prototype.init = function (styles) {
        this._styler = {};
        this._stroke = false;
        this._fill = false;
        this._fillRule = qd.Styler.STYLES.FILL_RULE.DEFAULT;

        this.addAll(styles || {});

        return this;
    };

    qd.Styles.prototype.clone = function () {
        return new qd.Styles(this._styler);
    };

    /** Public Methods */

    qd.Styles.prototype.add = function (style, value) {
        switch (style) {
            case "stroke":
            case "strokeStyle":
            case "strokeColor":
            case "strokeColour":
                if (value === "" || value === "transparent") {
                    // No Stroke
                    this._stroke = false
                } else {
                    this._styler["strokeStyle"] = value;
                    this._stroke = true;
                }
                break;

            case "fill":
            case "fillStyle":
            case "fillColor":
            case "fillColour":
                if (value === "" || value === "transparent") {
                    // No Fill
                    this._fill = false;
                } else {
                    this._styler["fillStyle"] = value;
                    this._fill = true;
                }
                break;

            case "fillRule":
                this._fillRule = value;
                break;

            case "lineDash":
                var lineDash;

                if (qd.isUndefinedOrNull(value)) {
                    lineDash = [];
                } else if (typeof value === "string") {
                    if (value === "" || value === "solid") {
                        lineDash = [];
                    } else if (qd.Styler.STYLES.LINE_DASH.REGEX.test(value)) {
                        lineDash = qd.map(value.split(/, */), function (str) {
                            return parseInt(str);
                        });
                    }
                } else if (value instanceof Array) {
                     lineDash = value;
                }

                if (lineDash != null) {
                    this._styler["lineDash"] = lineDash;
                }

                break;
            case "shadowColor":
            case "shadowColour":
                this._styler["shadowColor"] = value;
                break;

            default:
                this._styler[style] = value;
        }

        return this;
    };

    qd.Styles.prototype.addAll = function (styles) {
        qd.eachProperty(styles, function (style, value) {
            this.add(style, value);
        }, this);

        return this;
    };

    qd.Styles.prototype.get = function (style) {
        return this._styler[style];
    };

    qd.Styles.prototype.getAll = function () {
        return qd.cloneProperties(this._styler);
    };

    qd.Styles.prototype.apply = function (ctx) {
        var i,
            styles = this._styler,
            keys = Object.keys(styles),
            style,
            value;

        ctx.save();

        for (i = 0; i < keys.length; i += 1) {
            style = keys[i];
            value = styles[style];

            switch (style) {
                case "lineDash":
                    ctx.setLineDash(value);
                    break;
                default:
                    ctx[style] = value;
            }
        }

        if (this._fill) {
            if (this._fillRule) {
                ctx.fill(this._fillRule);
            } else {
                ctx.fill();
            }
        }

        if (this._stroke) {
            ctx.stroke();
        }

        ctx.restore();

        return this;
    };

}(qd));
(function (qd) {

    /**
     *
     * @param text
     * @param shape
     * @constructor
     */
    qd.Text = function (text, shape) {
        this._resizeTextShape = function (canvas, text) {
            var txtMetrics = canvas.measureText(text),
                width = txtMetrics.width,
                height = -12,
                pointA = this._shape.point(0);

            this._shape.modifyPoint(1, pointA[0] + width, pointA[1] + height);
        };

        this.init(text, shape);
    };

    qd.Text.prototype.init = function (text, shape) {
        this._text = text || "";
        this._styler = {};
        this._visible = true;
        this._shape = shape;
        return this;
    };

    qd.Text.prototype.destroy = function () {
        this._shape.destroy();
        this._shape = undefined;
        this._visible = undefined;
        this._styler = undefined;
        this._text = undefined;
    };

    qd.Text.prototype.clone = function () {
        var clone;

        qd.debug("Cloning " + this.toString());

        clone = new qd.Text(this._shape.copy());
        clone._text = this._text;
        clone._visible = this._visible;
        clone._styles = qd.cloneProperties(this._styler);
        return clone;
    };

    qd.Text.prototype.text = function (canvas, text) {
        if (text) {
            this._text = text;
            this._resizeTextShape(canvas, text);
            return this;
        }

        return this._text;
    };

    qd.Text.prototype.visible = function () {
        return this._visible;
    };

    qd.Text.prototype.show = function () {
        this._visible = true;
        return this;
    };

    qd.Text.prototype.hide = function () {
        this._visible = false;
        return this;
    };

    qd.Text.prototype.style = function (style, value) {
        if (style) {
            if (qd.isDefinedAndNotNull(value)) {
                this._styler[style] = value;
                return this;
            }

            return this._styler(style);
        }

        return this;
    };

    qd.Text.prototype.styles = function (styles) {
        if (styles) {
            this._styler = qd.mergeProperties(this._styler, styles);
            return this;
        }

        return this._styler;
    };

    qd.Text.prototype.shape = function () {
        return this._shape;
    };

    qd.Text.prototype.bounds = function () {
        return this._shape.bounds();
    };

    qd.Text.prototype.position = function (x, y) {
        if (arguments.length > 0) {
            this._shape.position(x, y);
            return this;
        }

        return this._shape.centroid();
    };

    qd.Text.prototype.translate = function (dx, dy) {
        this._shape.translate(dx, dy);
        return this;
    };

    qd.Text.prototype.scale = function (sx, sy, origin) {
        this._shape.scale(sx, 1, origin);
        return this;
    };

    qd.Text.prototype.skew = function (kx, ky, origin) {
        // TODO
        return this;
    };

    qd.Text.prototype.rotate = function (angle, origin) {
        this._shape.rotate(angle, origin);
        // TODO
        return this;
    };

    qd.Text.prototype.draw = function (canvas) {
        var pointA = this._shape._canvasPoints[0],
            pointB = this._shape._canvasPoints[1],
            x,
            y,
            width;

        if (this._visible) {
            x = pointA[0];
            y = pointA[1];

    //        width = (pointB[0] - pointA[0]);
            width = canvas.measureText(this._text).width * 4

            canvas.drawText(this._text, x, y, this._styler, width);
        }

        return this;
    };

    qd.Text.prototype.toString = function () {
        return "Text";
    };

}(qd));
(function (qd) {

    /**
     *
     * @param shape
     * @param tracer
     * @param styles - Optional
     * @constructor
     */
    qd.VectorGraphic = function (shape, tracer, styles) {
        this.init(shape, tracer, styles);
    };

    /* Public */

    qd.VectorGraphic.prototype.init = function (shape, tracer, styles) {
        this._shape = shape;
        this._tracer = tracer;
        this._styler = new qd.Styler(styles);
        this._visible = true;
        return this;
    };

    qd.VectorGraphic.prototype.destroy = function () {
        this._shape.destroy();
        this._shape = undefined;
        this._tracer = undefined;
        this._styler = undefined;
        this._visible = undefined;
    };

    qd.VectorGraphic.prototype.clone = function () {
        var shape,
            styles,
            tracer,
            clone;

        qd.debug("Cloning " + this.toString());

        shape = this._shape.clone();
        styles = this._styler.getAll();
        tracer = this._tracer;
        clone = new qd.VectorGraphic(shape, tracer, styles);
        clone._visible = this._visible;

        return clone;
    };

    // TODO: Refactor to copy another graphic
    qd.VectorGraphic.prototype.copy = function () {
        var shape = this._shape.copy(),
            styles = this._styler.getAll(),
            tracer = this._tracer,
            copy = new qd.VectorGraphic(shape, tracer, styles);

        copy._visible = this._visible;

        return copy;
    };

    qd.VectorGraphic.prototype.visible = function () {
        return this._visible;
    };

    qd.VectorGraphic.prototype.show = function () {
        this._visible = true;
        return this;
    };

    qd.VectorGraphic.prototype.hide = function () {
        this._visible = false;
        return this;
    };

    qd.VectorGraphic.prototype.shape = function () {
        return this._shape;
    };

    qd.VectorGraphic.prototype.style = function (style, value) {
        if (style) {
            if (qd.isDefinedAndNotNull(value)) {

                if (style === "lineWidth") {
                    this._shape.worldLineWidth(value);
                }

                this._styler.style(style, value);

                return this;
            }

            return this._styler.get(style);
        }

        return this;
    };

    qd.VectorGraphic.prototype.styles = function (styles) {
        var lineWidth;

        if (styles) {
            lineWidth = styles["lineWidth"];

            if (qd.isDefinedAndNotNull(lineWidth)) {
                this._shape.worldLineWidth(lineWidth);
            }

            this._styler.styles(styles);

            return this;
        }

        return this._styler;
    };

    qd.VectorGraphic.prototype.position = function (x, y, origin) {
        if (arguments.length > 0) {
            this._shape.position(x, y, origin);
            return this;
        }

        return this._shape.centroid();
    };

    qd.VectorGraphic.prototype.translate = function (dx, dy) {
        qd.debug("Translating VectorGraphic");
        this._shape.translate(dx, dy);
        return this;
    };

    qd.VectorGraphic.prototype.scale = function (sx, sy, origin) {
        this._shape.scale(sx, sy, origin);
        return this;
    };

    qd.VectorGraphic.prototype.skew = function (kx, ky, origin) {
        this._shape.skew(kx, ky, origin);
        return this;
    };

    qd.VectorGraphic.prototype.rotate = function (dtheta, origin) {
        this._shape.rotate(dtheta, origin);
        return this;
    };

    qd.VectorGraphic.prototype.reflect = function (line, linePos) {
        this._shape.reflect(line, linePos);
        return this;
    };

    qd.VectorGraphic.prototype.bounds = function () {
        return this._shape.bounds();
    };

    qd.VectorGraphic.prototype.draw = function (canvas) {
        var ctx;
        if (this._visible) {
            ctx = canvas._ctx;
            ctx.beginPath();
            this._tracer(canvas, this._shape._canvasPoints);
            this._styler.style("lineWidth", this._shape._canvasLineWidth);// TODO: got do this better
            this._styler.apply(ctx);
        }

        return this;
    };

    qd.VectorGraphic.prototype.toString = function () {
        return "VectorGraphic";
    };
}(qd));
(function (qd) {

    /**
     *
     * @class qd.View
     * @param {Number} width of view in canvas coordinates
     * @param {Number} height of view in canvas coordinates
     * @constructor
     */
    qd.View = function (width, height) {
        this._width = width;
        this._height = height;

        /** Scaling **/

        this._scale = 1;                // Current scale
        this._inverseScale = 1 / this._scale; // Pre-calculate inverse scale to avoid repeated division calculations
        this._minScale = 1;              // DO NOT CHANGE (always 1)
        this._maxScale = 36;             // Can be changed for any user defined number of scale settings

        this._camera = new qd.Camera(this);

        /** Path Tracers for Graphic objects **/

        this._lineTracer = function (canvas, points) {
            var pointA = points[0],
                pointB = points[1];

            canvas.traceLine(pointA[0], pointA[1], pointB[0], pointB[1]);
        };

        this._polylineTracer = function (canvas, points) {
            canvas.tracePolyline(points);
        };

        this._polygonTracer = function (canvas, points) {
            canvas.tracePolygon(points);
        };

        this._circleTracer = function (canvas, points) {
            var centre = points[0],
                radialPoint = points[1],
                radius = qd.Point2D.distance(radialPoint, centre);

            canvas.traceCircle(centre[0], centre[1], radius);
            canvas.traceLine(centre[0], centre[1], radialPoint[0], radialPoint[1]);
        };

        this._ellipseAsBezierCurvesTracer = function (canvas, points) {
            canvas.traceEllipseAsBezierCurves(points);
        };

        this._bezierCurveTracer = function (canvas, points) {

        };

        this._quadraticCurveTracer = function (canvas, points) {
            canvas.traceQuadraticCurve(points);
        };

        this._closedQuadraticCurveTracer = function (canvas, points) {
            canvas.traceClosedQuadraticCurve(points);
        };
    };

    qd.View.prototype.path = function (canvas) {
        if (canvas) {
            this._canvas = canvas;
        }

        this._canvas.path();

        return this;
    };

    qd.View.prototype.canvas = function (canvas) {
        if (canvas) {
            this._canvas = canvas;
            return this;
        }

        return this._canvas;
    };

    qd.View.prototype.resize = function (width, height) {
        this._width = width;
        this._height = height;
    };

    qd.View.prototype.camera = function () {
        return this._camera;
    };

    /**
     * Get the view's centre X in world coordinates.
     *
     * @return {Number} centre x within the view width
     */
    qd.View.prototype.centreX = function () {
        return Math.floor(((this._width / 2 + this._camera.canvasXPos())) * this._scale);
    };

    /**
     * Get the view's centre X in world coordinates.
     *
     * @return {Number} centre y within the view height
     */
    qd.View.prototype.centreY = function () {
        return Math.floor(((this._height / 2 + this._camera.canvasYPos())) * this._scale);
    };

    /**
     * Get the view's centre point in world coordinates.
     *
     * @return {qd.Point2D}
     */
    qd.View.prototype.centre = function () {
        return qd.Point2D.create(this.centreX(), this.centreY());
    };

    /**
     * Get the x position of a random point inside the view in world coordinates
     *
     * @return {Number} random x within the view width
     */
    qd.View.prototype.randomX = function () {
        var canvasXPos = this._camera.canvasXPos(),
            scale = this._scale,
            minX = canvasXPos * scale,
            maxX = (canvasXPos + this._width) * scale;

        return Math.floor(qd.math.randomIntBetween(minX, maxX));
    };

    /**
     * Get the y position of a random point inside the view in world coordinates .
     *
     * @return {Number} random y within the view height
     */
    qd.View.prototype.randomY = function () {
        var canvasYPos = this._camera.canvasYPos(),
            scale = this._scale,
            minY = canvasYPos * scale,
            maxY = (canvasYPos + this._height) * scale;

        return Math.floor(qd.math.randomIntBetween(minY, maxY));
    };

    /**
     * Get a random point in the view.
     *
     * @return {qd.Point2D} random point within the view in world coordinates.
     */
    qd.View.prototype.randomPoint = function () {
        return qd.Point2D.create(this.randomX(), this.randomY());
    };

    /**
     * Get the view s width in world coordinates.
     *
     * @return {Number}
     */
    qd.View.prototype.width = function () {
        return this._width * this._scale;
    };

    /**
     * Get the view's height in world coordinates.
     *
     * @return {Number}
     */
    qd.View.prototype.height = function () {
        return this._height * this._scale;
    };

    qd.View.prototype.scale = function (scale) {
        if (qd.isDefinedAndNotNull(scale)) {
            if (scale >= this._minScale && scale <= this._maxScale) {
                this._scale = scale;
                this._inverseScale = 1 / scale;
            }

            return this;
        }

        return this._scale;
    };

    qd.View.prototype.inverseScale = function () {
        // DO NOT CHANGE: Set in qd.View.prototype.scale()
        return this._inverseScale;
    };

    qd.View.prototype.minScale = function () {
        // DO NOT CHANGE (always 1)
        return this._minScale;
    };

    qd.View.prototype.maxScale = function (maxScale) {
        if (maxScale) {
            this._maxScale = maxScale;

            return this;
        }

        return this._maxScale;
    };

    /**
     * Convert mouse canvas coordinates to world coordinates.
     *
     * @param {qd.Mouse} mouse in canvas coordinates
     * @return {qd.Point2D} out in world coordinates
     */
    qd.View.prototype.mouseWorldPoint = function (mouse) {
        return qd.Point2D.create(this.worldX(mouse.x), this.worldY(mouse.y));
    };

    /**
     * Convert {length} in canvas coordinates to world coordinates
     *
     * @param length in canvas coordinates
     * @return length in world coordinates
     */
    qd.View.prototype.worldLength = function (length) {
        return length * this._scale;
    };

    qd.View.prototype.worldX = function (canvasXPoint) {
        return ((canvasXPoint + this._camera.canvasXPos()) * this._scale);
    };

    qd.View.prototype.worldY = function (canvasYPoint) {
        return ((canvasYPoint + this._camera.canvasYPos()) * this._scale);
    };

    qd.View.prototype.worldPoint = function (out, canvasPoint) {
        var scale = this._scale,
            camCanvasXPos = this._camera.canvasXPos(),
            camCanvasYPos = this._camera.canvasYPos();

        out[0] = (canvasPoint[0] + camCanvasXPos) * scale;
        out[1] = (canvasPoint[1] + camCanvasYPos) * scale;

        return out;
    };

    qd.View.prototype.worldPoints = function (out, canvasPoints) {
        var camCanvasXPos = this._camera.canvasXPos(),
            camCanvasYPos = this._camera.canvasYPos(),
            i,
            canvasPoint = null,
            worldPoint = null;

        for (i = 0; i < canvasPoints.length; i += 1) {
            canvasPoint = canvasPoints[i];
            worldPoint = out[i];

            worldPoint[0] = (canvasPoint[0] + camCanvasXPos) * this._scale;
            worldPoint[1] = (canvasPoint[1] + camCanvasYPos) * this._scale;
        }

        return out;
    };

    /**
     * Convert length world coordinates to canvas coordinates.
     *
     * @param {Number} length in world coordinates
     * @return {Number} length in canvas coordinates
     */
    qd.View.prototype.canvasLength = function (length) {
        return length * this._inverseScale;
    };

    qd.View.prototype.canvasX = function (worldXPoint) {
        return ((worldXPoint - this._camera.worldXPos()) * this._inverseScale);
    };

    qd.View.prototype.canvasY = function (worldYPoint) {
        return ((worldYPoint - this._camera.worldYPos()) * this._inverseScale);
    };

    qd.View.prototype.canvasPoint = function (out, worldPoint) {
        var camWorldXPos = this._camera.worldXPos(),
            camWorldYPos = this._camera.worldYPos();

        out[0] = (worldPoint[0] - camWorldXPos) * this._inverseScale;
        out[1] = (worldPoint[1] - camWorldYPos) * this._inverseScale;

        return out;
    };

    qd.View.prototype.canvasPoints = function (canvasPoints, worldPoints) {
        var camWorldXPos = this._camera.worldXPos(),
            camWorldYPos = this._camera.worldYPos(),
            i,
            worldPoint = null,
            canvasPoint = null;

        for (i = 0; i < worldPoints.length; i += 1) {
            worldPoint = worldPoints[i];
            canvasPoint = canvasPoints[i];

            canvasPoint[0] = (worldPoint[0] - camWorldXPos) * this._inverseScale;
            canvasPoint[1] = (worldPoint[1] - camWorldYPos) * this._inverseScale;
        }

        return canvasPoints;
    };

    qd.View.prototype.newCanvasPoints = function (worldPoints) {
        var i,
            canvasVertices = new Array(worldPoints.length);

        for (i = 0; i < worldPoints.length; i += 1) {
            canvasVertices[i] = this.canvasPoint(qd.Point2D.create(0, 0), worldPoints[i]);
        }

        return canvasVertices;
    };

    /**
     *
     * @param canvas
     * @param x0
     * @param y0
     * @param x1
     * @param y1
     * @return {qd.View}
     */
    qd.View.prototype.traceLine = function (x0, y0, x1, y1) {
        this._canvas.traceLine(
            this.canvasX(x0), this.canvasY(y0),
            this.canvasX(x1), this.canvasY(y1));

        return this;
    };

    qd.View.prototype.traceRectangle = function (x, y, width, height ) {
        this._canvas.traceRectangle(
            this.canvasX(x), this.canvasY(y),
            this.canvasLength(width), this.canvasLength(height));

        return this;
    };

    qd.View.prototype.traceCircularArc = function (x, y, radius, startAngle, endAngle, anticlockwise) {
        this._canvas.traceCircularArc(
            this.canvasX(x), this.canvasY(y), this.canvasLength(radius),
            startAngle, endAngle, anticlockwise);

        return this;
    };

    /**
     * Draw a circle positioned at (x, y) with the specified radius.
     *
     * @param {Number} x
     * @param {Number} y
     * @param {Number} radius
     */
    qd.View.prototype.traceCircle = function (x, y, radius) {
        this._canvas.traceCircle(this.canvasX(x), this.canvasY(y), this.canvasLength(radius));

        return this;
    };

    qd.View.prototype.traceEllipseAsBezierCurves = function (x0, y0, radiusX, radiusY) {
        //        this._canvas.traceEllipse(this.canvasX(x0), this.canvasY(y0), this.canvasLength(radiusX), this.canvasLength(radiusY));
        return this;
    };

    qd.View.prototype.tracePolyline = function (points) {
        this._canvas.tracePolyline(this.newCanvasPoints(points));

        return this;
    };

    qd.View.prototype.tracePolygon = function (points) {
        this._canvas.tracePolygon(this.newCanvasPoints(points));

        return this;
    };

    /**
     * Draw open quadratic curve.
     *
     * @param {Array} points
     */
    qd.View.prototype.traceQuadraticCurve = function (points) {
        this._canvas.traceQuadraticCurve(this.newCanvasPoints(points));

        return this;
    };

    /**
     * Closed quadratic curve.
     *
     * @param points
     */
    qd.View.prototype.traceClosedQuadraticCurve = function (points) {
        this._canvas.traceClosedQuadraticCurve(this.newCanvasPoints(points));

        return this;
    };

    qd.View.prototype.traceArrow = function (origin, direction, styles) {
        var CACHE = qd.View.prototype.traceArrow.CACHE;
        this._canvas.traceArrow(this.canvasPoint(CACHE.ORIGIN, origin), this.canvasPoint(CACHE.DIRECTION, direction), styles);

        return this;
    };

    qd.View.prototype.traceArrow.CACHE = {
        ORIGIN: qd.Point2D.create(0, 0),
        DIRECTION: qd.Vector2D.create(0, 0)
    };

    qd.View.prototype.draw = function (styles) {
        this._canvas.draw(styles);
        return this;
    };

    qd.View.prototype.drawText = function (text, point) {
        // TODO
        return this;
    };

    qd.View.prototype.line = function (pointA, pointB) {
        var points = [],
            shape;

        points.push(pointA || qd.Point2D.create(0, 0));
        points.push(pointB || qd.Point2D.create(0, 0));

        shape = new qd.Shape(this, points);

        return new qd.VectorGraphic(shape, this._lineTracer);
    };

    qd.View.prototype.circle = function (centre, radius) {
        //    return this.ellipse(centre, radius, radius);

        var points = [],
            radialPoint0 = qd.Vector2D.create(centre[0] + radius, centre[1]),
            radialPoint1 = qd.Vector2D.create(centre[0] - radius, centre[1]),
            radialPoint2 = qd.Vector2D.create(centre[0], centre[1] - radius),
            radialPoint3 = qd.Vector2D.create(centre[0], centre[1] + radius);

        points.push(centre);
        points.push(radialPoint0);
        points.push(radialPoint1);
        points.push(radialPoint2);
        points.push(radialPoint3);

        return new qd.VectorGraphic(new qd.Shape(this, points), this._circleTracer);
    };

    // See http://spencermortensen.com/articles/bezier-circle/
    qd.View.prototype.ellipse = function (centre, radiusX, radiusY) {
        var KAPPA = 0.55191502449,

            x0 = centre[0],
            y0 = centre[1],

            w = radiusX * 2,
            h = radiusY * 2,

            x = x0 - w/2,
            y = y0 - h/2,

            ox = (w / 2) * KAPPA, // control point offset horizontal
            oy = (h / 2) * KAPPA, // control point offset vertical
            xe = x + w,           // x-end
            ye = y + h,           // y-end
            xm = x + w / 2,       // x-middle
            ym = y + h / 2,       // y-middle

            points = [];

        points.push(qd.Point2D.create(x, ym));

        points.push(qd.Point2D.create(x, ym - oy));
        points.push(qd.Point2D.create(xm - ox, y));
        points.push(qd.Point2D.create(xm, y));

        points.push(qd.Point2D.create(xm + ox, y));
        points.push(qd.Point2D.create(xe, ym - oy));
        points.push(qd.Point2D.create(xe, ym));

        points.push(qd.Point2D.create(xe, ym + oy));
        points.push(qd.Point2D.create(xm + ox, ye));
        points.push(qd.Point2D.create(xm, ye));

        points.push(qd.Point2D.create(xm - ox, ye));
        points.push(qd.Point2D.create(x, ym + oy));
        points.push(qd.Point2D.create(x, ym));

        return new qd.VectorGraphic(new qd.Shape(this, points), this._ellipseAsBezierCurvesTracer);
    };

    qd.View.prototype.text = function (canvas, text, position) {
        var textMetrics = canvas.measureText(text),
            width = textMetrics.width,
            height = -12,
            pointA = position,
            pointB = qd.Point2D.create(position[0] + width, position[1] + height),
            points = [pointA, pointB];

        return new qd.Text(text, new qd.Shape(this, points));
    };

    qd.View.prototype.circularArc = function (centre, angle) {

    };

    qd.View.prototype.rectangle = function (topLeft, bottomRight) {
        var topRight = qd.Point2D.create(bottomRight[0], topLeft[1]),
            bottomLeft = qd.Point2D.create(topLeft[0], bottomRight[1]),
            points = [];

        points.push(topLeft);
        points.push(topRight);
        points.push(bottomRight);
        points.push(bottomLeft);

        return new qd.VectorGraphic(new qd.Shape(this, points), this._polygonTracer);
    };

    qd.View.prototype.polyline = function (points) {
        return new qd.VectorGraphic(new qd.Shape(this, points), this._polylineTracer);
    };

    qd.View.prototype.polygon = function (points) {
        return new qd.VectorGraphic(new qd.Shape(this, points), this._polygonTracer);
    };

    qd.View.prototype.quadraticCurve = function (points) {
        return new qd.VectorGraphic(new qd.Shape(this, points), this._quadraticCurveTracer);
    };

    qd.View.prototype.closedQuadraticCurve = function (points) {
        return new qd.VectorGraphic(new qd.Shape(this, points), this._closedQuadraticCurveTracer);
    };

    qd.View.prototype.cubicBezier = function (points) {

    };

    qd.View.prototype.sprite = function (source, onload) {
        var sprite = new qd.Sprite(this, source);
        sprite.load(onload);
        return sprite;
    };
}(qd));
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

(function (qd) {

    /**
     * qd.Input.Touch
     *
     * @constructor
     */
    qd.Touch = function () {
        this.x = null;
        this.y = null;
        this.event = null;
    };

    /**
     * Builds a {qd.Input.Touch} that captures the touch position
     * and touch events on a touch device.
     *
     * @param element
     * @return {qd.Input.Touch}
     */
    qd.Touch.build = function (element) {
        var touch = new qd.Touch(),
            touchContainer = (element || window),
            bodyScrollLeft = document.body.scrollLeft,
            elementScrollLeft = document.documentElement.scrollLeft,
            bodyScrollTop = document.body.scrollTop,
            elementScrollTop = document.documentElement.scrollTop,
            offsetLeft = touchContainer.offsetLeft,
            offsetTop = touchContainer.offsetTop;

        touchContainer.addEventListener('touchstart', function (event) {
            touch.isPressed = true;
            touch.event = event;
        }, false);

        touchContainer.addEventListener('touchend', function (event) {
            touch.isPressed = false;
            touch.x = null;
            touch.y = null;
            touch.event = event;
        }, false);

        touchContainer.addEventListener('touchmove', function (event) {
            var x, y,
                touchEvent = event.touches[0]; //first touch

            if (touchEvent.pageX || touchEvent.pageY) {
                x = touchEvent.pageX;
                y = touchEvent.pageY;
            } else {
                x = touchEvent.clientX + bodyScrollLeft + elementScrollLeft;
                y = touchEvent.clientY + bodyScrollTop + elementScrollTop;
            }
            x -= offsetLeft;
            y -= offsetTop;

            touch.x = x;
            touch.y = y;
            touch.event = event;
        }, false);

        return touch;
    };

}(qd));
(function (qd) {

    /**
     * qd.Input.VelocityTracker tracks the velocity of a point
     * between two instants of time.
     *
     * @param {Number?} x position of the point at the first instant
     * @param {Number?} y position of the point at the first instant
     * @constructor
     */
    qd.VelocityTracker = function (x, y) {
        this.start(x, y);
    };

    qd.VelocityTracker.prototype = {

        /**
         * Start tracking velocity by specifying the x and y coordinates of
         * the point at the first instant of time.
         *
         * @param {Number?} x position of the point at the first instant
         * @param {Number?} y position of the point at the first instant
         */
        start: function (x, y) {
            this.initialX = (x || 0);
            this.initialY = (y || 0);
            this.vx = 0;
            this.vy = 0;
        },

        /**
         * Mark the x and y coordinates of the point at second (or subsequent)
         * instant of time.
         *
         * @param {Number?} x position of the point at the subsequent instant
         * @param {Number?} y position of the point at the subsequent instant
         */
        track: function (x, y) {
            this.vx = x - this.initialX;
            this.vy = y - this.initialY;
            this.initialX = x;
            this.initialY = y;
        }
    };

}(qd));
(function (qd) {

    /**
     *
     * @param arg
     * @constructor
     */
    qd.Element = function (arg) {
        this._element = null;

        if (typeof arg === "string") {
            this._element = window.document.createElement(arg);
        } else if (arg instanceof HTMLElement) {
            this._element = arg;
        }
    };

    /* Static Methods */

    qd.Element.getById = function (id) {
        return new qd.Element(qd.getElementById(id));
    };

    qd.Element.find = function (selector) {
        var domElems = window.document.querySelectorAll(selector),
            elements = [];

        qd.forEach(domElems, function (domElem) {
            elements.push(new qd.Element(domElem));
        });

        if (elements.length === 1) {
            return elements[0];
        }

        return elements;
    };

    qd.Element.create = function () {
        var args = new qd.Args(arguments),
            tag,
            template,
            element;

        if (args.matches(String)) {
            tag = args.get(0);
        } else if (args.matches(String, Object)) {
            tag = args.get(0);
            template = args.get(1);
        } else if (args.matches(Object)) {
            template = args.get(0);
            tag = template["tag"];
        }

        element = new qd.Element(tag);

        if (template) {
            if (qd.isNotEmpty(template["id"])) {
                element.id(template["id"]);
            }

            if (qd.isNotEmpty(template["className"])) {
                element.className(template["className"]);
            }

            if (qd.isDefinedAndNotNull(template["styles"])) {
                element.styles(template["styles"]);
            }

            if (qd.isDefinedAndNotNull(template["attrs"])) {
                element.attrs(template["attrs"]);
            }

            if (qd.isNotEmpty(template["text"])) {
                element.text(template["text"]);
            }

            if (qd.isDefinedAndNotNull(template["binds"])) {
                qd.eachProperty(template["binds"], function (type, callback) {
                    element.bind(type, callback);
                });
            }

            if (qd.isDefinedAndNotNull(template["children"])) {
                qd.forEach(template["children"], function (child) {
                    element.append(qd.Element.create(child));
                });
            }

            if (qd.isDefinedAndNotNull(template["binds"])) {
                qd.forEach(template["binds"], function (binding) {
                    element.bind(binding.event, binding.callback, element);
                });
            }
        }

        return element;
    };

    /** Public Methods */

    qd.Element.prototype.get = function () {
        return this._element;
    };

    qd.Element.prototype.id = function (id) {
        if (qd.isDefinedAndNotNull(id)) {
            this._element.id = id;
            return this;
        }

        return this._element.id;
    };

    qd.Element.prototype.getClass = function () {
        var classNames = this._element.className,
            classes;

        if (qd.isNotEmpty(classNames)) {
            if (classNames.search(/\s/)) {
                classes = classNames.split(" ");
            }
        } else {
            classes = [];
            classes.push(classNames);
        }

        return classes;
    };

    qd.Element.prototype.className = function (className) {
        if (className) {
            this._element.className = className;
            return this;
        }

        return this._element.className;
    };

    qd.Element.prototype.addClass = function (className) {
        if (qd.isNotEmpty(this._element.className)) {
            this._element.className += "," + className;
        } else {
            this._element.className = className;
        }

        return this;
    };

    qd.Element.prototype.removeClass = function (className) {
        if (this._element.className) {
            this._element.className.replace(className, "");
        }

        return this;
    };

    qd.Element.prototype.toggleClass = function (className) {
        if (this.hasClass(className)) {
            this.removeClass(className);
        } else {
            this.addClass(className);
        }

        return this;
    };

    qd.Element.prototype.style = function (style, value) {
        if (qd.isDefinedAndNotNull(style)) {
            if (qd.isDefined(value)) {
                this._element.style[style] = value;
            }
        }

        return this._element[style];
    };

    qd.Element.prototype.styles = function (styles) {
        qd.eachProperty(styles, function (style, value) {
            this._element.style[style] = value;
        }, this);

        return this;
    };

    qd.Element.prototype.attr = function (attr, value) {
        if (qd.isDefinedAndNotNull(attr)) {
            if (qd.isDefined(value)) {
                this._element.setAttribute(attr, value);
                return this;
            }
        }

        return this._element.getAttribute(attr);
    };

    qd.Element.prototype.attrs = function (attrs) {
        qd.eachProperty(attrs, function (attr, value) {
            this._element.setAttribute(attr, value);
        }, this);

        return this;
    };

    qd.Element.prototype.append = function () {
        var args = new qd.Args(arguments),
            element = args.get(0),
            node;

        if (args.matches(String)) {
            node = document.createTextNode(element);
        } else if (args.matches(qd.Element)) {
            node = element.get();
        } else if (args.matches(HTMLElement)) {
            node = element;
        }

        this._element.appendChild(node);

        return this;
    };

    qd.Element.prototype.prepend = function () {
        var args = new qd.Args(arguments),
            element = args.get(0),
            firstChild,
            node;

        if (args.matches(String)) {
            node = document.createTextNode(element);
        } else if (args.matches(qd.Element)) {
            node = element.get();
        } else if (args.matches(HTMLElement)) {
            node = element;
        }

        firstChild = this._element.firstChild;
        this._element.insertBefore(node, firstChild);

        return this;
    };

    qd.Element.prototype.text = function (text) {
        if (text) {
            this._element.textContent = text || "";
            return this;
        }

        return this._element.textContent;
    };

    qd.Element.prototype.value = function (value) {
        if (value) {
            this._element.value = value;
            return this;
        }

        return this._element.value;
    };

    qd.Element.prototype.innerHTML = function (innerHTML) {
        if (innerHTML) {
            this._element.innerHTML = innerHTML;
            return this;
        }

        return this._element.innerHTML;
    };

    qd.Element.prototype.remove = function (child) {
        var self = this._element;

        if (child) {
            self.removeChild(child);
        } else {
            self.parentNode.removeChild(self);
        }

        return this;
    };

    qd.Element.prototype.replace = function (child, replacement) {
        this._element.replaceChild(child, replacement);
        return this;
    };

    qd.Element.prototype.bind = function (type, callback, context) {
        this._element.addEventListener(type, qd.callbackWithContext(callback, (context) ? context : this));
        return this;
    };

    qd.Element.prototype.unbind = function (type, callback) {
        this._element.removeEventListener(type, callback);
        return this;
    };

    qd.Element.prototype.hide = function () {
        // TODO: Need to store previous display value so it can be restored by show()
        this.style("display", "none");
        return this;
    };

    qd.Element.prototype.show = function () {
        this.style("display", "block");
        return this;
    };

    qd.Element.prototype.droppable = function () {
        this.bind("dragenter", function (event) {
            this.text("");
            event.stopPropagation();
            event.preventDefault();
        })
            .bind("dragover", function (event) {
                event.stopPropagation();
                event.preventDefault();
            })
            .bind("drop", function (event) {
                event.stopPropagation();
                event.preventDefault();
            });

        return this;
    };

    qd.Element.prototype.draggable = function () {
        this.attr("draggable", true);
    };

    qd.Element.prototype.undraggable = function () {
        this.attr("draggable", false);
    };

    qd.Element.prototype.width = function () {
        return this._element.offsetWidth;
    };

    qd.Element.prototype.height = function () {
        return this._element.offsetHeight;
    };

    qd.Element.tag = function () {
        return qd.Element.create.apply(this, arguments);
    };

    qd.Element.fieldSet = function (id, label) {
        return qd.Element.tag("fieldset").id(id).append(
            qd.Element.tag("legend").text(label));
    };

    qd.Element.text = function (id, label, title, name, value) {
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

        return qd.Element.tag("span").append(textLabel).append(input);
    };

    qd.Element.button = function (id, label, title, name, value) {
        return qd.Element.tag("button", {
            id: id,
            attrs: {
                type: "button",
                name: name,
                value: ((qd.isDefinedAndNotNull(value)) ? value : name),
                title: title
            },
            text: label
        });
    };

    qd.Element.radio = function (id, label, title, checked, name, value) {
        var radioLabel = qd.Element.tag("label").attr("for", id).text(label),
            radio = qd.Element.tag("input", {
                id: id,
                attrs: {
                    type: "radio",
                    name: name,
                    value: ((qd.isDefinedAndNotNull(value)) ? value : name),
                    title: title
                }
            });

        if (checked) {
            radio.attr("checked", "checked");
        }

        return qd.Element.tag("span").append(radioLabel).append(radio);
    };

    qd.Element.file = function (id, label, title, name, value) {
        var file = qd.Element.tag("input", {
                id: id,
                attrs: {
                    type: "file",
                    name: name,
                    value: ((qd.isDefinedAndNotNull(value)) ? value : name)
                },
                styles: {
                    width: "0.1px",
                    height: "0.1px",
                    opacity: 0,
                    overflow: "hidden",
                    position: "absolute",
                    "z-index": -1
                }
            }),
            fileLabel = qd.Element.tag("label").attr("for", id).append(
                qd.Element.tag("button")
                    .attr("title", title)
                    .text(label)
                    .bind("click", function () { file.get().click(); }));

        return qd.Element.tag("span").append(fileLabel).append(file);
    };

    qd.Element.input = function (id, type, title, name, value) {
        return qd.Element.tag("input", {
            id: id,
            attrs: {
                type: type,
                name: name,
                value: ((qd.isDefinedAndNotNull(value)) ? value : name),
                title: title
            }
        });
    };
}(qd));
(function (qd) {

    /**
     * You can bind input events
     *
     * TODO: Bind events to entity
     *
     * @constructor
     */
    qd.Entity = function (engine, layer, graphic, material) {
        var self = this;

        /* Protected Methods */

        this._namespace = function (event) {
            return "qd.Entity." + event + "[id:" + this._id + "]";
        };

        this._updateBounds = function () {
            var i,
                graphic,
                bounds,
                points = [];

            for (i = 0; i < self._graphics.length; i += 1) {
                graphic = self._graphics[i];
                bounds = graphic.bounds();
                points.push(bounds.min());
                points.push(bounds.max());
            }

            qd.debug("Updating Entity[id=" + this.id() + "] Bounds");

            this._bounds.resizeAsPolygon(points);
        };

        this.init(engine, layer, graphic, material);
    };

    /* Static Methods */

    qd.Entity.ID = new qd.Id();

    /* Public Methods */

    qd.Entity.prototype.id = function () {
        return this._id;
    };

    qd.Entity.prototype.init = function (engine, layer, graphic, material) {
        this._id = qd.Entity.ID.next();

        this._engine = engine;
        this._view = engine.view();
        this._camera = this._view.camera();
        this._mouse = this._engine.mouse();
        this._world = this._engine.world();

        this._visible = true;
        this._inCameraView = true;// TODO: On every shape update, update ths flag

        this._layer = layer;

        this._draggable = false;
        this._throwable = false;
        this._dragClick = qd.Point2D.create(0, 0);

        this.dragging = false;

        this._graphics = [];

        // Sum of all the bounding boxes of the graphic children
        this._bounds;

        if (graphic != null) {
            this._bounds = new qd.BoundingBox();
            this._bounds._shape = graphic.shape();
            this.graphic(graphic);
        } else {
            this._bounds = new qd.BoundingBox(this._view);
        }

        this._body = engine.physics().body("dynamic", { bounds: this._bounds, material: material } );
    };

    qd.Entity.prototype.destroy = function () {
        var i,
            graphic;

        this.undraggable();
        this.unselectable();

        this.dragging = undefined;
        this._dragClick = undefined;

        this._draggable = undefined;

        this._layer = undefined;

        this._body.destroy();
        this._body = undefined;

        this._bounds.destroy();
        this._bounds = undefined;

        for (i = 0; i < this._graphics.length; i += 1) {
            graphic = this._graphics[i];
            graphic.bounds().offResize("qd.BoundingBox.onResize:qd.Entity._updateBounds", this._updateBounds, this);
            graphic.destroy();
        }

        this._inCameraView = undefined;
        this._visible = undefined;
        this._world = undefined;
        this._mouse = undefined;
        this._camera = undefined;
        this._view = undefined;
        this._engine = undefined;

        qd.debug("Destroyed entity[id=" + this.id() + "]");
        return this;
    };

    qd.Entity.prototype.clone = function () {
        var clone;

        qd.debug("Cloning " + this.toString());

        clone = new qd.Entity(this._engine, this._layer, this._graphics[0].clone());

        // qd.forEach(this._graphics, function (graphic) {
        //     clone.graphic(graphic.clone());
        // });

        // copy body
        clone._body = this._body.clone(this._bounds);

        return clone;
    };

    qd.Entity.prototype.bounds = function () {
        return this._bounds;
    };

    qd.Entity.prototype.graphic = function (arg) {
        var graphic,
            index;

        if (arg instanceof qd.VectorGraphic
                || arg instanceof qd.Sprite
                || arg instanceof qd.Text) {

            graphic = arg;

            this._graphics.push(graphic);

            this._updateBounds();

            graphic.bounds().onResize("qd.BoundingBox.onResize:qd.Entity._updateBounds", this._updateBounds, this);

            return this;
        } else if (arg instanceof Number) {
            index = arg
        } else {
            index = 0;
        }

        return this._graphics[index];
    };

    qd.Entity.prototype.graphics = function (graphics) {
        var i;

        if (graphics) {
            for (i = 0; i < graphics.length; i += 1) {
                this.graphic(graphics[i]);
            }

            return this;
        }

        return this._graphics;
    };

    qd.Entity.prototype.body = function (body) {
        if (body) {
            this._body = body;
            return this;
        }

        return this._body;
    };

    qd.Entity.prototype.layer = function () {
        return this._layer;
    };

    qd.Entity.prototype.position = function (x, y) {
        var dx,
            dy;

        if (arguments.length > 0) {
            dx = (x - this._bounds.centroidX());
            dy = (y - this._bounds.centroidY());

            return this.translate(dx, dy);
        }

        return this._bounds.centroid();
    };

    qd.Entity.prototype.translate = function (dx, dy) {
        var i;

        for (i = 0; i < this._graphics.length; i += 1) {
            this._graphics[i].translate(dx, dy);
        }

        this._updateBounds();

        return this;
    };

    qd.Entity.prototype.angle = function (angle) {
        var dtheta = angle - this._bounds.angle();
        this.rotate(dtheta);
    };

    qd.Entity.prototype.rotate = function (dtheta) {
        var i;

        if (dtheta != 0) {
            for (i = 0; i < this._graphics.length; i += 1) {
                this._graphics[i].rotate(dtheta, this._bounds.centroid());
            }
        }

        this._bounds.rotate(dtheta);

        return this;
    };

    qd.Entity.prototype.throwable = function (mouse) {



        return this;
    };

    qd.Entity.prototype.selectable = function () {
        this._world.selectable(this);
        return this;
    };

    qd.Entity.prototype.unselectable = function () {
        this._world.unselectable(this);
        return this;
    };

    /**
     * Make this entity draggable.
     *
     * @return {qd.Entity}
     */
    qd.Entity.prototype.draggable = function () {
        var velocityTracker,
            mousePos,
            namespace,
            mouse,
            centroid,
            dx,
            dy;

        if (!this._draggable) {
            namespace = this._namespace("draggable");
            mouse = this._engine.mouse();

            if (this._throwable) {
                velocityTracker = new qd.VelocityTracker();
            }

            // TODO: Move this into edit mode, that way we can move multiple items at once!

            mouse.press(namespace, function () {
                mousePos = mouse.worldPoint();

                if (this._bounds.hitTest(mousePos[0], mousePos[1])) {
                    console.log("dragging " + this.toString())
                    this.dragging = true;
                    centroid = this._bounds.centroid();
                    qd.Point2D.subtract(this._dragClick, mousePos, centroid);

                    this._body.deactivate();

                    if (this._throwable) {
                        velocityTracker.start(centroid[0], centroid[1]);
                    }

                    mouse.cursor("move");
                }
            }, this);

            mouse.move(namespace, function () {
                mousePos = mouse.worldPoint();

                var i,
                    self = this;

                if (this.dragging) {
                    centroid = this._bounds.centroid();
                    dx = mousePos[0] - centroid[0] - this._dragClick[0];
                    dy = mousePos[1] - centroid[1] - this._dragClick[1];

                    for (i = 0; i < self._graphics.length; i += 1) {
                        self._graphics[i].translate(dx, dy);
                    }

                    if (this._throwable) {
                        velocityTracker.track(mousePos[0], mousePos[1]);
                    }
                }
            }, this);

            mouse.release(namespace, function () {
                mousePos = mouse.worldPoint();

                if (this.dragging) {
                    this.dragging = false;
                    qd.Point2D.mutateZero(this._dragClick);

                    if (this._throwable) {
                        this._body.velocity[0] = velocityTracker.vx;
                        this._body.velocity[1] = velocityTracker.vy;
                    }

                    this._body.activate();

                    mouse.cursor("default");
                }
            }, this);

            mouse.dblClick(namespace, function () {
                mousePos = mouse.worldPoint();

                if (this._bounds.hitTest(mousePos[0], mousePos[1])) {
                    qd.Vector2D.mutateZero(this._body.velocity);
                }
            }, this);

            this._draggable = true;
        }

        return this;
    };

    qd.Entity.prototype.undraggable = function () {
        var namespace = this._namespace("draggable"),
            mouse = this._engine.mouse();

        if (this._draggable) {
            mouse.unpress(namespace);
            mouse.unmove(namespace);
            mouse.unrelease(namespace);

            this._draggable = false;
        }

        return this;
    };

    /**
     * Make this entity a drop target
     *
     * TODO: Add ability to bind dragenter, dragleave, drop events
     */
    qd.Entity.prototype.droppable = function () {
        // TODO
    };

    qd.Entity.prototype.clickTest = function (mouse) {
        var clickPoint = this._view.mouseWorldPoint(mouse);

        return this.hitTest(clickPoint[0], clickPoint[1]);
    };

    qd.Entity.prototype.hitTest = function (x, y) {
        return this._bounds.hitTest(x, y);
    };

    qd.Entity.prototype.show = function () {
        this._visible = true;
    };

    qd.Entity.prototype.hide = function () {
        this._visible = false;
    };

    qd.Entity.prototype.visible = function () {
        return this._visible;
    };

    qd.Entity.prototype.bounds = function () {
        return this._bounds;
    };

    qd.Entity.prototype.centroid = function () {
        return this._bounds.centroid();
    };

    qd.Entity.prototype.raise = function () {
        var zOrder,
            entities = this._layer.entitySet._entities,  // qd.Entity is a friend of qdEntitySet
            size = entities.length,
            topZOrder = size - 1;

        if (size > 1) {
            zOrder = this.zOrder();

            if (zOrder > -1 && zOrder !== topZOrder) {
                qd.swap(entities, zOrder, zOrder + 1);
            }
        }

        return this;
    };

    qd.Entity.prototype.raiseToTop = function () {
        var i,
            zOrder,
            entities = this._layer.entitySet._entities,  // qd.Entity is a friend of qdEntitySet
            size = entities.length,
            topZOrder = size - 1;

        if (size > 1) {
            zOrder = this.zOrder();

            if (zOrder > -1 && zOrder !== topZOrder) {
                for (i = zOrder; i < topZOrder; i ++) {
                    qd.swap(entities, i, i + 1);
                }
            }
        }

        return this;
    };

    qd.Entity.prototype.lower = function () {
        var zOrder,
            entities = this._layer.entitySet._entities,  // qd.Entity is a friend of qdEntitySet
            size = entities.length,
            bottomZOrder = 0;

        if (size > 1) {
            zOrder = this.zOrder();

            if (zOrder > -1 && zOrder !== bottomZOrder) {
                qd.swap(entities, zOrder, zOrder - 1);
            }
        }

        return this;
    };

    qd.Entity.prototype.lowerToBottom = function () {
        var i,
            zOrder,
            entities = this._layer.entitySet._entities,  // qd.Entity is a friend of qdEntitySet
            size = entities.length,
            bottomZOrder = 0;

        if (size > 1) {
            zOrder = this.zOrder();

            if (zOrder > -1 && zOrder !== bottomZOrder) {
                for (i = zOrder; i > bottomZOrder; i -= 1) {
                    qd.swap(entities, i, i - 1);
                }
            }
        }

        return this;
    };

    // zOrder = 0 -> bottom
    qd.Entity.prototype.zOrder = function () {
        var _this = this,
            entities = this._layer.entitySet._entities; // qd.Entity is a friend of qdEntitySet

        return qd.findIndex(entities, function (entity) {
            return entity === _this;
        });
    };

    qd.Entity.prototype.isDrawable = function () {
        return (this._inCameraView && this._layer.visible && this._visible);
    };

    qd.Entity.prototype.draw = function (canvas) {
        var i,
            graphics;

        if (this.isDrawable()) {
            graphics = this._graphics;

            for (i = 0; i < graphics.length; i += 1) {
                graphics[i].draw(canvas);
            }

            this._body.draw(canvas);
        }
    };

    qd.Entity.prototype.toString = function () {
        return "Entity[id=" + this._id + "]";
    };
}(qd));
(function (qd) {

    qd.EntitySet = function () {
        this.init();
    };

    qd.EntitySet.prototype.init = function () {
        this._entities = [];
        this._centroid = this.centroid(qd.Point2D.create(0, 0));

        return this;
    };

    qd.EntitySet.prototype.destroy = function () {
        this.each(function (entity) {
            entity.destroy();
        });
    };

    qd.EntitySet.prototype.clone = function () {
        var clone;

        qd.debug("Cloning " + this.toString());

        clone = new qd.EntitySet();

        this.each(function (entity) {
            clone.add(entity.clone());
        }, this);

        return clone;
    };

    qd.EntitySet.prototype.put = function (entity) {
        this.clear();
        this._entities.push(entity);

        return this;
    };

    qd.EntitySet.prototype.add = function (entity) {
        if (entity) {
            if (!qd.includes(this._entities, entity)) {
                this._entities.push(entity);
            }
        }

        return this;
    };

    qd.EntitySet.prototype.addAll = function (entities) {
        if (entities instanceof Array) {
            qd.forEach(entities, function (entity) {
                this.add(entity);
            }, this);
        } else if (entities instanceof qd.EntitySet) {
            entities.each(function (entity) {
                this.add(entity);
            }, this);
        }
    };

    qd.EntitySet.prototype.remove = function (entity) {
        if (entity) {
            qd.remove(this._entities, function (thatEntity) {
                return entity === thatEntity;
            });
        }

        return this;
    };

    qd.EntitySet.prototype.empty = function () {
        return this._entities.length === 0;
    };

    qd.EntitySet.prototype.clear = function () {
        this._entities = [];

        return this;
    };

    qd.EntitySet.prototype.position = function (x, y, origin) {
        return this.each(function (entity) {
            entity.position(x, y, origin);
        });
    };

    qd.EntitySet.prototype.translate = function (dx, dy) {
        return this.eachGraphic(function (graphic) {
            graphic.translate(dx, dy);
        });
    };

    qd.EntitySet.prototype.scale = function (sx, sy) {
        var centre;

        return this.each(function (entity) {
            centre = entity.position();

            qd.forEach(entity.graphics(), function (graphic) {
                graphic.scale(sx, sy, centre);
            });
        });
    };

    qd.EntitySet.prototype.rotate = function (dtheta) {
        var centre;

        return this.each(function (entity) {
            centre = entity.position();

            qd.forEach(entity.graphics(), function (graphic) {
                graphic.rotate(dtheta, centre);
            });
        });
    };

    qd.EntitySet.prototype.skew = function (kx, ky) {
        var centre;

        return this.each(function (entity) {
            centre = entity.position();

            qd.forEach(entity.graphics(), function (graphic) {
                graphic.skew(kx, ky, centre);
            });
        });
    };

    qd.EntitySet.prototype.applyStyle = function (style, value) {
        return this.eachGraphic(function (graphic) {
            graphic.style(style, value);
        });
    };

    qd.EntitySet.prototype.size = function () {
        return this._entities.length;
    };

    qd.EntitySet.prototype.each = function (callback, context) {
        var i;

        for (i = 0; i < this._entities.length; i += 1) {
            callback.call(context, this._entities[i]);
        }

        return this;
    };

    qd.EntitySet.prototype.eachGraphic = function (callback, context) {
        var i,
            j,
            graphics;

        for (i = 0; i < this._entities.length; i += 1) {
            graphics = this._entities[i].graphics();

            for (j = 0; j < graphics.length; j += 1) {
                callback.call(context, graphics[j]);
            }
        }

        return this;
    };

    qd.EntitySet.prototype.centroid = function (centroid) {
        var points = [];

        this.each(function (entity) {
            points.push(entity.centroid());
        });

        if (qd.isDefinedAndNotNull(centroid)) {
            this._centroid = qd.Vector2D.clone(centroid);
        }

        return qd.math.centroid(this._centroid, points);
    };

    qd.EntitySet.prototype.sortZOrder = function () {
        this._entities = this._entities.sort(function (a, b) {
            return a.zOrder() - b.zOrder();
        });

        return this;
    };

    qd.EntitySet.prototype.bottom = function () {
        return (this._entities.length > 0)
            ? this._entities[0]
            : undefined;
    };

    qd.EntitySet.prototype.top = function () {
        return (this._entities.length > 0)
            ? this._entities[this._entities.length - 1]
            : undefined;
    };

    qd.EntitySet.prototype.raise = function () {
        qd.forEach(this._entities, function (entity) {
            entity.raise();
        });
    };

    qd.EntitySet.prototype.raiseToTop = function () {
        qd.forEach(this._entities, function (entity) {
            entity.raiseToTop();
        });
    };

    qd.EntitySet.prototype.lower = function () {
        qd.forEach(this._entities, function (entity) {
            entity.lower();
        });
    };

    qd.EntitySet.prototype.lowerToBottom = function () {
        qd.forEach(this._entities, function (entity) {
            entity.lowerToBottom();
        });
    };

    // TODO: Need to improve this to return hit data, which could include multiple entities, etc
    qd.EntitySet.prototype.hitTest = function (x, y) {
        var candidates = new qd.EntitySet();

        qd.forEach(this._entities, function (entity) {
            if (entity.hitTest(x, y)) {
                candidates.add(entity);
            }
        });

        candidates.sortZOrder();

        return candidates.top();
    };

    qd.EntitySet.prototype.clickTest = function (mouse) {
        var candidates = new qd.EntitySet();

        qd.forEach(this._entities, function (entity) {
            if (entity.clickTest(mouse)) {
                candidates.add(entity);
            }
        });

        candidates.sortZOrder();

        return candidates.top();
    };

    qd.EntitySet.prototype.applyBodyProperty = function (property, value) {
        return this.each(function (entity) {
            entity.body().setProperty(property, value);
        });
    };

    qd.EntitySet.prototype.toString = function () {
        return "EntitySet";
    };
}(qd));
(function (qd) {

    qd.Layer = function (name, canvas) {
        this.init(name, canvas);
    };

    qd.Layer.prototype.init = function (name, canvas) {
        this.name = name;
        this.visible = true;
        this.entitySet = new qd.EntitySet();
        this.canvas = canvas;
    };

    qd.Layer.prototype.eachEntity = function (callback) {
        this.entitySet.each(callback);
        return this;
    };
}(qd));
(function (qd) {

    qd.World = function (engine) {
        this.init(engine);
    };

    qd.World.ORIGIN = qd.Point2D.create(0, 0);

    qd.World.prototype.init = function (engine) {
        this._engine = engine;
        this._physics = engine.physics();

        // TODO: Should be multiple canvases. Include Background, and Grid (fixed zOrder). Enable Parallax.
        this._layers = new qd.DynamicStack();
        this.addLayer("layer0");

        this._selectable = new qd.EntitySet();
    };

    qd.World.prototype.addLayer = function (name) {
        this._activeLayer = new qd.Layer(name);
        this._layers.push(this._activeLayer);
    };

    qd.World.prototype.activeLayer = function () {
        return this._activeLayer;
    };

    qd.World.prototype.eachLayer = function (callback) {
        this._layers.each(callback);
    };

    qd.World.prototype.selectable = function (entity) {
        if (entity) {
            this._selectable.add(entity);
            return this;
        }

        return this._selectable;
    };

    qd.World.prototype.unselectable = function (entity) {
        this._selectable.remove(entity);

        return this;
    };

    qd.World.prototype.createEntity = function (graphic) {
        var entity = new qd.Entity(this._engine, this._activeLayer, graphic, "wood");
        this.addEntity(entity);

        qd.debug("Created: " + entity.toString());

        return entity;
    };

    qd.World.prototype.addEntity = function (entity) {
        qd.debug("Adding: " + entity.toString());

        this._activeLayer.entitySet.add(entity);

        // TODO: need 1 Universe per layer
        this._physics.add(entity.body());
        return this;
    };

    qd.World.prototype.removeEntity = function (entity) {
        qd.debug("Removing: " + entity.toString());

        entity.layer().entitySet.remove(entity);

        this._physics.remove(entity.body());

        return this;
    };

    qd.World.prototype.destroyEntity = function (entity) {
        qd.debug("Destroying: " + entity.toString());

        this.removeEntity(entity);
        entity.destroy();

        return this;
    };

    qd.World.prototype.clear = function () {
        this._layers.each(function (layer) {
            layer.entitySet.destroy();
        });
        return this.init(this._engine);
    };

    qd.World.prototype.step = function (t, dt) {
        var i,
            entities,
            entity,
            body,
            position;

        this._physics.step(t, dt);

        this._layers.each(function (layer) {
            entities = layer.entitySet._entities;

            for (i = 0; i < entities.length; i += 1) {
                entity = entities[i];
                body = entity.body();

                if (body.active) {
                    position = body.position;
                    entity.position(position[0], position[1]);
                    entity.rotate(body.deltaAngle);
                }
            }
        });
    };

    qd.World.prototype.draw = function (canvas) {
        var i,
            entities;
        this._layers.each(function (layer) {
            entities = layer.entitySet._entities;

            for (i = 0; i < entities.length; i += 1) {
                entities[i].draw(canvas);
            }
        });

        return this;
    };
}(qd));
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
