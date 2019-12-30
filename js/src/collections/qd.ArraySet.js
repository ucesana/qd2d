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


