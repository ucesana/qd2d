qd.DynamicSpring = function (endPoint0, endPoint1, springConstant) {
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
