(function (qd) {

    /**
     * Quick & Dirty Math
     *
     * TODO: Rename "qd.Math"
     */
    qd.math = {
        EPSILON: 0.000001,
        TAU: 2 * Math.PI,
        THREE_QUARTER_TAU: 3 * Math.PI / 2,
        HALF_TAU: Math.PI,
        THIRD_TAU: 2 * Math.PI / 3,
        QUARTER_TAU: Math.PI / 2,
        SIXTH_TAU: 2 * Math.PI / 6,
        CIRCLE: 360,
        THREE_QUARTER_CIRCLE: 270,
        HALF_CIRCLE: 180,
        THIRD_CIRCLE: 120,
        QUARTER_CIRCLE: 90,
        SIXTH_CIRCLE: 60,
        TO_DEGREES: 180 / Math.PI,
        TO_RADIANS: Math.PI / 180,

        square: function (value) {
            return value * value;
        },

        cube: function (value) {
            return value * value * value;
        },

        generateTable: function (start, end, inc, equation) {
            var i,
                table = new qd.Tuple.TYPE((end - start) / inc);

            for (i = start; i < end; i += inc) {
                table[i] = (equation(i));
            }

            return table;
        },

        /**
         * Get the x position of a point that has been rotating an arm of {@code length}
         * around a pivot with an x position of {@code pivotX} by the {@code angle}.
         *
         * @param {Number} pivotX
         * @param {Number} angle in radians
         * @param {Number} length
         * @return {Number}
         */
        rotateXPosition: function (pivotX, angle, length) {
            return (pivotX + Math.cos(angle) * length);
        },

        /**
         * Get the y position of a point that has been rotating an arm of {@code length}
         * around the pivot with a y position of {@code pivotY} by the {@code angle}.
         *
         * @param {Number} pivotY
         * @param {Number} angle in radians
         * @param {Number} length
         * @return {Number}
         */
        rotateYPosition: function (pivotY, angle, length) {
            return (pivotY + Math.sin(angle) * length);
        },

        /**
         * Get the angle of the line that connects the points
         * (x0, y0) and (x1, y1).
         *
         * @param {Number} x0
         * @param {Number} y0
         * @param {Number} x1
         * @param {Number} y1
         * @return {Number}
         */
        angleOf: function (x0, y0, x1, y1) {
            var dx = x1 - x0,
                dy = y1 - y0;
            return Math.atan2(dy, dx);
        },

        equalish: function (a, b, epsilon) {
            return Math.abs(a - b) <= (epsilon || this.EPSILON) * Math.max(1.0, Math.abs(a), Math.abs(b));
        },

        random: function (range) {
            return Math.random() * (range || 0);
        },

        randomIntBetween: function (a, b) {
            return Math.floor((b - a) * Math.random()) + a;
        },

        randomInt: function (range) {
            return Math.floor(range * Math.random());
        },

        randomElement: function (array) {
            return array[qd.randomInt(array.length) - 1];
        },

        scatter: function (centre, radius) {
            var rndRadius = this.random(radius),
                rndAngle = this.random(this.TAU),
                sin = Math.sin(rndAngle),
                cos = Math.cos(rndAngle),
                scatterPnt = qd.Point2D.translate(
                    qd.Point2D.clone(centre),
                    cos * rndRadius,
                    sin * rndRadius);

            return scatterPnt;
        },

        /**
         * Get the distance between the points (x0, y0) and (x1, y1).
         *
         * @param {Number} x0
         * @param {Number} y0
         * @param {Number} x1
         * @param {Number} y1
         * @return {Number}
         */
        distance: function (x0, y0, x1, y1) {
            var dx = x1 - x0,
                dy = y1 - y0;
            return Math.sqrt(dx * dx + dy * dy);
        },

        pythagoreanSolve: function (x, y) {
            return Math.sqrt(x * x + y * y);
        },

        /**
         * Get the intersection point between lines {@code lineA} and {@code lineB}.
         * Returns {@code null} if the two lines do not intersect.
         *
         * @param {qd.Point2D} out
         * @param {qd.math.Line} lineA
         * @param {qd.math.Line} lineB
         * @return {qd.Point2D} the point of intersection between lines {@code lineA} and {@code lineB}
         */
        intersectLines: function (out, lineA, lineB) {
            var dPx = lineA.pointB[0] - lineA.pointA[0],
                dPy = lineA.pointB[1] - lineA.pointA[1],
                dRx = lineB.pointB[0] - lineB.pointA[0],
                dRy = lineB.pointB[1] - lineB.pointA[1],
                denom = dRx * dPy - dRy * dPx,
                numer1 = dRx * (lineB.pointA[1] - lineA.pointA[1]) - dRy * (lineB.pointA[0] - lineA.pointA[0]),
                numer2 = dPx * (lineB.pointA[1] - lineA.pointA[1]) - dPy * (lineB.pointA[0] - lineA.pointA[0]),
                lambda1 = -1,
                lambda2 = -1;

            if (denom > 0.0) {
                lambda1 = numer1 / denom;
                lambda2 = numer2 / denom;

                if (lambda1 < 0.0 || lambda1 > 1.0 ||
                    lambda2 < 0.0 || lambda2 > 1.0) {
                    return null;
                }

                qd.Point2D.position(out,
                    lineA.pointA[0] + dPx * lambda1,
                    lineA.pointA[1] + dPy * lambda1
                );
            }

            return out;

        },

        /**
         * Linear interpolation between value {@code a} and {@code b}.
         *
         * @param {Number} a
         * @param {Number} b
         * @param {Number} lambda with range [0, 1]
         * @return {Number}
         */
        lerp: function (a, b, lambda) {
            return (1 - lambda) * a + lambda * b;
        },

        /**
         * Linear interpolation point between points {@code pointA} and {@code pointB}.
         *
         * If {@code lambda} is undefined, then it is assumed to be 0.5 (i.e. half way along
         * the linear interpolant).
         *
         * @param {qd.Point2D} out
         * @param {qd.Point2D} pointA
         * @param {qd.Point2D} pointB
         * @param {Number} lambda with range [0, 1]
         * @return {qd.Point2D} linear interpolation point
         */
        lerpPoint2D: function (out, pointA, pointB, lambda) {
            var lerp = qd.math.lerp;

            out[0] = lerp(pointA[0], pointB[0], lambda);
            out[1] = lerp(pointA[1], pointB[1], lambda);

            return out;
        },

        /**
         * Linear interpolation point a distance of {@code distance} along the
         * the line between {@code pointA} and {@code pointB}.
         *
         * @param {qd.Point2D} out
         * @param {qd.Point2D} pointA (x0, y0)
         * @param {qd.Point2D} pointB (x1, y1)
         * @param {Number} distance with range [0, sqrt((x1 - x0)^2 + (y1 - y0)^2)]
         * @return {qd.Point2D} linear interpolation point
         */
        lerpPoint2DByDistance: function (out, pointA, pointB, distance) {
            var lambda = distance / qd.Point2D.distance(pointA, pointB);

            return qd.math.lerpPoint2D(out, pointA, pointB, lambda);
        },

        /**
         * Returns the point S such that the line has
         * length distance and is turned anticlockwise by 90 degrees from the
         * given {@code line}.
         *
         * @param {qd.Point2D} out
         * @param {qd.math.Line} line
         * @param {Number} distance
         * @return {qd.Point2D} out
         */
        perpendicularByDistance: function (out, pointA, pointB, distance) {
            var deltaX,
                deltaY,
                r;

            deltaX = pointB[0] - pointA[0];
            deltaY = pointB[1] - pointA[1];
            r = qd.Point2D.create(pointB[0] - deltaY, pointB[1] + deltaX);

            return qd.math.lerpPoint2DByDistance(out, pointB, r, distance);
        },

        /**
         * Returns a point S on the given {@code line} such that the line through
         * S and the {@code offLine} point is perpendicular to the given {@code line}.
         *
         * @param {qd.Point2D} out
         * @param {qd.math.Line} line
         * @param {qd.Point2D} offLine
         * @return {qd.Point2D}
         */
        perpendicularBasePoint: function (out, line, offLine) {
            var deltaX, deltaY, f, d, lambda;

            deltaX = line.pointB[0] - line.pointA[0];
            deltaY = line.pointB[1] - line.pointA[1];
            f = deltaX * (offLine[0] - line.pointA[0]) + deltaY * (offLine[1] - line.pointA[1]);
            d = deltaX * deltaX + deltaY * deltaY;
            lambda = f / d;

            return qd.math.lerpPoint2D(out, line.pointA(), line.pointB(), lambda);
        },

        /**
         * Returns a point that when connected with the the {@code offLine}
         * point makes a line that is parallel to the given {@code line}.
         *
         * @param {qd.math.Line} line
         * @param {qd.Point2D} offLine
         * @return {qd.Point2D}
         */
        parallelPoint: function (line, offLine) {
            var deltaX, deltaY;

            deltaX = line.pointB[0] - line.pointA[0];
            deltaY = line.pointB[1] - line.pointA[1];

            return new qd.Point2D(offLine[0] + deltaX, offLine[1] + deltaY);
        },

        round: function (number, sigFigs) {
            return Math.round(number * sigFigs) / sigFigs;
        },

        fastFloor: function (value) {
            return (0.5 + value) | 0;
        },

        centroid: function (centroid, points) {
            var centroid = centroid || qd.Point2D.create(0, 0);

            if (points.length > 3) {
                return this.polygonCentroid(centroid, points);
            } else if (points.length === 3) {
                return this.triangleCentroid(centroid, points[0], points[1], points[2]);
            } else if (points.length === 2) {
                return this.lerpPoint2D(centroid, points[0], points[1], 0.5);
            } else if (points.length === 1) {
                return qd.Point2D.copy(centroid, points[0]);
            }

            return centroid;
        },

        triangleCentroid: function (centroid, a, b, c) {
            centroid[0] = (a[0] + b[0] + c[0]) / 3;
            centroid[1] = (a[1] + b[1] + c[1]) / 3;
            return centroid;
        },

        /**
         * The centroid of a non-self-intersecting closed polygon defined by n vertices
         *
         * https://en.wikipedia.org/wiki/Centroid#Centroid_of_polygon
         * https://stackoverflow.com/questions/2792443/finding-the-centroid-of-a-polygon
         *
         * @param {qd.Point2D} centroid the receiving point
         * @param {Array} points
         * @return {qd.Point2D} centroid
         */
        polygonCentroid: function (centroid, points) {
            var pointsCount = points.length,
                signedArea = 0.0,
                sixSignedArea,
                currentPointX = 0.0,
                currentPointY = 0.0,
                nextPointX = 0.0,
                nextPointY = 0.0,
                partialSignedArea = 0.0,
                point = null,
                i;

            for (i = 0; i < pointsCount; i = i + 1) {
                point = points[i];
                currentPointX = point[0];
                currentPointY = point[1];

                point = points[(i+1) % pointsCount];
                nextPointX = point[0];
                nextPointY = point[1];

                partialSignedArea = currentPointX * nextPointY - nextPointX * currentPointY;
                signedArea += partialSignedArea;
                centroid[0] += (currentPointX + nextPointX) * partialSignedArea;
                centroid[1] += (currentPointY + nextPointY) * partialSignedArea;
            }

            signedArea *= 0.5;
            sixSignedArea = 6.0 * signedArea;
            centroid[0] /= sixSignedArea;
            centroid[1] /= sixSignedArea;

            return centroid;
        },

        isPolygonConvex: function (points) {
            // Convex if all interior angles are less than 180 degrees
            //
        },

        /**
         * Calculates the winding sum for a closed polygon.
         *
         * For a right-handed cartesian coordinate system:
         *   - A positive winding sum indicates a clockwise winding.
         *   - A negative winding sum indicates an anti-clockwise winding.
         *
         * In a right-handed canvas coordinate system (reversed y-axis):
         *   - A positive winding sum indicates an anti-clockwise winding.
         *   - A negative winding sum indicates a clockwise winding.
         *
         * @param {Array} points
         * @return {Number} winding sum
         */
        polygonWindingSum: function (points) {
            var windingSum = 0,
                pointsCount = points.length,
                currentIndex,
                nextIndex,
                current,
                next;

            for (currentIndex = 0; currentIndex < pointsCount; currentIndex += 1) {
                nextIndex = (currentIndex + 1) % pointsCount;

                current = points[currentIndex];
                next = points[nextIndex];

                // Sum( (x[(i+1) mod N] - x[i]) * (y[i] + y[(i+1) mod N]) )
                windingSum += (next[0] - current[0]) * (current[1] + next[1]);
            }

            return windingSum;
        },

        circleTopPoint: function (centre, radius) {
            return qd.Point2D.create(centre[0], (centre[1] - radius));
        },

        circleBottomPoint: function (centre, radius) {
            return qd.Point2D.create(centre[0], (centre[1] + radius));
        },

        circleLeftPoint: function (centre, radius) {
            return qd.Point2D.create((centre[0] - radius), centre[1]);
        },

        circleRightPoint: function (centre, radius) {
            return qd.Point2D.create((centre[0] + radius), centre[1]);
        },

        /**
         * qd.InterpolationFunction
         *
         * @param {Array} points
         * @constructor
         */
        InterpolationFunction: function (points) {
            var _rangeComparator = function (pointA, pointB) {
                return pointA[0] - pointB[0];
            };

            this.points = points;
            this.rangeMin = qd.min(points, _rangeComparator);
            this.rangeMax = qd.max(points, _rangeComparator);

            this.point = function (lambda) {
                var x = qd.math.lerp(this.rangeMin[0], this.rangeMax[0], lambda),
                    xIndex,
                    point,
                    prevPoint,
                    xDistance,
                    nodeDistance,
                    y,
                    lambdaY;

                // For each node
                for (xIndex = 0; xIndex < this.points.length; xIndex += 1) {
                    point = this.points[xIndex];

                    if (x === point[0]) {
                        return point;
                    } else if (x > point[0]) {
                        // Do nothing. Go to the next node.
                        prevPoint = this.points[xIndex];
                    } else {
                        // Otherwise this x is lower than the current node
                        // and it is greater than the previous node

                        // Calculate the proportion dx from the previous node to the
                        // current node.
                        // Formula: dX = distance between x and previous node
                        //                  / distance between nodes
                        xDistance = x - prevPoint[0];
                        nodeDistance = point[0] - prevPoint[0];
                        lambdaY = xDistance / nodeDistance;

                        y = qd.math.lerp(prevPoint[1], point[1], lambdaY);

                        return qd.Point2D.create(x, y);
                    }
                }

                return undefined;
            }
        },

        Radians: function (radians) {
            var _radians = radians;

            this.rotateRadians = function (radians) {
                _radians = qd.math.addRadians(_radians, radians);
            };

            this.rotateDegrees = function (degrees) {
                _radians = qd.math.addRadians(_radians, qd.math.toRadians(degrees));
            };

            this.radians = function () {
                return _radians;
            };

            this.degrees = function () {
                return qd.math.toDegrees(_radians);
            };

            this.toDegrees = function () {
                return new qd.math.Degrees(qd.math.toDegrees(_radians));
            }
        },

        Degrees: function (degrees) {
            var _degrees = degrees;

            this.rotateRadians = function (radians) {
                _degrees = qd.math.addDegrees(_degrees, qd.math.toDegrees(radians));
            };

            this.rotateDegrees = function (degrees) {
                _degrees = qd.math.addDegrees(_degrees, degrees);
            };

            this.radians = function () {
                return qd.math.toRadians(_degrees);
            };

            this.degrees = function () {
                return _degrees;
            };

            this.toRadians = function () {
                return new qd.math.Radians(qd.math.toRadians(_degrees));
            }
        },

        toDegrees: function (radians) {
            return radians * qd.math.TO_DEGREES;
        },

        toRadians: function (degrees) {
            return degrees * qd.math.TO_RADIANS;
        },

        radians: function (r) {
            var angle = r,
                TAU = this.TAU;

            if (r > TAU) {
                angle = r % TAU;
            } else if (r < 0) {
                angle = (r % TAU) + TAU;
            }


            return angle;
        },

        degrees: function (r) {
            var angle = r,
                CIRCLE = this.CIRCLE;

            if (r > CIRCLE) {
                angle = r % CIRCLE;
            } else if (r < 0) {
                angle = (r % CIRCLE) + CIRCLE;
            }

            return angle;
        },

        addRadians: function (r, dr) {
            return qd.math.radians(r + dr);
        },

        addDegrees: function (r, dr) {
            return qd.math.degrees(r + dr);
        },

        biasGreaterThan: function (a, b) {
            var kBiasRelative = 0.95,
                kBiasAbsolute = 0.01;

            return a >= b * kBiasRelative + a * kBiasAbsolute;
        },

        biasLessThan: function (a, b) {
            var kBiasRelative = 0.95,
                kBiasAbsolute = 0.01;

            return a <= b * kBiasRelative + a * kBiasAbsolute;
        }

    };

    qd.math.sinTable = qd.math.generateTable(0, 360, 1, function (degrees) {
        return Math.sin(qd.math.toRadians(degrees));
    });

    qd.math.fastSin = function (x) {
        var y,
            degrees = qd.math.degrees(x),
            shift = new Number(degrees);

        if ((shift | 0) === degrees) {
            y = qd.math.sinTable[degrees];
        } else {
            y = Math.sin(x);
        }

        return y;
    };

    qd.math.fasterSin = function (x) {
        var degrees = qd.math.fastFloor(x);

        return qd.math.sinTable[degrees];
    };

    qd.math.cosTable = qd.math.generateTable(0, 360, 1, function (degrees) {
        return Math.cos(qd.math.toRadians(degrees));
    });

    qd.math.fastCos = function (x) {
        var y,
            degrees = qd.math.degrees(x),
            shift = new Number(degrees);

        if ((shift | 0) === degrees) {
            y = qd.math.cosTable[degrees];
        } else {
            y = Math.cos(x);
        }

        return y;
    };

    qd.math.fasterCos = function (x) {
        var degrees = qd.math.fastFloor(x);
        return qd.math.cosTable[degrees];
    };

    qd.math.Line = function () {
        var args = new qd.Args(arguments);

        this._pointA = null;
        this._pointB = null;

        if (args.matches(Number, Number, Number, Number)) {
            this._pointA = qd.Point2D.create(args.get(0), args.get(1));
            this._pointB = qd.Point2D.create(args.get(2), args.get(3));
        } else if (args.matches(qd.Point2D, qd.Point2D)) {
            this._pointA = args.get(0);
            this._pointB = args.get(1);
        } else if (args.matches(qd.math.Line)) {
            this._pointA = args.get(0).pointA();
            this._pointB = args.get(0).pointA();
        }
    };

    qd.math.Line.prototype.pointA = function (pointA) {
        if (qd.isDefinedAndNotNull(pointA)) {
            this._pointA = pointA;
            return this;
        }

        return this._pointA;
    };

    qd.math.Line.prototype.pointB = function (pointB) {
        if (qd.isDefinedAndNotNull(pointB)) {
            this._pointB = pointB;
            return this;
        }

        return this._pointB;
    };

    qd.math.Line.prototype.dx = function () {
        return this._pointB.x - this._pointA.x;
    };

    qd.math.Line.prototype.dy = function () {
        return this._pointB.y - this._pointA.y;
    };

    qd.math.Line.prototype.gradient = function () {
        return this.dy() / this.dx();
    };

    qd.math.Line.prototype.lineLength = function () {
        return qd.Point2D.distance(this._pointA, this._pointB);
    };

    qd.math.Line.prototype.angle = function () {
        return Math.atan2(this.dy(), this.dx());
    };

    qd.math.Line.prototype.copy = function () {
        return new qd.math.Line(this._pointA, this._pointB);
    };

    /**
     * Circle shape.
     */
    qd.math.Circle = function (centre, radius) {
        this.centre = centre;
        this.radius = radius;
    };

    qd.math.Circle.prototype.clone = function () {
        return new qd.Circle(this.centre, this.radius);
    };

    qd.math.Circle.prototype.copy = function (circle) {
        this.centre = circle.centre;
        this.radius = circle.radius;
        return this;
    };

    qd.math.Circle.prototype.diameter = function () {
        return this.radius * 2;
    };

    qd.math.Circle.prototype.perimeter = function () {
        return qd.math.TAU * this.radius;
    };

    qd.math.Circle.prototype.area = function () {
        return qd.math.HALF_TAU * this.radius * this.radius;
    };

    qd.math.Circle.prototype.pointAt = function (angle) {
        var x = qd.math.rotateXPosition(0, angle, this.radius),
            y = qd.math.rotateYPosition(0, angle, this.radius);

        return new qd.Point2D.create(x, y);
    };

    /**
     *
     * @param pointA
     * @param pointB
     * @constructor
     */
    qd.math.Rectangle = function (pointA, pointB) {
        this.min;
        this.max;
        this.width;
        this.height;

        this.init(pointA, pointB);
    };

    qd.math.Rectangle.prototype.init = function (pointA, pointB) {
        var width = pointB[0] - pointA[0],
            height = pointB[1] - pointA[1];

        if (width < 0 && height < 0) {
            this.min = pointB;
            this.max = pointA;
            this.width = -width;
            this.height = -height;
        } else if (width < 0 && height > 0) {
            this.min = qd.Point2D.create(pointB[0], pointA[1]);
            this.max = qd.Point2D.create(pointA[0], pointB[1]);
            this.width = -width;
            this.height = height;
        } else if(width > 0 && height < 0) {
            this.min = qd.Point2D.create(pointA[0], pointB[1]);
            this.max = qd.Point2D.create(pointB[0], pointA[1]);
            this.width = width;
            this.height = -height;
        } else {
            this.min = pointA;
            this.max = pointB;
            this.width = width;
            this.height = height;
        }
    };

    qd.math.Rectangle.prototype.area = function () {
        return this.width * this.height;
    };
}(qd));
