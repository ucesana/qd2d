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
