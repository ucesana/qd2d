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
