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
