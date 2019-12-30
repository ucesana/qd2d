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
