(function (qd) {


    /**
     *
     * @param view
     * @param src
     * @constructor
     */
    qd.Sprite = function (view, src) {
        this.init(view, src || "");
    };

    qd.Sprite.prototype.init = function (view, src) {
        this._view = view;
        this._src = src;
        this._shape = new qd.Shape(view, [qd.Point2D.create(0, 0), qd.Point2D.create(0, 0)]);
        this._image = new Image();
        this._loaded = false;
        this._visible = true;

        return this;
    };

    qd.Sprite.prototype.destroy = function () {
        this._shape.destroy();
        this._shape = undefined;
        this._visible = undefined;
        this._loaded = undefined;
        this._image = undefined;
        this._src = undefined;
        this._view = undefined;
    };

    qd.Sprite.prototype.clone = function () {
        var clone;

        qd.debug("Cloning " + this.toString());

        clone = new qd.Sprite(this._view, this._src);
        clone._shape = this._shape.copy();
        clone._image = this._image;
        clone._loaded = this._loaded;
        clone._visible = this._visible;

        return clone;
    };

    qd.Sprite.prototype.load = function (onload) {
        var self = this;

        if (!this._loaded) {
            this._image.onload = function () {
                var topLeftIndex = 0,
                    bottomRightIndex = 1,
                    width = self._view.worldLength(self._image.width),
                    height = self._view.worldLength(self._image.height),
                    halfWidth = width * 0.5,
                    halfHeight = height * 0.5;

                self._shape.translatePoint(topLeftIndex, -halfWidth, -halfHeight);
                self._shape.modifyPoint(bottomRightIndex, halfWidth, halfHeight);

                onload(self);
            };

            this._image.src = this._src;
        }

        return this;
    };

    qd.Sprite.prototype.visible = function () {
        return this._visible;
    };

    qd.Sprite.prototype.show = function () {
        this._visible = true;
        return this;
    };

    qd.Sprite.prototype.hide = function () {
        this._visible = false;
        return this;
    };

    qd.Sprite.prototype.min = function () {
        return this._shape.firstPoint();
    };

    qd.Sprite.prototype.max = function () {
        return this._shape.lastPoint();
    };

    qd.Sprite.prototype.width = function () {
        var shape = this._shape;
        return shape.lastPoint()[0] - shape.firstPoint()[0];
    };

    qd.Sprite.prototype.height = function () {
        var shape = this._shape;
        return shape.lastPoint()[1] - shape.firstPoint()[1];
    };

    qd.Sprite.prototype.pixelWidth = function () {
        return self.image.width;
    };

    qd.Sprite.prototype.pixelHeight = function () {
        return self.image.height;
    };

    qd.Sprite.prototype.scaleToWidth = function (width) {
        var spriteWidth = this._view.worldLength(this._image.width),
            sx = width / spriteWidth,
            sy = sx;

        return this.scale(sx, sy);
    };

    qd.Sprite.prototype.scaleToHeight = function (height) {
        var spriteHeight = this._view.worldLength(this._image.height),
            sy = height / spriteHeight,
            sx = sy;

        return this.scale(sx, sy);
    };

    qd.Sprite.prototype.rescale = function (width, height) {
        var spriteWidth = this._view.worldLength(this._image.width),
            spriteHeight = this._view.worldLength(this._image.height),
            sx = width / spriteWidth,
            sy = height / spriteHeight;

        return this.scale(sx, sy);
    };

    qd.Sprite.prototype.shape = function () {
        return this._shape;
    };

    qd.Sprite.prototype.style = function () {
        // TODO: Do sprites have styles?
        return this;
    };

    qd.Sprite.prototype.styles = function () {
        return this;
    };

    qd.Sprite.prototype.position = function (x, y) {
        if (arguments.length > 0) {
            this._shape.position(x, y);
            return this;
        }

        return this._shape.centroid();
    };

    qd.Sprite.prototype.translate = function (dx, dy) {
        this._shape.translate(dx, dy);
        return this;
    };

    qd.Sprite.prototype.scale = function (sx, sy, origin) {
        this._shape.scale(sx, sy, origin);
        return this;
    };

    qd.Sprite.prototype.skew = function (kx, ky, origin) {
        this._shape.skew(kx, ky, origin);

        // TODO
        return this;
    };

    qd.Sprite.prototype.rotate = function (angle, origin) {
        this._shape.rotate(angle, origin);

        // TODO: Do with transforms
        // See http://creativejs.com/2012/01/day-10-drawing-rotated-images-into-canvas/

        return this;
    };

    qd.Sprite.prototype.bounds = function () {
        return this._shape.bounds();
    };

    qd.Sprite.prototype.draw = function (canvas) {
        var topLeft,
            bottomRight,
            width,
            height;

        if (this._visible) {
            // Sprite is friends with Path
            topLeft = this._shape._canvasPoints[0];
            bottomRight = this._shape._canvasPoints[1];
            width = bottomRight[0] - topLeft[0];
            height = bottomRight[1] - topLeft[1];

            canvas.drawImage(this._image, topLeft[0], topLeft[1], width, height);
        }

        return this;
    };

    qd.Sprite.prototype.toString = function () {
        return "Sprite";
    };

}(qd));
