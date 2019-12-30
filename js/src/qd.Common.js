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
