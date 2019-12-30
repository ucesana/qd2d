(function (qd) {

    "use strict";

    /**
     * qd.Vector2D
     *
     * @module
     */
    qd.Vector2D = {

        /**
         * Create a vector with components {@code (x, y)}.
         *
         * @param {Number} x
         * @param {Number} y
         * @return {qd.Vector2D}
         */
        create: function (x, y) {
            return qd.Tuple.create(x || 0.0, y || 0.0);
        },

        /**
         * Set the direction of the vector {@code a}.
         *
         * @param {qd.Vector2D} out
         * @param {Number} x
         * @param {Number} y
         * @return {qd.Vector2D} out
         */
        set: function (out, x, y) {
            out[0] = x;
            out[1] = y;
            return out;
        },

        /**
         * Copy the vector {@code a}.
         *
         * @param {qd.Vector2D} out
         * @param {qd.Vector2D} a
         * @return {qd.Vector2D} out
         */
        copy: function (out, a) {
            out[0] = a[0];
            out[1] = a[1];
            return out;
        },

        /**
         * Clone the vector {@code a}.
         *
         * @param {qd.Vector2D} a
         * @return {qd.Vector2D} the cloned vector
         */
        clone: function (a) {
            return qd.Vector2D.create(a[0], a[1]);
        },

        /**
         * Equality operator.
         *
         * @param {qd.Vector2D} a
         * @param {qd.Vector2D} b
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
                if (!qd.math.equalish(a[i], b[i])) {
                    return false;
                }
            }

            return true;
        },

        /**
         * Create an array of qd.Vector2D vectors with the specified {@code length}.
         *
         * Each vector is initialised with  {@code initialX} and {@code initialY} components.
         *
         * @param {Number} length
         * @param {Number?} initialX
         * @param {Number?} initialY
         * @return {Array} array of qd.Vector2D vectors initialised
         *   with {@code initialX} and {@code initialY} components.
         */
        createArray: function (length, initialX, initialY) {
            var x,
                y,
                i,
                array = [];

            x = (initialX != null) ? initialX : 0;
            y = (initialY != null) ? initialY : 0;

            for (i = 0; i < length; i += 1) {
                array.push(qd.Vector2D.create(x, y));
            }

            return array;
        },

        /**
         * Zero the vector {@code out}.
         *
         * @param {qd.Vector2D} out
         * @return {qd.Vector2D} out
         */
        mutateZero: function (out) {
            out[0] = 0;
            out[1] = 0;

            return out;
        },

        /**
         * Negate the vector {@code out}.
         *
         * @param {qd.Vector2D} out
         * @return {qd.Vector2D} the negated vector
         */
        mutateNegate: function (out) {
            out[0] = -out[0];
            out[1] = -out[1];

            return out;
        },

        /**
         * Normalise the vector {@code out}.
         *
         * @param {qd.Vector2D} out
         * @return {qd.Vector2D} out
         */
        mutateNormalise: function (out) {
            var x = out[0],
                y = out[1],
                distanceSquared = (x * x) + (y * y),
                magnitude;

            if (distanceSquared === 0) {
                return out;
            }

            magnitude = 1 / Math.sqrt(distanceSquared);

            out[0] = (x * magnitude);
            out[1] = (y * magnitude);

            return out;
        },

        /**
         * Multiply the vector {@code out} by the scalar {@code s}.
         *
         * @param {qd.Vector2D} out
         * @param {Number} s
         * @return {qd.Vector2D} out
         */
        mutateScale: function (out, s) {
            out[0] *= s;
            out[1] *= s;

            return out;
        },

        /**
         * Divide the vector {@code out} by the scalar {@code s}.
         *
         * @param {qd.Vector2D} out
         * @param {Number} s
         * @return {qd.Vector2D} out
         */
        mutateInverseScale: function (out, s) {
            if (s === 0) {
                qd.error("error.divisionByZero");
            }

            out[0] /= s;
            out[1] /= s;

            return out;
        },

        /**
         * Add the vector {@code b} to {@code out} vector.
         *
         * @param {qd.Vector2D} out
         * @param {Number} b
         * @return {qd.Vector2D} out
         */
        mutateAdd: function (out, b) {
            out[0] += b[0];
            out[1] += b[1];

            return out;
        },

        /**
         * Subtract the vector {@code b} to {@code out} vector.
         *
         * @param {qd.Vector2D} out
         * @param {Number} b
         * @return {qd.Vector2D} a
         */
        mutateSubtract: function (out, b) {
            out[0] -= b[0];
            out[1] -= b[1];

            return out;
        },

        /**
         * Negate the vector {@code a}.
         *
         * @param {qd.Vector2D} out
         * @param {qd.Vector2D} a
         * @return {qd.Vector2D} the negated vector
         */
        negate: function (out, a) {
            out[0] = -a[0];
            out[1] = -a[1];

            return out;
        },

        /**
         * Normalise the vector {@code a}.
         *
         * @param {qd.Vector2D} out
         * @param {qd.Vector2D} a
         */
        normalise: function (out, a) {
            var x = a[0],
                y = a[1],
                distanceSquared = (x * x) + (y * y),
                magnitude;

            if (distanceSquared === 0) {
                return out;
            }

            magnitude = 1 / Math.sqrt(distanceSquared);

            out[0] = (x * magnitude);
            out[1] = (y * magnitude);

            return out;
        },

        /**
         * Multiply the vector {@code a} by the scalar {@code s}.
         *
         * @param {qd.Vector2D} out
         * @param {Number} s
         * @param {qd.Vector2D} a
         * @return {qd.Vector2D} out
         */
        scale: function (out, s, a) {
            out[0] = a[0] * s;
            out[1] = a[1] * s;
            return out;
        },

        /**
         * Divide the vector {@code a} by the scalar {@code s}
         *
         * @param {qd.Vector2D} out
         * @param {Number} s
         * @param {qd.Vector2D} a
         * @return {qd.Vector2D} out
         */
        inverseScale: function (out, s, a) {
            var inverseS;

            if (s === 0) {
                qd.error("error.divisionByZero");
            }

            inverseS = 1 / s;

            out[0] = a[0] * inverseS;
            out[1] = a[1] * inverseS;
            return out;
        },

        /**
         * Add vectors {@code a} and {@code b}.
         *
         * @param {qd.Vector2D} out
         * @param {qd.Vector2D} a
         * @param {qd.Vector2D} b
         * @return {qd.Vector2D} vector
         */
        add: function (out, a, b) {
            out[0] = a[0] + b[0];
            out[1] = a[1] + b[1];
            return out;
        },

        /**
         * Subtract vectors {@code a} and {@code b}.
         *
         * @param {qd.Vector2D} out
         * @param {qd.Vector2D} a
         * @param {qd.Vector2D} b
         * @return {qd.Vector2D} out
         */
        subtract: function (out, a, b) {
            out[0] = a[0] - b[0];
            out[1] = a[1] - b[1];
            return out;
        },

        /**
         * Get the magnitude of the vector {@code a}.
         *
         * @param {qd.Vector2D} a
         * @return {Number}
         */
        magnitude:function (a) {
            var x = a[0],
                y = a[1];

            return Math.sqrt((x * x) + (y * y));
        },

        /**
         * Get the magnitude squared of the vector {@code a}
         *
         * @param a
         * @return {Number}
         */
        magnitudeSquared: function (a) {
            var x = a[0],
                y = a[1];

            return (x * x) + (y * y);
        },

        /**
         * Get the dot product of vectors {@code a} and {@code b}.
         *
         * @param {qd.Vector2D} a
         * @param {qd.Vector2D} b
         * @return {Number} the magnitude of the dot product
         */
        dot: function (a, b) {
            return a[0] * b[0] + a[1] * b[1];
        },

        /**
         * Get the 2D cross product of vectors {@code a} and {@code b}.
         *
         * @param {qd.Vector2D} a
         * @param {qd.Vector2D} b
         * @return {Number} the magnitude of the cross product
         */
        cross: function (a, b) {
            return a[0] * b[1] - a[1] * b[0];
        },

        /**
         * Cross the scalar {@code s} with the vector {@code a}.
         *
         * @param {qd.Vector2D} out
         * @param {Number} s
         * @param {qd.Vector2D} a
         * @return {qd.Vector2D} out
         */
        scaleCross: function (out, s, a) {
            out[0] = s * a[1];
            out[1] = -s * a[0];

            return out;
        },

        /**
         * Cross the vector {@code a} with the scalar {@code s}.
         *
         * @param {qd.Vector2D} out
         * @param {qd.Vector2D} a
         * @param {Number} s
         * @return {qd.Vector2D} out
         */
        crossScale: function (out, a, s) {
            out[0] = -s * a[1];
            out[1] = s * a[0];

            return out;
        },

        /**
         * Get the un-normalised anti-clockwise perpendicular on the outer edge of vector {@code a}.
         *
         * @param {qd.Vector2D} out
         * @param {qd.Vector2D} a
         * @return {qd.Vector2D} out the un-normalised counter-clockwise perpendicular
         */
        antiClockwisePerpendicular: function (out, a) {
            out[0] = -a[1];
            out[1] = a[0];

            return out;
        },

        /**
         * Get the un-normalised clockwise perpendicular on the inner edge of vector {@code a}.
         *
         * @param {qd.Vector2D} out
         * @param {qd.Vector2D} a
         * @return {qd.Vector2D} out the un-normalised clockwise perpendicular
         */
        clockwisePerpendicular: function (out, a) {
            out[0] = a[1];
            out[1] = -a[0];

            return out;
        },

        /**
         * Get the normalised counter-clockwise normal on the outer edge of vector {@code a}.
         *
         * @param {qd.Vector2D} out
         * @param {qd.Vector2D} a
         * @return {qd.Vector2D} out the normalised counter-clockwise normal
         */
        antiClockwiseNormal: function (out, a) {
            var x = -a[1],
                y = a[0],
                distanceSquared = (x * x) + (y * y),
                magnitude;


            if (distanceSquared === 0) {
                qd.error("error.divisionByZero");
            }

            magnitude = 1 / Math.sqrt(distanceSquared);

            out[0] = (x * magnitude);
            out[1] = (y * magnitude);

            return out;
        },

        /**
         * Get the normalised clockwise normal on the inner edge of vector {@code a}.
         *
         * @param {qd.Vector2D} out
         * @param {qd.Vector2D} a
         * @return {qd.Vector2D} out the un-normalised clockwise normal
         */
        clockwiseNormal: function (out, a) {
            var x = a[1],
                y = -a[0],
                distanceSquared = (x * x) + (y * y),
                magnitude;

            if (distanceSquared === 0) {
                qd.error("error.divisionByZero");
            }

            magnitude = 1 / Math.sqrt(distanceSquared);

            out[0] = (x * magnitude);
            out[1] = (y * magnitude);

            return out;
        },

        /**
         * Creates an edge vector for each adjacent pair of points in {@code points} and
         * copies it to the corresponding index in edgesOut.
         *
         * This function will throw an error if the length of {@code edgesOut} is not
         * equal to the length of {@code points}.
         *
         * @param {Array} edgesOut an array of qd.Vector2D
         * @param {Array} points an array of qd.Point2D
         * @return {Array} edgesOut
         */
        polygonEdges: function (edgesOut, points) {
            var i,
                edgesLength,
                pointsLength,
                initialPoint,
                finalPoint;

            edgesLength = edgesOut.length;
            pointsLength = points.length;

            if (edgesLength !== pointsLength) {
                qd.error("error.arrayLengthMismatch");
            }

            for (i = 0; i < points.length; i += 1) {
                initialPoint = points[i];
                finalPoint = points[(i + 1 === pointsLength) ? 0 : i + 1];

                qd.Vector2D.subtract(edgesOut[i], finalPoint, initialPoint);
            }

            return edgesOut;

        },

        polygonEdgesAndNormals: function (edgesOut, normalsOut, points) {
            var i,
                edgesCount,
                normalsCount,
                pointsCount,
                windingSum,
                out,
                edge,
                normal,
                initialPoint,
                finalPoint;

            edgesCount = edgesOut.length;
            normalsCount = normalsOut.length;
            pointsCount = points.length;

            if (edgesCount !== pointsCount && normalsCount !== pointsCount) {
                qd.error("error.arrayLengthMismatch");
            }

            windingSum = qd.math.polygonWindingSum(points);

            out = { edges: edgesOut, normals: normalsOut };

            if (windingSum === 0) {
                // No edges, so early exit
                return out;
            }

            for (i = 0; i < pointsCount; i += 1) {
                edge = edgesOut[i];
                normal = normalsOut[i];

                initialPoint = points[i];
                finalPoint = points[(i + 1 === pointsCount) ? 0 : i + 1];

                // TODO: Need to set the coordinate system
                //   (in our case we are using canvas coordinate system)
                if (windingSum <= 0) {
                    // clockwise winding
                    qd.Vector2D.subtract(edge, finalPoint, initialPoint);
                    qd.Vector2D.clockwiseNormal(normal, edge);
                } else {
                    // anti-clockwise winding
                    qd.Vector2D.subtract(edge, initialPoint, finalPoint);
                    qd.Vector2D.antiClockwiseNormal(normal, edge);
                }
            }

            return out;
        },

        draw: function (canvas, pointA, pointB) {
            var deltaX,
                deltaY,
                r,
                lambda = 0.8,
                x,
                y;

            deltaX = pointB[0] - pointA[0];
            deltaY = pointB[1] - pointA[1];
            r = qd.Point2D.create(pointB[0] - deltaY, pointB[1] + deltaX);


            x = qd.math.lerp(pointB[0], r[0], lambda);
            y = qd.math.lerp(pointB[1], r[1], lambda);


            canvas.view()
                .path()
                .traceLine(pointA[0], pointA[1], pointB[0], pointB[1])
                .draw( { stroke: "blue" } );
        }
    };

}(qd));

