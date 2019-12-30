(function (qd) {

    /**
     *
     * @param view
     * @param points
     * @constructor
     */
    qd.Shape = function (view, points) {
        this.init(view, points || []);
    };

    /* Private Methods */

    qd.Shape.prototype._updateAll = function () {
        this._updateCanvasCoordinates();
        this._updateEdgesAndNormals(); // TODO: Make a getter and do lazy evaulation (update when points modified)
        this._updateBounds();
    };

    qd.Shape.prototype._updateCanvasCoordinates = function () {
        qd.debug("Updating Shape Canvas Coordinates");

        this._view.canvasPoints(this._canvasPoints, this._worldPoints);
        this._canvasLineWidth = this._view.canvasLength(this._worldLineWidth);
    };

    qd.Shape.prototype._updateEdgesAndNormals = function () {
        qd.Vector2D.polygonEdgesAndNormals(this._worldEdges, this._worldNormals, this._worldPoints);
    };

    qd.Shape.prototype._updateBounds = function() {
        qd.debug("Updating Shape Bounds");

        this._bounds.resizeAsPolygon(this._worldPoints);
        // Cache centroid
        this._worldCentroid = this._bounds.centroid();
        this._canvasCentroid = this._view.canvasPoint(this._canvasCentroid, this._worldCentroid);
    };

    qd.Shape.prototype._winding = function () {
        return qd.math.polygonWindingSum(this._worldPoints);
    };

    /* Public Methods */

    qd.Shape.prototype.init = function (view, points) {
        this._view = view;

        this._worldPoints = qd.Point2D.cloneAll(points);
        this._canvasPoints = view.newCanvasPoints(points);

        this._worldLineWidth = qd.Styler.STYLES.LINE_WIDTH.DEFAULT;
        this._canvasLineWidth = this._view.canvasLength(this._worldLineWidth);

        this._worldEdges = qd.Vector2D.createArray(points.length, 0, 0);
        this._worldNormals = qd.Vector2D.createArray(points.length, 0, 0);

        this._updateEdgesAndNormals();

        this._bounds = new qd.BoundingBox().resizeAsPolygon(this._worldPoints);
        this._bounds._shape = this;

        this._worldCentroid = this._bounds.centroid();  // Cached
        this._canvasCentroid = this._view.canvasPoint(qd.Point2D.create(0, 0), this._worldCentroid);

        this._view.camera().onPanOrZoom(
            "qd.Camera.onPanOrZoom:qd.Shape._updateAll",
            this._updateAll, this);

        this._winding = this._winding();
    };

    qd.Shape.prototype.destroy = function () {
        this._worldCentroid = undefined;
        this._bounds.destroy();
        this._bounds = undefined;
        this._worldNormals = undefined;
        this._worldEdges = undefined;
        this._canvasLineWidth = undefined;
        this._worldLineWidth = undefined;
        this._canvasPoints = undefined;
        this._worldPoints = undefined;

        this._view.camera().offPanOrZoom(
            "qd.Camera.onPanOrZoom:qd.Shape._update",
            this._updateAll, this);
        this._view = undefined;
    };

    qd.Shape.prototype.clone = function () {
        var clone;

        qd.debug("Cloning " + this.toString());

        clone = new qd.Shape(this._view, this._worldPoints);
        clone._worldLineWidth = this._worldLineWidth;
        clone._canvasLineWidth = this._canvasLineWidth;

        return clone;
    };

    qd.Shape.prototype.bounds = function () {
        return this._bounds;
    };

    qd.Shape.prototype.points = function (points) {
        if (points) {
            this._worldPoints = qd.Point2D.cloneAll(points);
            this._winding = this._winding();
            this._updateAll();

            return this;
        }

        return qd.Point2D.cloneAll(this._worldPoints);
    };

    qd.Shape.prototype.point = function () {
        var args = new qd.Args(arguments),
            index,
            worldPoint;

        if (args.matches(qd.Tuple.TYPE)) {
            worldPoint = args.get(0);
            this.addPoint(worldPoint);
        } else if (args.matches(Number, qd.Tuple.TYPE)) {
            index = args.get(0);
            worldPoint = args.get(1);
            this.modifyPoint(index, worldPoint[0], worldPoint[1]);
        } else if (args.matches(Number)) {
            worldPoint = this._worldPoints[args.get(0)];
            return qd.Point2D.clone(worldPoint);
        }

        return this;
    };

    qd.Shape.prototype.addPoint = function (point) {
        var worldPoint = qd.Point2D.clone(point),
            canvasPoint = this._view.canvasPoint(qd.Point2D.create(0, 0), point);

        this._worldPoints.push(worldPoint);
        this._canvasPoints.push(canvasPoint);
        this._updateEdgesAndNormals();
        this._updateBounds();

        return this;
    };

    qd.Shape.prototype.modifyPoint = function (index, x, y) {
        var worldVertex = this._worldPoints[index],
            canvasVertex = this._canvasPoints[index];

        worldVertex[0] = x;
        worldVertex[1] = y;

        this._view.canvasPoint(canvasVertex, worldVertex);
        this._updateEdgesAndNormals();
        this._updateBounds();

        return this;
    };

    qd.Shape.prototype.translatePoint = function (index, dx, dy) {
        var worldVertex = this._worldPoints[index],
            canvasVertex = this._canvasPoints[index];

        worldVertex[0] += dx;
        worldVertex[1] += dy;

        this._view.canvasPoint(canvasVertex, worldVertex);
        this._updateEdgesAndNormals();
        this._updateBounds();

        return this;
    };

    qd.Shape.prototype.pointCount = function () {
        return this._worldPoints.length;
    };

    qd.Shape.prototype.firstPoint = function (point) {
        if (point) {
            this.modifyPoint(0, point[0], point[1]);
            return this;
        }

        return qd.Point2D.clone(this._worldPoints[0]);
    };

    qd.Shape.prototype.lastPoint = function (point) {
        if (point) {
            this.modifyPoint(this._worldPoints.length - 1, point[0], point[1]);
            return this;
        }

        return qd.Point2D.clone(this._worldPoints[this._worldPoints.length - 1]);
    };

    qd.Shape.prototype.worldLineWidth = function (worldLineWidth) {
        if (qd.isDefinedAndNotNull(worldLineWidth)) {
            this._worldLineWidth = worldLineWidth;
            this._canvasLineWidth = this._view.canvasLength(worldLineWidth);
            return this;
        }

        return this._worldLineWidth;
    };

    qd.Shape.prototype.bounds = function () {
        return this._bounds;
    };

    qd.Shape.prototype.position = function (x, y, origin) {
        var centroid = origin || this._worldCentroid,
            dx = x - centroid[0],
            dy = y - centroid[1];

        this.translate(dx, dy);
    };

    qd.Shape.prototype.translate = function (dx, dy) {
        qd.debug("Translating Shape")
        qd.Point2D.translateAll(this._worldPoints, dx, dy);
        this._updateAll();
    };

    qd.Shape.prototype.scale = function (sx, sy, origin) {
        qd.Point2D.scaleAll(this._worldPoints, sx, sy, origin || this._worldCentroid);
        this._updateAll();
    };

    qd.Shape.prototype.skew = function (kx, ky, origin) {
        qd.Point2D.skewAll(this._worldPoints, kx, ky, origin || this._worldCentroid);
        this._updateAll();
    };

    qd.Shape.prototype.rotate = function (dtheta, origin) {
        qd.Point2D.rotateAll(this._worldPoints, dtheta, origin || this._worldCentroid);
        this._bounds.rotate(dtheta);
        this._updateAll();
    };

    qd.Shape.prototype.centroid = function () {
        return this._worldCentroid;
    };

    qd.Shape.prototype.handles = function (handleSet) {
        var i,
            worldPoint,
            canvasPoint;

        for (i = 0; i < this._worldPoints.length; i += 1) {
            worldPoint = this._worldPoints[i];
            canvasPoint = this._canvasPoints[i];

            handleSet.handle(this, i, worldPoint, canvasPoint);
        }
    };

    qd.Shape.prototype.project = function (axis) {
        var points,
            min,
            max,
            i,
            projection,
            interval;

        points = this._worldPoints;

        min = qd.Vector2D.dot(axis, points[0]);
        max = min;

        for (i = 1; i < points.length; i += 1) {
            projection = qd.Vector2D.dot(axis, points[i]);

            if (projection < min) {
                min = projection;
            } else if (projection > max) {
                max = projection;
            }
        }

        interval = new qd.Interval(min, max);

        return interval;

    };

    qd.Shape.prototype.contactEdge = function (separationNormal) {
        var i,
            points,
            pointsCount,
            projection,
            maxProjection,
            supportIndex,
            supportPoint,
            nextIndex,
            previousIndex,
            nextPoint,
            nextEdge,
            previousPoint,
            previousEdge;

        // Get the shape's support point.
        // The support point is the point which has the largest projection
        // against the separation normal
        points = this._worldPoints;
        pointsCount = this._worldPoints.length;
        maxProjection = -Number.MAX_SAFE_INTEGER;
        supportIndex = 0;

        for (i = 0; i < pointsCount; i += 1) {
            projection = qd.Vector2D.dot(separationNormal, points[i]);

            if (projection > maxProjection) {
                maxProjection = projection;
                supportIndex = i;
            }
        }

        supportPoint = points[supportIndex];

        // Find the edge that is the most perpendicular to the separation normal
        // The edge that is most perpendicular to the normal will have a dot product closer to zero

        previousIndex = (supportIndex - 1 >= 0) ? supportIndex - 1 : pointsCount - 1;
        nextIndex = (supportIndex + 1 < pointsCount) ? supportIndex + 1 : 0;

        previousPoint = points[previousIndex];
        nextPoint = points[nextIndex];

        // Both edges must point towards the support point.
        // If one doesn’t that edge may always be used since its pointing in the negative direction
        // and the other is pointing in the positive direction.
        previousEdge = qd.Vector2D.subtract(qd.Vector2D.create(0, 0), supportPoint, previousPoint);
        nextEdge = qd.Vector2D.subtract(qd.Vector2D.create(0, 0), supportPoint, nextPoint);

        qd.Vector2D.mutateNormalise(nextEdge);
        qd.Vector2D.mutateNormalise(previousEdge);

        // Don't need to use absolute values here because both
        // next and previous vectors point towards the support point
        if (qd.Vector2D.dot(previousEdge, separationNormal)
            <= qd.Vector2D.dot(nextEdge, separationNormal)) {
            // Previous edge more perpendicular

            return {
                shape: this,
                pointA: previousPoint,
                pointB: supportPoint,
                supportPoint: supportPoint,
                direction: previousEdge
            };
        } else {
            // Next edge more perpendicular
            return {
                shape: this,
                pointA: supportPoint,
                pointB: nextPoint,
                supportPoint: supportPoint,
                direction: nextEdge
            };
        }
    };

    /**
     * The support point is the point in the shape that is farthest along the normal.
     *
     * @param {qd.Vector2D} normal
     * @return {qd.Point2D} the shape's support point
     */
    qd.Shape.prototype.supportPoint = function (normal) {
        var points = this._worldPoints,
            pointsCount = this._worldPoints.length,
            point,
            projection,
            maxProjection = -Number.MAX_SAFE_INTEGER,
            supportIndex,
            i;

        for (i = 0; i < pointsCount; i += 1) {
            point = points[i];
            projection = qd.Vector2D.dot(point, normal);

            if (projection > maxProjection) {
                maxProjection = projection;
                supportIndex = i;
            }
        }

        return points[supportIndex];
    };

    qd.Shape.prototype.clockwiseWinding = function () {
        return this._winding <= 0;
    };

    qd.Shape.prototype.antiClockwiseWinding = function () {
        return this._winding > 0;
    };

    qd.Shape.prototype.externalNormals = function () {
        return this._worldNormals;
    };

    qd.Shape.prototype.halve = function () {
        var i,
            worldPoints,
            canvasPoints,
            halvedWorldPoints,
            halvedCanvasPoints;

        if (this.pointCount() < 4) {
            return this;
        }

        worldPoints = this._worldPoints;
        canvasPoints = this._worldPoints;
        halvedWorldPoints = [];
        halvedCanvasPoints = [];

        for (i = 0; i < worldPoints.length; i += 2) {
            halvedWorldPoints.push(worldPoints[i]);
            halvedCanvasPoints.push(canvasPoints[i]);
        }

        this._worldPoints = halvedWorldPoints;
        this._canvasPoints = halvedCanvasPoints;

        return this;
    };

    qd.Shape.prototype.double = function () {
        var i,
            worldPoints,
            canvasPoints,
            doubleWorldPoints,
            doubleCanvasPoints,
            worldPoint,
            nextWorldPoint,
            lerpWorldPoint,
            canvasPoint,
            nextCanvasPoint,
            lerpCanvasPoint;

        if (this.pointCount() < 2) {
            return this;
        }

        worldPoints = this._worldPoints;
        canvasPoints = this._canvasPoints;
        doubleWorldPoints = [];
        doubleCanvasPoints = [];

        for (i = 0; i < worldPoints.length - 1; i += 1) {
            worldPoint = worldPoints[i];
            nextWorldPoint = worldPoints[i + 1];
            lerpWorldPoint = qd.math.lerpPoint2D(
                qd.Point2D.create(0, 0), worldPoint, nextWorldPoint, 0.5);

            doubleWorldPoints.push(worldPoint);
            doubleWorldPoints.push(lerpWorldPoint);
            doubleWorldPoints.push(nextWorldPoint);

            canvasPoint = canvasPoints[i];
            nextCanvasPoint = canvasPoints[i + 1];
            lerpCanvasPoint = qd.math.lerpPoint2D(
                qd.Point2D.create(0, 0), canvasPoint, nextCanvasPoint, 0.5);

            doubleCanvasPoints.push(canvasPoint);
            doubleCanvasPoints.push(lerpCanvasPoint);
            doubleCanvasPoints.push(nextCanvasPoint);
        }

        this._worldPoints = doubleWorldPoints;
        this._canvasPoints = doubleCanvasPoints;

        return this;
    };

    qd.Shape.prototype.toString = function () {
        return "Shape";
    };

}(qd));
