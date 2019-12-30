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
