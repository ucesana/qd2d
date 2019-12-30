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
