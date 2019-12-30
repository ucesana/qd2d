(function (qd) {

    /**
     * Canvas is a wrapper for HTMLCanvasElement and its CanvasRenderingContext2D.
     *
     * It provides proxy functions for most rendering operations.
     *
     * @param {Object} settings
     */
    var Canvas = function (settings) {
        this.init(settings);
    };

    /** Private Methods */

    Canvas.prototype._parseCanvasElement = function (canvas) {
        var canvasElem = null;

        if (typeof canvas === "string") {
            canvasElem = qd.getElementById(canvas);
        } else if (canvas instanceof HTMLCanvasElement) {
            canvasElem = canvas;
        } else {
            throw new Error("Failed to create the Canvas because cannot find the HTMLCanvasElement.")
        }

        return canvasElem;
    };

    Canvas.prototype._getContext2D = function (canvasElem) {
        var ctx = canvasElem.getContext("2d");

        if (qd.isUndefinedOrNull(ctx)) {
            throw new Error("2D Canvas not supported.")
        }

        return ctx;
    };

    /** Public Methods */

    /**
     * Default initialisation function.
     *
     * @param {Object} settings
     */
    Canvas.prototype.init = function (settings) {
        this._settings = qd.mergeProperties({
            canvas: "canvas"
        }, settings || {});
        this._canvas = this._parseCanvasElement(this._settings.canvas);
        this._ctx = this._getContext2D(this._canvas);
        this._styler = qd.Styler.defaultStyler();
        this._view = new qd.View(this._canvas.width, this._canvas.height);

        if (qd.isDefinedAndNotNull(this._settings.width)) {
            this._canvas.setAttribute("width", this._settings.width);
        }
        if (qd.isDefinedAndNotNull(this._settings.height)) {
            this._canvas.setAttribute("height", this._settings.height);
        }

        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = (window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                function (callback) {
                    return window.setTimeout(callback, 1000 / 60);
                });
        }

        if (!window.cancelRequestAnimationFrame) {
            //noinspection JSUnresolvedVariable
            window.cancelRequestAnimationFrame = (window.cancelAnimationFrame ||
                window.webkitCancelRequestAnimationFrame ||
                window.mozCancelRequestAnimationFrame ||
                window.msCancelRequestAnimationFrame ||
                window.oCancelRequestAnimationFrame ||
                window.clearTimeout);
        }
    };

    Canvas.prototype.view = function () {
        this._view.canvas(this);
        return this._view;
    };

    /**
     * Get the CanvasRenderingContext2D.
     *
     * @return {CanvasRenderingContext2D} the CanvasRenderingContext2D
     */
    Canvas.prototype.context = function () {
        return this._ctx;
    };

    /**
     * Clear all the graphics from the canvas area.
     *
     * {@param backgroundColour?}
     * @return {Canvas}
     */
    Canvas.prototype.clear = function (backgroundColour) {
        if (backgroundColour) {
            this._ctx.save();
            this._ctx.fillStyle = backgroundColour;
            this._ctx.rect(0, 0, this._canvas.width, this._canvas.height);
            this._ctx.fill();
            this._ctx.restore();
        } else {
            this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        }
        return this;
    };

    /**
     * Clear graphics in a rectangle.
     *
     * @param {Number} x
     * @param {Number} y
     * @param {Number} width
     * @param {Number} height
     * @return {Canvas}
     */
    Canvas.prototype.clearRectangle = function (x, y, width, height) {
        this._ctx.clearRect(x, y, width, height);
        return this;
    };

    /**
     * Get the x position of canvas area's centre point.
     *
     * @return {Number} centre x within the canvas width
     */
    Canvas.prototype.centreX = function () {
        return Math.floor(this._canvas.width / 2);
    };

    /**
     * Get the y position of canvas area's centre point.
     *
     * @return {Number} centre y within the canvas height
     */
    Canvas.prototype.centreY = function () {
        return Math.floor(this._canvas.height / 2);
    };

    /**
     * Get the canvas area's centre point.
     *
     * @return {qd.Point2D}
     */
    Canvas.prototype.centre = function () {
        return qd.Point2D.create(this.centreX(), this.centreY());
    };

    /**
     * Get the x position of a random point in the canvas area.
     *
     * @return {Number} random x within the canvas width
     */
    Canvas.prototype.randomX = function () {
        return Math.floor(Math.random() * this._canvas.width);
    };

    /**
     * Get the y position of a random point in the canvas area.
     *
     * @return {Number} random y within the canvas height
     */
    Canvas.prototype.randomY = function () {
        return Math.floor(Math.random() * this._canvas.height);
    };

    /**
     * Get a random point in the canvas.
     *
     * @return {qd.Point2D} random point within the canvas
     */
    Canvas.prototype.randomPoint = function () {
        return qd.Point2D.create(this.randomX(), this.randomY());
    };

    Canvas.prototype.resize = function (width, height) {
        this._canvas.setAttribute("width", width);
        this._canvas.setAttribute("height", height);
        return this;
    };

    /**
     * Get the canvas width.
     *
     * @return {Number}
     */
    Canvas.prototype.width = function () {
        return this._canvas.width;
    };

    /**
     * Get the canvas height.
     *
     * @return {Number}
     */
    Canvas.prototype.height = function () {
        return this._canvas.height;
    };

    /**
     * Begin tracing paths to the canvas.
     *
     * @return {Canvas}
     */
    Canvas.prototype.path = function () {
        this._ctx.beginPath();
        return this;
    };

    /**
     * Start tracing a path at the {@code point}.
     *
     * @param {qd.Point2D} point
     * @return {Canvas}
     */
    Canvas.prototype.moveTo = function (point) {
        this._ctx.moveTo(point[0], point[1]);
        return this;
    };

    /**
     * Trace a line path to {@code point}.
     *
     * @param {qd.Point2D} point
     * @return {Canvas}
     */
    Canvas.prototype.lineTo = function (point) {
        this._ctx.lineTo(point[0], point[1]);
        return this;
    };

    /**
     * Trace a line path from coordinates {@code (x0, y0)} to {@code (x1, y1)}.
     *
     * @param {Number} x0
     * @param {Number} y0
     * @param {Number} x1
     * @param {Number} y1
     * @return {Canvas}
     */
    Canvas.prototype.traceLine = function (x0, y0, x1, y1) {
        var ctx = this._ctx;
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        return this;
    };

    Canvas.prototype.traceTriangle = function (v0, v1, v2) {
        var ctx = this._ctx;
        ctx.moveTo(v0[0], v0[1]);
        ctx.lineTo(v1[0], v1[1]);
        ctx.lineTo(v2[0], v2[1]);
        ctx.lineTo(v0[0], v0[1]);
        ctx.closePath();
        return this;
    };

    /**
     * Trace a rectangle path.
     *
     * @param {Number} x
     * @param {Number} y
     * @param {Number} width
     * @param {Number} height
     * @return {Canvas}
     */
    Canvas.prototype.traceRectangle = function (x, y, width, height) {
        this._ctx.rect(x, y, width, height);
        return this;
    };

    Canvas.prototype.traceRectangle2 = function (x0, y0, x1, y1) {
        this._ctx.rect(x0, y0, (x1 - x0), (y1 - y0));
        return this;
    };

    /**
     * Trace a circular arc path.
     *
     * @param {Number} x
     * @param {Number} y
     * @param {Number} radius
     * @param {Number} startAngle
     * @param {Number} endAngle
     * @param {Boolean} anticlockwise
     * @return {Canvas}
     */
    Canvas.prototype.traceCircularArc = function (x, y, radius, startAngle, endAngle, anticlockwise) {
        this._ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
        return this;
    };

    /**
     * Draw a circle positioned at (x, y) with the specified radius.
     *
     * @param {Number} x
     * @param {Number} y
     * @param {Number} radius
     * @return {Canvas}
     */
    Canvas.prototype.traceCircle = function (x, y, radius) {
        this._ctx.arc(x, y, radius, 0, qd.math.TAU, true);
        return this;
    };

    /**
     * Trace an ellipse.
     *
     * @param {Number} x
     * @param {Number} y
     * @param {Number} radiusX
     * @param {Number} radiusY
     * @param {Number} rotation
     * @param {Number} startAngle
     * @param {Number} endAngle
     * @param {Boolean} anticlockwise
     * @return {Canvas}
     */
    Canvas.prototype.traceEllipse = function (x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
        this._ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
        return this;
    };

    /**
     * Trace an ellipse path using four sets of bezier curves, one for each quadrant of the unit circle.
     *
     * {@code points} must contain exactly 13 points:
     *   - The first point is the starting point
     *   - Four sets of three points, each of which describe a bezier curve
     *
     *  Each set of three points contain:
     *    - Two control points
     *    - A terminal point
     *
     * @param {Array} points
     * @return {Canvas}
     */
    Canvas.prototype.traceEllipseAsBezierCurves = function (points) {
        // Ellipse code taken from: http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas
        var ctx = this._ctx,
            p0,

            q1cp1,
            q1cp2,
            q1p,

            q2cp1,
            q2cp2,
            q2p,

            q3cp1,
            q3cp2,
            q3p,

            q4cp1,
            q4cp2,
            q4p;

        if (points.length !== 13) {
            return this;
        }

        p0 = points[0];

        q1cp1 = points[1];
        q1cp2 = points[2];
        q1p = points[3];

        q2cp1 = points[4];
        q2cp2 = points[5];
        q2p = points[6];

        q3cp1 = points[7];
        q3cp2 = points[8];
        q3p = points[9];

        q4cp1 = points[10];
        q4cp2 = points[11];
        q4p = points[12];

        ctx.moveTo(p0[0], p0[1]);
        ctx.bezierCurveTo(q1cp1[0], q1cp1[1], q1cp2[0], q1cp2[1], q1p[0], q1p[1]);
        ctx.bezierCurveTo(q2cp1[0], q2cp1[1], q2cp2[0], q2cp2[1], q2p[0], q2p[1]);
        ctx.bezierCurveTo(q3cp1[0], q3cp1[1], q3cp2[0], q3cp2[1], q3p[0], q3p[1]);
        ctx.bezierCurveTo(q4cp1[0], q4cp1[1], q4cp2[0], q4cp2[1], q4p[0], q4p[1]);

        return this;
    };

    /**
     * Trace a polyline.
     *
     * @param {Array} points
     * @return {Canvas}
     */
    Canvas.prototype.tracePolyline = function (points) {
        var ctx = this._ctx,
            i,
            point = points[0];

        ctx.moveTo(point[0], point[1]);

        for (i = 1; i < points.length; i += 1) {
            point = points[i];
            ctx.lineTo(point[0], point[1]);
        }

        return this;
    };

    /**
     * Trace a polygon.
     *
     * @param {Array} points
     * @return {Canvas}
     */
    Canvas.prototype.tracePolygon = function (points) {
        var ctx = this._ctx,
            i,
            point = points[0];

        ctx.moveTo(point[0], point[1]);

        for (i = 1; i < points.length; i += 1) {
            point = points[i];
            ctx.lineTo(point[0], point[1]);
        }

        ctx.closePath();

        return this;
    };

    /**
     * Trace a quadratic curve.
     *
     * @param {Number} x0
     * @param {Number} y0
     * @param {Number} cpx
     * @param {Number} cpy
     * @param {Number} x1
     * @param {Number} y1
     * @return {Canvas}
     */
    Canvas.prototype.traceQuadratic = function (x0, y0, cpx, cpy, x1, y1) {
        var ctx = this._ctx;

        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(cpx, cpy, x1, y1);
        return this;
    };

    /**
     * Trace open quadratic curve using points.
     *
     * @param {Array} points must have a length of at least four points
     * @return {Canvas}
     */
    Canvas.prototype.traceQuadraticCurve = function (points) {
        var ctx = this._ctx,
            point,
            i,
            nextPoint,
            ctrlPointX,
            ctrlPointY;

        if (points.length < 3) {
            return this;
        }

        //move to the first point
        point = points[0];
        ctx.moveTo(point[0], point[1]);

        //curve through the rest, stopping at each midpoint
        for (i = 1; i < points.length - 2; i += 1) {
            point = points[i];
            nextPoint = points[i + 1];

            ctrlPointX = (point[0] + nextPoint[0]) * 0.5;
            ctrlPointY = (point[1] + nextPoint[1]) * 0.5;
            ctx.quadraticCurveTo(point[0], point[1], ctrlPointX, ctrlPointY);
        }

        //curve through the last two points
        point = points[i];
        nextPoint = points[i + 1];
        ctx.quadraticCurveTo(point[0], point[1], nextPoint[0], nextPoint[1]);

        return this;
    };

    /**
     * Trace a closed quadratic curve path using points.
     *
     * @param {Array} points
     * @return {Canvas}
     */
    Canvas.prototype.traceClosedQuadraticCurve = function (points) {
        var ctx = this._ctx,
            ctrlPoint1,
            ctrlPoint,
            i,
            numPoints,
            point;

        if (points.length < 3) {
            return this;
        }

        ctrlPoint1 = qd.Point2D.create(0, 0);
        ctrlPoint = qd.Point2D.create(0, 0);
        numPoints = points.length;

        //find the first midpoint and move to it
        ctrlPoint1[0] = (points[0][0] + points[numPoints - 1][0]) / 2;
        ctrlPoint1[1] = (points[0][1] + points[numPoints - 1][1]) / 2;
        ctx.moveTo(ctrlPoint1[0], ctrlPoint1[1]);

        //curve through the rest, stopping at each midpoint
        for (i = 0; i < numPoints - 1; i += 1) {
            point = points[i];
            ctrlPoint[0] = (point[0] + points[i + 1][0]) / 2;
            ctrlPoint[1] = (point[1] + points[i + 1][1]) / 2;
            ctx.quadraticCurveTo(point[0], point[1], ctrlPoint[0], ctrlPoint[1]);
        }
        //curve through the last point, back to the first midpoint
        point = points[i];
        ctx.quadraticCurveTo(point[0], point[1], ctrlPoint1[0], ctrlPoint1[1]);

        return this;
    };

    /**
     * Trace a bezier curve.
     *
     * @param {Number} x0
     * @param {Number} y0
     * @param {Number} cp1x
     * @param {Number} cp1y
     * @param {Number} cp2x
     * @param {Number} cp2y
     * @param {Number} x1
     * @param {Number} y1
     * @return {Canvas}
     */
    Canvas.traceBezier = function (x0, y0, cp1x, cp1y, cp2x, cp2y, x1, y1) {
        var ctx = this._ctx;

        ctx.moveTo(x0, y0);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x1, y1);
        return this;
    };

    /**
     * Trace bezier curve using points.
     *
     * @param {Array} points
     * @return {Canvas}
     */
    Canvas.prototype.traceBezierCurve = function (points) {
        var ctx = this._ctx;

        // TODO

        //ctx.moveTo(x0, y0);
        //ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x1, y1);
        return this;
    };

    /**
     * Trace a closed bezier curve using points.
     * @param {Array} points
     * @return {Canvas}
     */
    Canvas.prototype.traceClosedBezierCurve = function (points) {
        // TODO
    };

    /**
     * Not thread safe.
     *
     * @param origin
     * @param direction
     * @param style
     * @return {*}
     */
    Canvas.prototype.traceArrow = function (origin, direction, style) {
        var model = Canvas.prototype.arrow.model,

            arrowWidth = (style) ? style.arrowWidth : STYLES.ARROW_WIDTH.DEFAULT,
            arrowHalfWidth = arrowWidth * 0.5,

            tip = qd.Point2D.add(model.tip, origin, direction),
            end = origin,
            base = qd.math.lerpPoint2DByDistance(model.base, tip, end, arrowWidth),
            right = qd.math.perpendicularByDistance(model.right, end, base, -arrowHalfWidth),
            left = qd.math.perpendicularByDistance(model.left, end, base, arrowHalfWidth),

            tipX = tip[0],
            tipY = tip[1];

        this.traceLine(end[0], end[1], tip[0], tip[1]);
        this.traceLine(tipX, tipY, right[0], right[1]);
        this.traceLine(tipX, tipY, left[0], left[1]);

        return this;
    };

    Canvas.prototype.traceArrow.model = {
        tip: qd.Point2D.create(0, 0),
        base: qd.Point2D.create(0, 0),
        right: qd.Point2D.create(0, 0),
        left: qd.Point2D.create(0, 0)
    };

    /**
     * Trace an infinite grid starting at any arbitrary point (x, y).
     *
     * @param {Number} cellSize
     * @param {Number} x
     * @param {Number} y
     * @return {Canvas}
     */
    Canvas.prototype.grid = function (cellWidth, cellHeight, x, y) {
        var col,
            row,
            cols,
            rows,
            x0,
            y0,
            x1,
            y1,
            shiftX,
            shiftY,
            marginWidth,
            marginHeight,
            canvasWidth,
            canvasHeight,
            margins;

        margins = 1;

        shiftX = x % cellWidth;
        shiftY = y % cellHeight;

        marginWidth = margins * cellWidth;
        marginHeight = margins * cellHeight;

        canvasWidth = this.width();
        canvasHeight = this.height();

        cols = Math.ceil(canvasWidth / cellWidth);
        rows = Math.ceil(canvasHeight / cellHeight);

        x0 = -marginWidth - shiftX;
        x1 = canvasWidth + marginWidth - shiftX;

        for (row = -margins; row < rows + margins; row += 1)  {
            y0 = y1 = row * cellHeight - shiftY;

            this.traceLine(x0, y0, x1, y1);
        }

        y0 = -marginHeight - shiftY;
        y1 = canvasHeight + marginHeight - shiftY;

        for (col = -margins; col < cols + margins; col += 1)  {
            x0 = x1 = col * cellWidth  - shiftX;

            this.traceLine(x0, y0, x1, y1);
        }

        return this;
    };

    Canvas.prototype.traceLinearGradient = function (x1, y1, x2, y2) {
        // TODO: return Gradient
        return this._ctx.createLinearGradient(x1, y1, x2, y2);
    };

    Canvas.prototype.traceRadialGradient = function (x1, y1, r1, x2, y2, r2) {
        // TODO: return Gradient
        return this._ctx.createRadialGradient(x1, y1, r1, x2, y2, r2);
    };

    Canvas.prototype.tracePattern = function (image, type) {
        // TODO: return Pattern
        return this._ctx.createPattern(image, type);
    };

    Canvas.prototype.style = function (styleName, styleValue) {
        this._styler.style(styleName, styleValue);
        return this;
    };

    Canvas.prototype.styles = function (styles) {
        this._styler.styles(styles);
        return this;
    };

    Canvas.prototype.clearStyles = function () {
        this._styler.clear();
        return this;
    };

    Canvas.prototype.resetDefaultStyles = function () {
        this._styler.resetDefaults();
        return this;
    };

    Canvas.prototype.draw = function (styles) {
        var ctx = this._ctx;
        if (styles != null) {
            // apply one-off custom styles
            var customStyler = new qd.Styler(styles);
            customStyler.apply(ctx);
        } else {
            // apply current styles
            this._styler.apply(ctx);
        }
        return this;
    };

    Canvas.prototype.image = function (image, x, y, width, height) {
        this._ctx.drawImage(image, x, y, width, height);
    };

    Canvas.prototype.text = function (text, x, y, styles, maxWidth) {
        // TODO: Complete
        var ctx = this._ctx,
            stroke = false,
            fill = false,
            fontSize = null,
            fontFamily = null;

        ctx.save();

        qd.eachProperty(styles, function (style, value) {
            switch (style) {
                case "stroke":
                case "strokeColour":
                    if (value === "" || value === "transparent") {
                        stroke = false;
                    } else {
                        ctx.strokeStyle = value;
                        stroke = true;
                    }
                    break;
                case "fill":
                case "fillColour":
                    if (value === "" || value === "transparent") {
                        fill = false;
                    } else {
                        ctx.fillStyle = value;
                        fill = true;
                    }
                    break;
                case "fontSize":
                    fontSize = value;
                    break;
                case "fontFamily":
                    fontFamily = value;
                    break;

                default:
                    ctx[style] = value;
            }
        });

        ctx.font = qd.defaultValue(fontSize, STYLES.FONT_SIZE.DEFAULT)
            + " "
            + qd.defaultValue(fontFamily, STYLES.FONT_FAMILY.DEFAULT);

        if (fill) {
            ctx.fillText(text, x, y, maxWidth);
        }

        if (stroke) {
            ctx.strokeText(text, x, y, maxWidth);
        }

        ctx.restore();

        return this;
    };

    Canvas.prototype.measureText = function (text) {
        return this._ctx.measureText(text);
    };

    Canvas.prototype.toImage = function (mimeType) {
        return this._canvas.toDataURL(mimeType || "image/png");
    };

    Canvas.prototype.onFrame = function () {

    };

    Canvas.prototype.run = function () {
        var canvas = this;
        canvas._previousSeconds = Date.now();
        function frame() {
            canvas._frameRequest = window.requestAnimationFrame(frame);
            var currentSeconds = Date.now();
            var elapsedSeconds = (currentSeconds - canvas._previousSeconds);
            canvas._previousSeconds = currentSeconds;
            canvas.onFrame(elapsedSeconds);
        }
        frame();
    };

    qd.Canvas = Canvas;

}(qd));
