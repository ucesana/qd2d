(function (qd) {

    /**
     * @constructor
     *
     * TODO: Refactor:
     *   - Rename to MinMaxBox.
     *   - Rename topLeft and bottomRight to min and max respectively.
     *   - Change contructor to accept any number of points. Zero points = origin.
     *   - MinMaxBox is a type of Bounds
     *   - Other types of Bounds include Circles and Convex Polygons
     *
     * TODO: Consider renaming qd.Shape back to qd.Path. qd.Path is for drawing and user manipulation.
     *   Changes to the path change the bounds. qd.Body2D directly uses and manipulates the bounds.
     *   Instead of the qd.Entity inspecting the qd.Body2D for position changes, the qd.Bod2D should
     *   have the responsibility to updating the bounds. This means every Path/Graphic also has an
     *   associated body. An entity is comprised of multiple Path/Graphic-Body/Bounds.
     *   Bodies and Graphics can move around and change within the entity. The entity is just a
     *   complex body/graphic that the user can interact with (dragging, changing graphics and body
     *   properties, etc).
     *   The Bounds is a representation of the Shape. It links to the Shape/Path?
     *
     *   Consider renaming Bounds to Boundary. It better expresses the shape.
     *
     */
    qd.BoundingBox = function (view) {
        this._min = qd.Point2D.create(0, 0);
        this._max = qd.Point2D.create(0, 0);
        this._centroid = qd.Point2D.create(0, 0);

        this._resizeEvent = new qd.EventTrigger();

        if (view) {
            this._shape = new qd.Shape(view, [this._min, this._max]);
        }
    };

    qd.BoundingBox.prototype.init = function (minX, minY, maxX, maxY) {
        return this.resize(minX || 0, minY || 0, maxX || 0, maxY || 0);
    };

    qd.BoundingBox.prototype.destroy = function () {
        this._resizeEvent.destroy();
        this._centroid = undefined;
        this._max = undefined;
        this._min = undefined;
    };

    qd.BoundingBox.prototype.resize = function (minX, minY, maxX, maxY) {
        this._min[0] = minX;
        this._min[1] = minY;
        this._max[0] = maxX;
        this._max[1] = maxY;

        this._width = Math.abs(maxX - minX);
        this._height = Math.abs(maxY - minY);

        this._halfWidth = (this._width * 0.5);
        this._halfHeight = (this._height * 0.5);

        this._radius = Math.max(this._halfWidth, this._halfHeight);

        this._centroid[0] = qd.math.lerp(minX, maxX, 0.5);
        this._centroid[1] = qd.math.lerp(minY, maxY, 0.5);

        this._angle = 0;  // radians

        qd.debug("Bounding Box firing Resize Event");
        this._resizeEvent.fire();

        return this;
    };

    qd.BoundingBox.prototype.resizeAsPolygon = function(points) {
        var i,
            point,
            minX,
            maxX,
            minY,
            maxY,
            x,
            y;

        if (points.length > 0) {
            point = points[0];
            minX = point[0];
            maxX = point[0];
            minY = point[1];
            maxY = point[1];

            for (i = 1; i < points.length; i += 1) {
                point = points[i];
                x = point[0];
                y = point[1];

                if (x < minX) {
                    minX = x;
                }

                if (x > maxX) {
                    maxX = x;
                }

                if (y < minY) {
                    minY = y;
                }

                if (y > maxY) {
                    maxY = y;
                }
            }

            this.resize(minX, minY, maxX, maxY);
        }

        return this;
    };

    qd.BoundingBox.prototype.clone = function () {
        return new qd.BoundingBox().init(this._min[0], this._min[1], this._max[0], this._max[1]);
    };

    qd.BoundingBox.prototype.min = function (min) {
        if (min) {
            this.resize(min[0], min[1], this._max[0], this._max[1]);
            return this;
        }

        return this._min;
    };

    qd.BoundingBox.prototype.max = function (max) {
        if (max) {
            this.resize(this._min[0], this._min[1], max[0], max[1]);
            return this;
        }

        return this._max;
    };

    qd.BoundingBox.prototype.left = function () {
        return this._min[0];
    };

    qd.BoundingBox.prototype.top = function () {
        return this._min[1];
    };

    qd.BoundingBox.prototype.right = function () {
        return this._max[0];
    };

    qd.BoundingBox.prototype.bottom = function () {
        return this._max[1];
    };

    qd.BoundingBox.prototype.centroid = function () {
        return qd.Point2D.clone(this._centroid);
    };

    qd.BoundingBox.prototype.centroidX = function () {
        return this._centroid[0];
    };

    qd.BoundingBox.prototype.centroidY = function () {
        return this._centroid[1];
    };

    qd.BoundingBox.prototype.angle = function () {
        return this._angle;
    };

    qd.BoundingBox.prototype.width = function () {
        return this._width;
    };

    qd.BoundingBox.prototype.halfHeight = function () {
        return this._halfHeight;
    };

    qd.BoundingBox.prototype.halfWidth = function () {
        return this._halfWidth;
    };

    qd.BoundingBox.prototype.height = function () {
        return this._height;
    };

    qd.BoundingBox.prototype.area = function () {
        return this._width * this._height;
    };

    qd.BoundingBox.prototype.radius = function () {
        return this._radius;
    };

    qd.BoundingBox.prototype.translate = function (dx, dy) {
        var min = this._min,
            max = this._max;

        this.resize(
            (min[0] + dx), (min[1] + dy),
            (max[0] + dx), (max[1] + dy));

        return this;
    };

    qd.BoundingBox.prototype.rotate = function (dtheta) {
        this._angle += dtheta;
    };

    qd.BoundingBox.prototype.hitTest = function (x, y) {
        var min = this._min,
            max = this._max;

       return !(x < min[0] ||
            x > max[0] ||
            y < min[1] ||
            y > max[1]);
    };

    qd.BoundingBox.prototype.boxOnBoxCollisionTest = function (bounds) {
        return this.boxCollisionTest(bounds._min, bounds._max);
    };

    qd.BoundingBox.prototype.boxCollisionTest = function (min, max) {
        var minA = this._min,
            maxA = this._max,
            leftA = minA[0],
            rightA = maxA[0],
            topA = minA[1],
            bottomA = maxA[1],

            leftB = min[0],
            rightB = max[0],
            topB = min[1],
            bottomB = max[1];

        return (leftA <= rightB &&
            leftB <= rightA &&
            topA <= bottomB &&
            topB <= bottomA);
    };

    qd.BoundingBox.prototype.circleOnCircleCollisionTest = function (bounds) {
        var centroidA = this._centroid,
            centroidB = bounds._centroid,
            minDistance = this._radius + bounds._radius,
            dx = centroidB[0] - centroidA[0],
            dy = centroidB[1] - centroidA[1];

        return minDistance * minDistance > ((dx * dx) + (dy * dy));
    };

    qd.BoundingBox.prototype.onResize = function (namespace, handler, context) {
        this._resizeEvent.bind(namespace, handler, context);
        return this;
    };

    qd.BoundingBox.prototype.offResize = function (namespace, handler, context) {
        this._resizeEvent.unbind(namespace, handler, context);
        return this;
    };

    qd.BoundingBox.prototype.drawCircle = function (canvas) {
        canvas.view()
            .path()
            .traceCircle(this._centroid[0], this._centroid[1], this._radius)
            .draw( { stroke: "blue" } );
    };

}(qd));
