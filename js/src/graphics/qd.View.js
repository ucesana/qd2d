(function (qd) {

    /**
     *
     * @class qd.View
     * @param {Number} width of view in canvas coordinates
     * @param {Number} height of view in canvas coordinates
     * @constructor
     */
    qd.View = function (width, height) {
        this._width = width;
        this._height = height;

        /** Scaling **/

        this._scale = 1;                // Current scale
        this._inverseScale = 1 / this._scale; // Pre-calculate inverse scale to avoid repeated division calculations
        this._minScale = 1;              // DO NOT CHANGE (always 1)
        this._maxScale = 36;             // Can be changed for any user defined number of scale settings

        this._camera = new qd.Camera(this);

        /** Path Tracers for Graphic objects **/

        this._lineTracer = function (canvas, points) {
            var pointA = points[0],
                pointB = points[1];

            canvas.traceLine(pointA[0], pointA[1], pointB[0], pointB[1]);
        };

        this._polylineTracer = function (canvas, points) {
            canvas.tracePolyline(points);
        };

        this._polygonTracer = function (canvas, points) {
            canvas.tracePolygon(points);
        };

        this._circleTracer = function (canvas, points) {
            var centre = points[0],
                radialPoint = points[1],
                radius = qd.Point2D.distance(radialPoint, centre);

            canvas.traceCircle(centre[0], centre[1], radius);
            canvas.traceLine(centre[0], centre[1], radialPoint[0], radialPoint[1]);
        };

        this._ellipseAsBezierCurvesTracer = function (canvas, points) {
            canvas.traceEllipseAsBezierCurves(points);
        };

        this._bezierCurveTracer = function (canvas, points) {

        };

        this._quadraticCurveTracer = function (canvas, points) {
            canvas.traceQuadraticCurve(points);
        };

        this._closedQuadraticCurveTracer = function (canvas, points) {
            canvas.traceClosedQuadraticCurve(points);
        };
    };

    qd.View.prototype.path = function (canvas) {
        if (canvas) {
            this._canvas = canvas;
        }

        this._canvas.path();

        return this;
    };

    qd.View.prototype.canvas = function (canvas) {
        if (canvas) {
            this._canvas = canvas;
            return this;
        }

        return this._canvas;
    };

    qd.View.prototype.resize = function (width, height) {
        this._width = width;
        this._height = height;
    };

    qd.View.prototype.camera = function () {
        return this._camera;
    };

    /**
     * Get the view's centre X in world coordinates.
     *
     * @return {Number} centre x within the view width
     */
    qd.View.prototype.centreX = function () {
        return Math.floor(((this._width / 2 + this._camera.canvasXPos())) * this._scale);
    };

    /**
     * Get the view's centre X in world coordinates.
     *
     * @return {Number} centre y within the view height
     */
    qd.View.prototype.centreY = function () {
        return Math.floor(((this._height / 2 + this._camera.canvasYPos())) * this._scale);
    };

    /**
     * Get the view's centre point in world coordinates.
     *
     * @return {qd.Point2D}
     */
    qd.View.prototype.centre = function () {
        return qd.Point2D.create(this.centreX(), this.centreY());
    };

    /**
     * Get the x position of a random point inside the view in world coordinates
     *
     * @return {Number} random x within the view width
     */
    qd.View.prototype.randomX = function () {
        var canvasXPos = this._camera.canvasXPos(),
            scale = this._scale,
            minX = canvasXPos * scale,
            maxX = (canvasXPos + this._width) * scale;

        return Math.floor(qd.math.randomIntBetween(minX, maxX));
    };

    /**
     * Get the y position of a random point inside the view in world coordinates .
     *
     * @return {Number} random y within the view height
     */
    qd.View.prototype.randomY = function () {
        var canvasYPos = this._camera.canvasYPos(),
            scale = this._scale,
            minY = canvasYPos * scale,
            maxY = (canvasYPos + this._height) * scale;

        return Math.floor(qd.math.randomIntBetween(minY, maxY));
    };

    /**
     * Get a random point in the view.
     *
     * @return {qd.Point2D} random point within the view in world coordinates.
     */
    qd.View.prototype.randomPoint = function () {
        return qd.Point2D.create(this.randomX(), this.randomY());
    };

    /**
     * Get the view s width in world coordinates.
     *
     * @return {Number}
     */
    qd.View.prototype.width = function () {
        return this._width * this._scale;
    };

    /**
     * Get the view's height in world coordinates.
     *
     * @return {Number}
     */
    qd.View.prototype.height = function () {
        return this._height * this._scale;
    };

    qd.View.prototype.scale = function (scale) {
        if (qd.isDefinedAndNotNull(scale)) {
            if (scale >= this._minScale && scale <= this._maxScale) {
                this._scale = scale;
                this._inverseScale = 1 / scale;
            }

            return this;
        }

        return this._scale;
    };

    qd.View.prototype.inverseScale = function () {
        // DO NOT CHANGE: Set in qd.View.prototype.scale()
        return this._inverseScale;
    };

    qd.View.prototype.minScale = function () {
        // DO NOT CHANGE (always 1)
        return this._minScale;
    };

    qd.View.prototype.maxScale = function (maxScale) {
        if (maxScale) {
            this._maxScale = maxScale;

            return this;
        }

        return this._maxScale;
    };

    /**
     * Convert mouse canvas coordinates to world coordinates.
     *
     * @param {qd.Mouse} mouse in canvas coordinates
     * @return {qd.Point2D} out in world coordinates
     */
    qd.View.prototype.mouseWorldPoint = function (mouse) {
        return qd.Point2D.create(this.worldX(mouse.x), this.worldY(mouse.y));
    };

    /**
     * Convert {length} in canvas coordinates to world coordinates
     *
     * @param length in canvas coordinates
     * @return length in world coordinates
     */
    qd.View.prototype.worldLength = function (length) {
        return length * this._scale;
    };

    qd.View.prototype.worldX = function (canvasXPoint) {
        return ((canvasXPoint + this._camera.canvasXPos()) * this._scale);
    };

    qd.View.prototype.worldY = function (canvasYPoint) {
        return ((canvasYPoint + this._camera.canvasYPos()) * this._scale);
    };

    qd.View.prototype.worldPoint = function (out, canvasPoint) {
        var scale = this._scale,
            camCanvasXPos = this._camera.canvasXPos(),
            camCanvasYPos = this._camera.canvasYPos();

        out[0] = (canvasPoint[0] + camCanvasXPos) * scale;
        out[1] = (canvasPoint[1] + camCanvasYPos) * scale;

        return out;
    };

    qd.View.prototype.worldPoints = function (out, canvasPoints) {
        var camCanvasXPos = this._camera.canvasXPos(),
            camCanvasYPos = this._camera.canvasYPos(),
            i,
            canvasPoint = null,
            worldPoint = null;

        for (i = 0; i < canvasPoints.length; i += 1) {
            canvasPoint = canvasPoints[i];
            worldPoint = out[i];

            worldPoint[0] = (canvasPoint[0] + camCanvasXPos) * this._scale;
            worldPoint[1] = (canvasPoint[1] + camCanvasYPos) * this._scale;
        }

        return out;
    };

    /**
     * Convert length world coordinates to canvas coordinates.
     *
     * @param {Number} length in world coordinates
     * @return {Number} length in canvas coordinates
     */
    qd.View.prototype.canvasLength = function (length) {
        return length * this._inverseScale;
    };

    qd.View.prototype.canvasX = function (worldXPoint) {
        return ((worldXPoint - this._camera.worldXPos()) * this._inverseScale);
    };

    qd.View.prototype.canvasY = function (worldYPoint) {
        return ((worldYPoint - this._camera.worldYPos()) * this._inverseScale);
    };

    qd.View.prototype.canvasPoint = function (out, worldPoint) {
        var camWorldXPos = this._camera.worldXPos(),
            camWorldYPos = this._camera.worldYPos();

        out[0] = (worldPoint[0] - camWorldXPos) * this._inverseScale;
        out[1] = (worldPoint[1] - camWorldYPos) * this._inverseScale;

        return out;
    };

    qd.View.prototype.canvasPoints = function (canvasPoints, worldPoints) {
        var camWorldXPos = this._camera.worldXPos(),
            camWorldYPos = this._camera.worldYPos(),
            i,
            worldPoint = null,
            canvasPoint = null;

        for (i = 0; i < worldPoints.length; i += 1) {
            worldPoint = worldPoints[i];
            canvasPoint = canvasPoints[i];

            canvasPoint[0] = (worldPoint[0] - camWorldXPos) * this._inverseScale;
            canvasPoint[1] = (worldPoint[1] - camWorldYPos) * this._inverseScale;
        }

        return canvasPoints;
    };

    qd.View.prototype.newCanvasPoints = function (worldPoints) {
        var i,
            canvasVertices = new Array(worldPoints.length);

        for (i = 0; i < worldPoints.length; i += 1) {
            canvasVertices[i] = this.canvasPoint(qd.Point2D.create(0, 0), worldPoints[i]);
        }

        return canvasVertices;
    };

    /**
     *
     * @param canvas
     * @param x0
     * @param y0
     * @param x1
     * @param y1
     * @return {qd.View}
     */
    qd.View.prototype.traceLine = function (x0, y0, x1, y1) {
        this._canvas.traceLine(
            this.canvasX(x0), this.canvasY(y0),
            this.canvasX(x1), this.canvasY(y1));

        return this;
    };

    qd.View.prototype.traceRectangle = function (x, y, width, height ) {
        this._canvas.traceRectangle(
            this.canvasX(x), this.canvasY(y),
            this.canvasLength(width), this.canvasLength(height));

        return this;
    };

    qd.View.prototype.traceCircularArc = function (x, y, radius, startAngle, endAngle, anticlockwise) {
        this._canvas.traceCircularArc(
            this.canvasX(x), this.canvasY(y), this.canvasLength(radius),
            startAngle, endAngle, anticlockwise);

        return this;
    };

    /**
     * Draw a circle positioned at (x, y) with the specified radius.
     *
     * @param {Number} x
     * @param {Number} y
     * @param {Number} radius
     */
    qd.View.prototype.traceCircle = function (x, y, radius) {
        this._canvas.traceCircle(this.canvasX(x), this.canvasY(y), this.canvasLength(radius));

        return this;
    };

    qd.View.prototype.traceEllipseAsBezierCurves = function (x0, y0, radiusX, radiusY) {
        //        this._canvas.traceEllipse(this.canvasX(x0), this.canvasY(y0), this.canvasLength(radiusX), this.canvasLength(radiusY));
        return this;
    };

    qd.View.prototype.tracePolyline = function (points) {
        this._canvas.tracePolyline(this.newCanvasPoints(points));

        return this;
    };

    qd.View.prototype.tracePolygon = function (points) {
        this._canvas.tracePolygon(this.newCanvasPoints(points));

        return this;
    };

    /**
     * Draw open quadratic curve.
     *
     * @param {Array} points
     */
    qd.View.prototype.traceQuadraticCurve = function (points) {
        this._canvas.traceQuadraticCurve(this.newCanvasPoints(points));

        return this;
    };

    /**
     * Closed quadratic curve.
     *
     * @param points
     */
    qd.View.prototype.traceClosedQuadraticCurve = function (points) {
        this._canvas.traceClosedQuadraticCurve(this.newCanvasPoints(points));

        return this;
    };

    qd.View.prototype.traceArrow = function (origin, direction, styles) {
        var CACHE = qd.View.prototype.traceArrow.CACHE;
        this._canvas.traceArrow(this.canvasPoint(CACHE.ORIGIN, origin), this.canvasPoint(CACHE.DIRECTION, direction), styles);

        return this;
    };

    qd.View.prototype.traceArrow.CACHE = {
        ORIGIN: qd.Point2D.create(0, 0),
        DIRECTION: qd.Vector2D.create(0, 0)
    };

    qd.View.prototype.draw = function (styles) {
        this._canvas.draw(styles);
        return this;
    };

    qd.View.prototype.drawText = function (text, point) {
        // TODO
        return this;
    };

    qd.View.prototype.line = function (pointA, pointB) {
        var points = [],
            shape;

        points.push(pointA || qd.Point2D.create(0, 0));
        points.push(pointB || qd.Point2D.create(0, 0));

        shape = new qd.Shape(this, points);

        return new qd.VectorGraphic(shape, this._lineTracer);
    };

    qd.View.prototype.circle = function (centre, radius) {
        //    return this.ellipse(centre, radius, radius);

        var points = [],
            radialPoint0 = qd.Vector2D.create(centre[0] + radius, centre[1]),
            radialPoint1 = qd.Vector2D.create(centre[0] - radius, centre[1]),
            radialPoint2 = qd.Vector2D.create(centre[0], centre[1] - radius),
            radialPoint3 = qd.Vector2D.create(centre[0], centre[1] + radius);

        points.push(centre);
        points.push(radialPoint0);
        points.push(radialPoint1);
        points.push(radialPoint2);
        points.push(radialPoint3);

        return new qd.VectorGraphic(new qd.Shape(this, points), this._circleTracer);
    };

    // See http://spencermortensen.com/articles/bezier-circle/
    qd.View.prototype.ellipse = function (centre, radiusX, radiusY) {
        var KAPPA = 0.55191502449,

            x0 = centre[0],
            y0 = centre[1],

            w = radiusX * 2,
            h = radiusY * 2,

            x = x0 - w/2,
            y = y0 - h/2,

            ox = (w / 2) * KAPPA, // control point offset horizontal
            oy = (h / 2) * KAPPA, // control point offset vertical
            xe = x + w,           // x-end
            ye = y + h,           // y-end
            xm = x + w / 2,       // x-middle
            ym = y + h / 2,       // y-middle

            points = [];

        points.push(qd.Point2D.create(x, ym));

        points.push(qd.Point2D.create(x, ym - oy));
        points.push(qd.Point2D.create(xm - ox, y));
        points.push(qd.Point2D.create(xm, y));

        points.push(qd.Point2D.create(xm + ox, y));
        points.push(qd.Point2D.create(xe, ym - oy));
        points.push(qd.Point2D.create(xe, ym));

        points.push(qd.Point2D.create(xe, ym + oy));
        points.push(qd.Point2D.create(xm + ox, ye));
        points.push(qd.Point2D.create(xm, ye));

        points.push(qd.Point2D.create(xm - ox, ye));
        points.push(qd.Point2D.create(x, ym + oy));
        points.push(qd.Point2D.create(x, ym));

        return new qd.VectorGraphic(new qd.Shape(this, points), this._ellipseAsBezierCurvesTracer);
    };

    qd.View.prototype.text = function (canvas, text, position) {
        var textMetrics = canvas.measureText(text),
            width = textMetrics.width,
            height = -12,
            pointA = position,
            pointB = qd.Point2D.create(position[0] + width, position[1] + height),
            points = [pointA, pointB];

        return new qd.Text(text, new qd.Shape(this, points));
    };

    qd.View.prototype.circularArc = function (centre, angle) {

    };

    qd.View.prototype.rectangle = function (topLeft, bottomRight) {
        var topRight = qd.Point2D.create(bottomRight[0], topLeft[1]),
            bottomLeft = qd.Point2D.create(topLeft[0], bottomRight[1]),
            points = [];

        points.push(topLeft);
        points.push(topRight);
        points.push(bottomRight);
        points.push(bottomLeft);

        return new qd.VectorGraphic(new qd.Shape(this, points), this._polygonTracer);
    };

    qd.View.prototype.polyline = function (points) {
        return new qd.VectorGraphic(new qd.Shape(this, points), this._polylineTracer);
    };

    qd.View.prototype.polygon = function (points) {
        return new qd.VectorGraphic(new qd.Shape(this, points), this._polygonTracer);
    };

    qd.View.prototype.quadraticCurve = function (points) {
        return new qd.VectorGraphic(new qd.Shape(this, points), this._quadraticCurveTracer);
    };

    qd.View.prototype.closedQuadraticCurve = function (points) {
        return new qd.VectorGraphic(new qd.Shape(this, points), this._closedQuadraticCurveTracer);
    };

    qd.View.prototype.cubicBezier = function (points) {

    };

    qd.View.prototype.sprite = function (source, onload) {
        var sprite = new qd.Sprite(this, source);
        sprite.load(onload);
        return sprite;
    };
}(qd));
