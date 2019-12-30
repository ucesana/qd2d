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
