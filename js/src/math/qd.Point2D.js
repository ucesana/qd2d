(function (qd) {

    /**
     * TODO: Should be able to use "instanceof"
     * TODO: Consider wrapping canvas coordinates into the same point (might be confusing and unnecessary)
     * TODO: Points and Vectors are the same thing. We can remove duplication by treating both as points.
     *
     * @type {Object}
     */
    qd.Point2D = {

        ORIGIN: qd.Tuple.create(0, 0),

        /**
         * Create a point.
         *
         * @param {Number?} x
         * @param {Number?} y
         */
        create: function (x, y) {
            return qd.Tuple.create(x || 0.0, y || 0.0);
        },

        /**
         * Set the coordinate of the point {@code a}.
         *
         * @param {qd.Point2D} out
         * @param {Number} x
         * @param {Number} y
         * @return {qd.Point2D} out
         */
        set: function (out, x, y) {
            out[0] = x;
            out[1] = y;
            return out;
        },

        /**
         * Copy a point.
         *
         * @param {qd.Point2D} out
         * @param {qd.Point2D} point to copy
         * @return {qd.Point2D} out
         */
        copy: function (out, point) {
            out[0] = point[0];
            out[1] = point[1];
            return out;
        },

        /**
         * Copy points in array.
         *
         * @param {Array} out
         * @param {Array} points
         * @return {Array} out
         */
        copyAll: function (out, points) {
            var i;

            for (i = 0; i < points.length; i += 1) {
                this.copy(out[i], points[i]);
            }

            return out;
        },

        /**
         * Copy scalar values.
         *
         * @param out
         * @param x
         * @param y
         * @return {*}
         */
        copyScalar: function (out, x, y) {
            out[0] = x;
            out[1] = y;
            return this;
        },

        /**
         * Clone a point
         *
         * @param {qd.Point2D} point to clone
         * @return {qd.Point2D}
         */
        clone: function (point) {
            return this.create(point[0], point[1]);
        },

        /**
         * Clone the array.
         *
         * @param {Array} points
         * @return {Array} cloned points
         */
        cloneAll: function (points) {
            var i,
                out = new Array(points.length);

            for (i = 0; i < points.length; i += 1) {
                out[i] = this.clone(points[i]);
            }

            return out;
        },

        /**
         * Equality operator.
         *
         * @param {qd.Point2D} a
         * @param {qd.Point2D} b
         * @return {Boolean} true if a is equal to b, otherwise false
         */
        equals: function (a, b) {
            var i;

            if (a == null || b == null) {
                return false;
            }

            if (a === b) {
                return true;
            }

            if (a.length !== b.length) {
                return false;
            }

            for (i = 0; i < a.length; i += 1) {
                if (a[i] !== b[i]) {
                    return false;
                }
            }

            return true;
        },

        /**
         * Zero the point.
         *
         * @param {qd.Point2D} out
         * @return {qd.Point2D} point
         */
        mutateZero: function (out) {
            out[0] = 0;
            out[1] = 0;
            return out;
        },

        /**
         * Negate the {@code point}
         *
         * @param {qd.Point2D} out
         * @return {qd.Point2D} the negated point
         */
        mutateNegate: function (out) {
            out[0] = -out[0];
            out[1] = -out[1];
            return out;
        },

        /**
         * Scale the {@code point} by {@code (sx, sy)}.
         *
         * @param out
         * @param sx
         * @param sy
         * @return {qd.Point2D} point
         */
        mutateScale: function (out, sx, sy, origin) {
            var originX = origin[0] || 0.0,
                originY = origin[1] || 0.0;

            out[0] = (out[0] - originX) * sx + originX;
            out[1] = (out[1] - originY) * sy + originX;
            return out;
        },

        mutateInverseScale: function (out, sx, sy, origin) {
            var originX = origin[0] || 0.0,
                originY = origin[1] || 0.0;

            out[0] = (out[0] - originX) / sx + originX;
            out[1] = (out[1] - originY) / sy + originX;
            return out;
        },

        mutateAddScalar: function (out, s) {
            out[0] += s;
            out[1] += s;
            return out;
        },

        mutateSubtractScalar: function (out, s) {
            out[0] += s;
            out[1] += s;
            return out;
        },

        mutateMultiplyScalar: function (out, s) {
            out[0] *= s;
            out[1] *= s;
            return out;
        },

        mutateDivideScalar: function (out, s) {
            out[0] /= s;
            out[1] /= s;
            return out;
        },

        /**
         * Add the point {@code point} to {@code out} point.
         *
         * @param {qd.Point2D} out
         * @param {qd.Point2D} point
         * @return {qd.Point2D} out
         */
        mutateAdd: function (out, point) {
            out[0] = out[0] + point[0];
            out[1] = out[1] + point[1];
            return out;
        },

        /**
         * Subtract the point {@code point} from {@code out} point.
         *
         * @param {qd.Point2D} out
         * @param {qd.Point2D} point
         * @return {qd.Point2D} out
         */
        mutateSubtract: function (out, point) {
            out[0] = out[0] - point[0];
            out[1] = out[1] - point[1];
            return out;
        },

        /**
         * Project this point out to a distance of {@code length} starting from a point
         * and by the given {@code angle}.
         *
         * @param {qd.Point2D} out
         * @param {qd.Point2D} point
         * @param {Number} angle in degrees
         * @param {Number} length
         * @return {qd.Point2D} out
         */
        project: function (out, point, angle, length) {
            out[0] = (point[0] + qd.math.fasterCos(angle) * length);
            out[1] = (point[1] + qd.math.fasterSin(angle) * length);
            return out;
        },

        /**
         * Get the distance between {@code pointA} and {@code pointB}
         *
         * @param {qd.Point2D} pointA
         * @param {qd.Point2D} pointB
         * @return {Number} distance between {@code pointA} and {@code pointB}
         */
        distance: function (pointA, pointB) {
            var dx = pointB[0] - pointA[0],
                dy = pointB[1] - pointA[1];
            return Math.sqrt(dx * dx + dy * dy);
        },

        /**
         * Scale the point {@code a} by {@code (sx, sy)}.
         *
         * @param {qd.Point2D}out
         * @param {Number} sx
         * @param {Number} sy
         * @param {qd.Point2D} a
         * @return {qd.Point2D}
         */
        scale: function (out, sx, sy, a) {
            out[0] = a[0] * sx;
            out[1] = a[1] * sy;
            return out;
        },

        scaled: function (out, s) {
            out[0] = out[0] * s;
            out[1] = out[0] * s;
            return out;
        },

        /**
         * Apply the inverse scale to the point {@code a} by {@code (sx, sy)}.
         *
         * @param {qd.Point2D}out
         * @param {Number} sx
         * @param {Number} sy
         * @param {qd.Point2D} a
         * @return {qd.Point2D}
         */
        inverseScale: function (out, sx, sy, a) {
            out[0] = a[0] / sx;
            out[1] = a[1] / sy;
            return out;
        },

        /**
         * Multiply the point {@code a} by the scalar {@code s}.
         *
         * @param {qd.Point2D}out
         * @param {Number} sx
         * @param {Number} sy
         * @param {qd.Point2D} a
         * @return {qd.Point2D}
         */
        multiplyScalar: function (out, s, a) {
            out[0] = a[0] * s;
            out[1] = a[1] * s;
            return out;
        },

        /**
         * Divide the point {@code a} by the scalar {@code s}.
         *
         * @param {qd.Point2D}out
         * @param {Number} sx
         * @param {Number} sy
         * @param {qd.Point2D} a
         * @return {qd.Point2D}
         */
        divideScalar: function (out, s, a) {
            out[0] = a[0] / s;
            out[1] = a[1] / s;
            return out;
        },

        /**
         * Add points {@code pointA} and {@code pointB}.
         *
         * @param {qd.Point2D} out
         * @param {qd.Point2D} pointA
         * @param {qd.Point2D} pointB
         * @return {qd.Point2D} out
         */
        add: function (out, pointA, pointB) {
            out[0] = pointA[0] + pointB[0];
            out[1] = pointA[1] + pointB[1];
            return out;
        },

        /**
         * Subtract {@code pointB} from {@code pointA}.
         *
         * @param {qd.Point2D} out
         * @param {qd.Point2D} pointA
         * @param {qd.Point2D} pointB
         * @return {qd.Point2D} out
         */
        subtract: function (out, pointA, pointB) {
            out[0] = pointA[0] - pointB[0];
            out[1] = pointA[1] - pointB[1];
            return out;
        },

        /**
         * Move the {@code point} to position {@code (x, y)}.
         *
         * @param {qd.Point2D} point
         * @param {Number} x
         * @param {Number} y
         * @return {qd.Point2D} point
         */
        position: function (point, x, y) {
            point[0] = x;
            point[1] = y;
            return point;
        },

        /**
         * Move all the {@code points} to position {@code (x, y)}.
         *
         * @param {Array} points
         * @param {Number} x
         * @param {Number} y
         * @return {Array} points
         */
        positionAll: function (points, x, y) {
            var i,
                point;

            for (i = 0; i < points.length; i += 1) {
                point = points[i];
                point[0] = x;
                point[1] = y;
            }

            return points;
        },

        /**
         * Translate the {@code point) by {@code (dx, dy)}.
         *
         * @param {qd.Point2D} point
         * @param {Number} dx
         * @param {Number} dy
         * @return {qd.Point2D} point
         */
        translate: function (point, dx, dy) {
            point[0] = point[0] + dx;
            point[1] = point[1] + dy;
            return point;
        },

        /**
         * Translate all the {@code points) by {@code (dx, dy)}.
         *
         * @param {Array} points
         * @param dx
         * @param dy
         * @return {Array} points
         */
        translateAll: function (points, dx, dy) {
            var i,
                point;

            for (i = 0; i < points.length; i += 1) {
                point = points[i];
                point[0] += dx;
                point[1] += dy;
            }

            return points;
        },

        /**
         * Scale all the {@code points} by {@code (sx, sy)}.
         *
         * @param {Array} points
         * @param {Number} sx
         * @param {Number} sy
         * @return {Array} points
         */
        scaleAll: function (points, sx, sy, origin) {
            var i,
                point,
                originX = origin[0] || 0.0,
                originY = origin[1] || 0.0,
                dx,
                dy;

            for (i = 0; i < points.length; i += 1) {
                point = points[i];

                dx = point[0] - originX;
                dy = point[1] - originY;

                point[0] = (point[0] - originX) * sx + originX;
                point[1] = (point[1] - originY) * sy + originY;
            }

            return points;
        },

        /**
         * Skew the {@code point} by {@code (kx, ky)} with respect
         * to the {@code origin}.
         *
         * @param {qd.Point} point
         * @param {Number} kx
         * @param {Number} ky
         * @param {qd.Point} origin
         * @return {qd.Point} point
         */
        skew: function (point, kx, ky, origin) {
            var x,
                y,
                originX = origin[0] || 0.0,
                originY = origin[1] || 0.0;

            x = point[0] - originX;
            y = point[1] - originY;
            point[0] = (1 + kx * ky) * x + kx * y + originX;
            point[1] = ky * x + y + originY;

            return point;
        },

        /**
         * Skew all the {@code points} by {@code (kx, ky)} with respect
         * to the {@code origin}.
         *
         * @param {Array} points
         * @param {Number} kx
         * @param {Number} ky
         * @param {qd.Point} origin
         * @return {Array} points
         */
        skewAll: function (points, kx, ky, origin) {
            var i,
                point,
                x,
                y,
                originX = origin[0] || 0.0,
                originY = origin[1] || 0.0;

            for (i = 0; i < points.length; i += 1) {
                point = points[i];
                x = point[0] - originX;
                y = point[1] - originY;
                point[0] = (1 + kx * ky) * x + kx * y + originX;
                point[1] = ky * x + y + originY;
            }

            return points;
        },

        /**
         * Rotate the {@code point} around the {@code pivot} by
         * {@code angle} radians.
         *
         * @param {qd.Point2D} point
         * @param dtheta in radians
         * @param {qd.Point2D} pivot point to rotate around
         * @return {qd.Point2D} point
         */
        rotate: function (point, dtheta, pivot) {
            var cos = Math.cos(dtheta),
                sin = Math.sin(dtheta),
                x,
                y,
                pivotX = pivot[0] || 0.0,
                pivotY = pivot[1] || 0.0;

            x = point[0] - pivotX;
            y = point[1] - pivotY;
            point[0] = x * cos + y * sin + pivotX;
            point[1] = -x * sin + y * cos + pivotY;

            return point;
        },

        /**
         * Rotate all the {@code points} around the {@code pivot} by
         * {@code angle} radians.
         *
         * @param {Array} points
         * @param {Number} dtheta in radians
         * @param {qd.Point2D} pivot point to rotate around
         * @return {Array} points
         */
        rotateAll: function (points, dtheta, pivot) {
            var i,
                point,
                cos = Math.cos(dtheta),
                sin = Math.sin(dtheta),
                x,
                y,
                pivotX = pivot[0] || 0.0,
                pivotY = pivot[1] || 0.0;

            for (i = 0; i < points.length; i += 1) {
                point = points[i];
                x = point[0] - pivotX;
                y = point[1] - pivotY;
                point[0] = x * cos + y * sin + pivotX;
                point[1] = -x * sin + y * cos + pivotY;
            }

            return points;
        },

        /**
         * Rotate the {@code point} around the {@code pivot} by
         * {@code angle} radians, then translate by {@code (dx, dy)}.
         *
         * @param {qd.Point2D} point
         * @param dtheta in radians
         * @param {qd.Point2D} pivot point to rotate around
         * @param {Number} dx translation along x-axis
         * @param {Number} dy translation along y-axis
         * @return {qd.Point2D} point
         */
        rotateAndTranslate: function (point, dtheta, pivot, dx, dy) {
            var cos = Math.cos(dtheta),
                sin = Math.sin(dtheta),
                x,
                y,
                pivotX = pivot[0] || 0.0,
                pivotY = pivot[1] || 0.0;

            x = point[0] - pivotX;
            y = point[1] - pivotY;
            point[0] = x * cos + y * sin + pivotX + dx;
            point[1] = -x * sin + y * cos + pivotY + dy;

            return point;
        },

        /**
         * Rotate all the {@code points} around the {@code pivot} by
         * {@code angle} radians, then translate by {@code (dx, dy)}.
         *
         * @param {Array} points
         * @param {Number} dtheta in radians
         * @param {qd.Point2D} pivot point to rotate around
         * @param {Number} dx translation along x-axis
         * @param {Number} dy translation along y-axis
         * @return {Array} points
         */
        rotateAndTranslateAll: function (points, dtheta, pivot, dx, dy) {
            var i,
                point,
                cos = Math.cos(dtheta),
                sin = Math.sin(dtheta),
                x,
                y,
                pivotX = pivot[0] || 0.0,
                pivotY = pivot[1] || 0.0;

            for (i = 0; i < points.length; i += 1) {
                point = points[i];
                x = point[0] - pivotX;
                y = point[1] - pivotY;
                point[0] = x * cos + y * sin + pivotX + dx;
                point[1] = -x * sin + y * cos + pivotY + dy;
            }

            return points;
        },

        /**
         * Reflect the {@code point} around the {@code line}
         * positioned at {@code linePos}.
         *
         * @param {qd.Point2D} point
         * @param {qd.Vector2D} line
         * @param {qd.Point2D} linePos
         * @return {qd.Point2D} point
         */
        reflect: function (point, line, linePos) {
            // TODO

            return point;
        },

        /**
         * Reflect all the {@code points} around the {@code line}
         * positioned at {@code linePos}.
         *
         * @param {Array} points
         * @param {qd.Vector2D} line
         * @param {qd.Point2D} linePos
         * @return {Array} points
         */
        reflectAll: function (points, line, linePos) {
            var i,
                point,
                x,
                y,
                lx,
                ly,
                lXSquared,
                lYSquared,
                twoLxLy,
                linePosX,
                linePosY;

            line = line.normalise();
            lx = line[0];
            ly = line[1];
            lXSquared = lx * lx;
            lYSquared = ly * ly;
            twoLxLy = 2 * lx * ly;

            linePosX = linePos[0] || 0.0;
            linePosY = linePos[1] || 0.0;

            for (i = 0; i < points.length; i += 1) {
                point = points[i];
                x = point[0] - linePosX;
                y = point[1] - linePosY;
                point[0] = (lXSquared - lYSquared) * x + (twoLxLy * y) + linePosX
                point[1] = (lYSquared - lXSquared) * y + (twoLxLy * x) + linePosY;
            }

            return points;
        },

        /**
         * Transform the {@code point} by the {@code matrix}.
         *
         * @param point
         * @param matrix
         * @return point
         */
        transform: function (point, matrix) {
            // TODO

            return point;
        }
    }

}(qd));
