(function (qd) {

    qd.Collision = function (physics) {
        this.init(physics);
    };

    qd.Collision.prototype.init = function (physics) {
        this._physics = physics;
        this._penetrationPercent = physics.settings.penetrationPercent;
        this._penetrationSlop = physics.settings.penetrationSlop;

        // Cache manifold for collision detection
        // All points and vectors required for collision resolution
        // are pre-created and reused for each collision.
        this._manifold = {

            // Body A
            a: {
                body: null,
                shape: null,
                radius: null,
                bounds: null,
                position: null,
                deltaPosition: null,
                velocity: null,
                inverseMass: null,
                angularVelocity: null,
                inverseMoment: null,
                restitution: null,
                linearStaticFriction: null,
                linearDynamicFriction: null,
                positionCorrection: qd.Vector2D.create(0, 0),
                radialContacts: [qd.Vector2D.create(0, 0), qd.Vector2D.create(0, 0)],
                edgeDirection: qd.Vector2D.create(0, 0),
                contactEdge: null
            },

            // Body B
            b: {
                body: null,
                shape: null,
                radius: null,
                bounds: null,
                position: null,
                deltaPosition: null,
                velocity: null,
                inverseMass: null,
                angularVelocity: null,
                inverseMoment: null,
                restitution: null,
                linearStaticFriction: null,
                linearDynamicFriction: null,
                positionCorrection: qd.Vector2D.create(0, 0),
                radialContacts: [qd.Vector2D.create(0, 0), qd.Vector2D.create(0, 0)],
                edgeDirection: qd.Vector2D.create(0, 0),
                contactEdge: null
            },

            // Collision data
            normal: qd.Vector2D.create(0, 0),
            negNormal: qd.Vector2D.create(0, 0),
            tangent: qd.Vector2D.create(0, 0),
            penetration: 0,

            // relativeContactVelocity
            relativeContactVelocity: qd.Vector2D.create(0, 0),
            radialVelocityA: qd.Vector2D.create(0, 0),
            radialVelocityB: qd.Vector2D.create(0, 0),
            contactVelocityA: qd.Vector2D.create(0, 0),
            contactVelocityB: qd.Vector2D.create(0, 0),

            // resolveCollision
            impulseScalar: null,
            impulse: qd.Vector2D.create(0, 0),

            // applyMutualImpulse
            relativePosition: qd.Vector2D.create(0, 0),
            normalVelocity: qd.Vector2D.create(0, 0),
            normalSpeed: 0,

            // applyFrictionImpulse
            frictionImpulse: qd.Vector2D.create(0, 0),

            // correctPositions
            positionCorrection: qd.Vector2D.create(0, 0),

            // NOTE: Do NOT use contacts.length! Use contactsCount instead.
            //  The contacts array is a cache and it will never be resized.
            //  Update the contactsCount if the number of contacts changes.
            contacts: [qd.Point2D.create(0, 0), qd.Point2D.create(0, 0)],
            contactsCount: 0,
            contactsDepth: [0, 0],

            closestPoint: qd.Point2D.create(0, 0),

            // getContactByClipping
            referenceEdgeNormalised: qd.Vector2D.create(0, 0),
            negReferenceEdgeNormalised: qd.Vector2D.create(0, 0),
            referenceEdgeNormal: qd.Vector2D.create(0, 0),
            incidenceEdgeNormal: qd.Vector2D.create(0, 0),

            // clip
            clipContactIndex: 0,
            clipContacts: [qd.Point2D.create(0, 0), qd.Point2D.create(0, 0)]
        };
    };

    qd.Collision.prototype.resolve = function (bodies) {
        var manifold = this._manifold;

        this._physics.eachInteraction(bodies, function (bodyA, bodyB) {
            var boundsA = bodyA.bounds,
                boundsB = bodyB.bounds;

            if (boundsA.boxOnBoxCollisionTest(boundsB)) {
                // Resolve broad-phase collision
                this.prepareManifold(manifold, bodyA, bodyB);

                if (this.collide(manifold)) {
                    // Resolve narrow-phase collision
                    this.resolveCollision(manifold);
                    this.applyFrictionImpulse(manifold);
                    this.separateCollidingBodies(manifold);
//                    this.debug(manifold);
                }
            }
        }, this);
    };

    qd.Collision.prototype.prepareManifold = function (manifold, bodyA, bodyB) {
        var a = manifold.a,
            b = manifold.b,
            boundsA = bodyA.bounds,
            boundsB = bodyB.bounds,
            materialA,
            materialB;

        materialA = bodyA.material;
        materialB = bodyB.material;

        a.body = bodyA;
        a.bounds = boundsA;
        a.shape = boundsA._shape;
        a.radius = boundsA.radius();
        a.position = bodyA.position;
        a.deltaPosition = bodyA.deltaPosition;
        a.velocity = bodyA.velocity;
        a.inverseMass = bodyA.inverseMass;
        a.angularVelocity = bodyA.angularVelocity;
        a.inverseMoment = bodyA.inverseMoment;
        a.restitution = materialA.restitution;
        a.linearStaticFriction = materialA.linearStaticFriction;
        a.linearDynamicFriction = materialA.linearDynamicFriction;

        b.body = bodyB;
        b.bounds = boundsB;
        b.shape = boundsB._shape;
        b.radius = boundsB.radius();
        b.position = bodyB.position;
        b.deltaPosition = bodyB.deltaPosition;
        b.velocity = bodyB.velocity;
        b.inverseMass = bodyB.inverseMass;
        b.angularVelocity = bodyB.angularVelocity;
        b.inverseMoment = bodyB.inverseMoment;
        b.restitution = materialB.restitution;
        b.linearStaticFriction = materialB.linearStaticFriction;
        b.linearDynamicFriction = materialB.linearDynamicFriction;

        manifold.contactsCount = 0;
    };

    qd.Collision.prototype.debug = function (manifold) {
        var a = manifold.a,
            b = manifold.b,
            bodyA = a.body,
            bodyB = b.body,
            cdA = bodyA.collisionData,
            cdB = bodyB.collisionData,
            contact,
            radialContact,
            i;

        cdA.colour = "blue";
        bodyB.collisionData.colour = "red";

    //        qd.debug("debug contactsCount: ", manifold.contactsCount)

        for (i = 0; i < manifold.contactsCount; i += 1) {
            contact = manifold.contacts[i];

            cdA.contacts.push(qd.Point2D.clone(contact));
            cdA.radialContacts.push(qd.Vector2D.clone(a.radialContacts[i]));

            cdB.contacts.push(qd.Point2D.clone(contact));
            cdB.radialContacts.push(qd.Vector2D.clone(b.radialContacts[i]));
        }

        cdA.edges.push(a.contactEdge);
        cdB.edges.push(b.contactEdge);

    //                    var m = qd.cloneProperties(manifold),
    //                        tempBoundsA = m.a.bounds,
    //                        tempBoundsB = m.b.bounds,
    //                        tempBodyA = m.a.body,
    //                        tempBodyB = m.b.body;
    //
    //                    m.a.bounds=null;
    //                    m.b.bounds=null;
    //                    m.a.body=null;
    //                    m.b.body=null;
    //                    qd.debug("####### AFTER #######")
    //                    qd.debug(manifold)
    //                    m.a.bounds=tempBoundsA;
    //                    m.b.bounds=tempBoundsB;
    //                    m.a.body=tempBodyA;
    //                    m.b.body=tempBodyB;
    };

    qd.Collision.prototype.collide = function (manifold) {
        var collisionType = "polygonOnPolygon"; // TODO: Determine type

    //        var collisionType = "circleOnCircle"; // TODO: Determine type

    //        var collisionType = "boxOnBox";

        switch (collisionType) {
            case "circleOnCircle":
                return this.collideCircleOnCircle(manifold);
                break;
            case "boxOnBox":
                return this.collideBoxOnBox(manifold);
                break;
            case "boxOnCircle":
                return this.collideBoxOnCircle(manifold);
            case "circleOnBox":
                return this.collideCircleOnBox(manifold);
                break;
            case "polygonOnPolygon":
                return this.collidePolygonOnPolygon(manifold);
                break;
            case "circleOnPolygon":
                return false;
                break;
            case "polygonOnCircle":
                return false;
                break;
            case "lineOnPolygon":
                return false;
                break;
            case "polygonOnLine":
                return false;
                break;
        }
    };

    qd.Collision.prototype.collideCircleOnCircle = function (manifold) {
        var a = manifold.a,
            b = manifold.b,
            positionA = a.position,
            positionB = b.position,
            radiusA = a.radius,
            radiusB = b.radius,
            normal = manifold.normal,
            radiiSum,
            distance,
            distanceSquared,
            contact,
            radialContactA,
            radialContactB;

        // Vector from A to B (un-normalised)
        normal = qd.Vector2D.subtract(normal, positionB, positionA);

        distanceSquared = qd.Vector2D.magnitudeSquared(normal);

        radiiSum = radiusA + radiusB;

        if(distanceSquared > radiiSum * radiiSum) {
            return false;
        }

        // Circles have collided, now compute contacts

        // Circle on circle collisions only have one contact
        manifold.contactsCount = 1;

        // Grab the contact and radial contacts cache
        contact = manifold.contacts[0];

        radialContactA = a.radialContacts[0];
        radialContactB = b.radialContacts[0];

        distance = Math.sqrt(distanceSquared);

        if(distance === 0) {
            // Circles are at the same position, so contact is made at the
            // colliding circles' mutual centre.

            manifold.penetration = radiusA;

            qd.Vector2D.set(normal, 1, 0);

            qd.Vector2D.mutateZero(radialContactA);
            qd.Point2D.copy(contact, positionA);

            qd.Vector2D.mutateZero(radialContactB);
            qd.Point2D.copy(contact, positionB);
        } else {
            // Circles are overlapping but not at the same position

            manifold.penetration = radiiSum - distance;

            // Normalise the normal using the already calculated distance
            qd.Vector2D.mutateInverseScale(normal, distance);

            qd.Vector2D.scale(radialContactA, radiusA, normal);
            qd.Point2D.add(contact, radialContactA, positionA);

            qd.Vector2D.scale(radialContactB, -radiusB, normal);
            qd.Point2D.add(contact, radialContactB, positionB);
        }

        return true;
    };

    qd.Collision.prototype.collideBoxOnBox = function (manifold) {
        var a = manifold.a,
            b = manifold.b,
            relativePosition,
            boundsA = a.bounds,
            boundsB = b.bounds,
            halfWidthA,
            halfWidthB,
            halfHeightA,
            halfHeightB,
            overlapX,
            overlapY,
            normal = manifold.normal;

        // Vector from A to B
        relativePosition = qd.Vector2D.subtract(manifold.relativePosition, b.position, a.position);

        // Calculate half extents along x axis for each object
        halfWidthA = boundsA.halfWidth();
        halfWidthB = boundsB.halfWidth();

        // Calculate overlap on x axis
        overlapX = halfWidthA + halfWidthB - Math.abs(relativePosition[0]);

        // Calculate half extents along x axis for each object
        halfHeightA = boundsA.halfHeight();
        halfHeightB = boundsB.halfHeight();

        // Calculate overlap on y axis
        overlapY = halfHeightA + halfHeightB - Math.abs(relativePosition[1]);

        // Find out which axis is axis of least penetration
        if(overlapX > overlapY) {
            // Point towards B knowing that n points from A to B
            if(relativePosition[0] < 0) {
                qd.Vector2D.set(normal, -1, 0);
            } else {
                qd.Vector2D.set(normal, 1, 0);
            }

            // Point toward B knowing that n points from A to B
            if(relativePosition[1] < 0) {
                qd.Vector2D.set(normal, 0, -1);
            } else {
                qd.Vector2D.set(normal, 0, 1);
            }

            manifold.normal = normal;
            manifold.penetration = overlapY;

            return true
        } else {
            // Point towards B knowing that n points from A to B
            if(relativePosition[0] < 0) {
                qd.Vector2D.set(normal, -1, 0);
            } else {
                qd.Vector2D.set(normal, 1, 0);
            }

            // Point toward B knowing that n points from A to B
            if(relativePosition[1] < 0) {
                qd.Vector2D.set(normal, 0, -1);
            } else {
                qd.Vector2D.set(normal, 0, 1);
            }

            manifold.normal = normal;
            manifold.penetration = overlapX;

            return true
        }
    };

    qd.Collision.prototype.collideBoxOnCircle = function (manifold) {
        var box = manifold.a,
            circle = manifold.b;

        // TODO: Only collides with box corners, not the box sides

        return this._collideBoxOnCircle(manifold, box, circle);
    };

    qd.Collision.prototype.collideCircleOnBox = function (manifold) {
        var box = manifold.b,
            circle = manifold.a,
            collisionResult = this._collideBoxOnCircle(manifold, box, circle);

        if (collisionResult) {
            manifold.normal = qd.Vector2D.mutateNegate(manifold.normal);
        }

        return collisionResult;
    };

    qd.Collision.prototype._collideBoxOnCircle = function (manifold, box, circle) {
        var relativePosition,
            closestPoint,
            boundingBox = box.bounds,
            boxHalfWidth,
            boxHalfHeight,
            insideBox,
            normal,
            normalLengthSquared,
            radius = circle.radius,
            normalLength;

        // Vector from A to B
        relativePosition = qd.Vector2D.subtract(manifold.relativePosition, circle.position, box.position);

        // Closest point on A to center of B
        closestPoint = qd.Point2D.copy(manifold.closestPoint, relativePosition);

        // Calculate half extents along each axis
        boxHalfWidth = boundingBox.halfWidth();
        boxHalfHeight = boundingBox.halfHeight();

        // Clamp point to edges of the AABB
        closestPoint[0] = qd.clamp(-boxHalfWidth, boxHalfWidth, closestPoint[0]);
        closestPoint[1] = qd.clamp(-boxHalfHeight, boxHalfHeight, closestPoint[1]);

        insideBox = false;

        // Circle is inside the bounding box, so we need to clamp the circle's center to the closest edge
        if(relativePosition === closestPoint) {
            insideBox = true;

            // Find closest axis
            if(Math.abs(relativePosition[0]) > Math.abs(relativePosition[1])) {
                // Clamp to closest extent
                closestPoint[0] = qd.clamp(-boxHalfWidth, boxHalfWidth, closestPoint[0]);
            } else {
                // y axis is shorter

                // Clamp to closest extent
                closestPoint[1] = qd.clamp(-boxHalfHeight, boxHalfHeight, closestPoint[1]);
            }
        }

        normal = qd.Vector2D.subtract(manifold.normal, relativePosition, closestPoint);
        normalLengthSquared = qd.Vector2D.magnitudeSquared(normal);

        // Early out of the radius is shorter than distance to closest point and
        // Circle not inside the bounding box
        if (normalLengthSquared > radius * radius && !insideBox) {
            return false;
        }

        // Avoided sqrt until we needed
        normalLength = Math.sqrt(normalLengthSquared);

        // Normalise the normal
        normal = qd.Vector2D.mutateInverseScale(normal, normalLength);

        // Collision normal needs to be flipped to point outside if circle was inside the bounding box
        if (insideBox) {
            manifold.normal = qd.Vector2D.mutateNegate(normal);
            manifold.penetration = radius - normalLength;
        } else {
            manifold.normal = normal;
            manifold.penetration = radius - normalLength;
        }

        return true
    };

    qd.Collision.prototype.collidePolygonOnPolygon = function (manifold) {
        var a = manifold.a,
            b = manifold.b,
            bodyA = a.body,
            bodyB = b.body,
            shapeA = bodyA.bounds._shape,
            shapeB = bodyB.bounds._shape,
            axesA = shapeA.externalNormals(),
            axesB = shapeB.externalNormals(),
            i,
            axis,
            projectionA,
            projectionB,
            overlap,
            min,
            max,
            penetration = Number.MAX_SAFE_INTEGER,
            normal = manifold.normal,
            positionA = bodyA.position,
            positionB = bodyB.position;

        // loop over the axesA
        for (i = 0; i < axesA.length; i += 1) {
            axis = axesA[i];

            projectionA = shapeA.project(axis);
            projectionB = shapeB.project(axis);

            if (!projectionA.overlap(projectionB)) {
                return false;
            } else {
                overlap = projectionA.overlap(projectionB);

                if (projectionA.contains(projectionB) || projectionB.contains(projectionA)) {
                    // get the overlap plus the distance from the minimum end points
                    min = Math.abs(projectionA.min - projectionB.min);
                    max = Math.abs(projectionA.max - projectionB.max);
                    // NOTE: depending on which is smaller you may need to
                    // negate the separating axis!!
                    if (min < max) {
                        qd.Vector2D.mutateNegate(axis);
                        overlap += min;
                    } else {
                        overlap += max;
                    }
                }

                // Find the axis with the smallest penetration
                if (overlap < penetration) {
                    penetration = overlap;
                    qd.Vector2D.copy(normal, axis);
                }
            }
        }

        // loop over the axesB
        for (i = 0; i < axesB.length; i += 1) {
            axis = axesB[i];

            projectionA = shapeA.project(axis);
            projectionB = shapeB.project(axis);

            if (!projectionA.overlap(projectionB)) {
                return false;
            } else {
                overlap = projectionA.overlap(projectionB);

                if (projectionA.contains(projectionB) || projectionB.contains(projectionA)) {
                    // get the overlap plus the distance from the minimum end points
                    min = Math.abs(projectionA.min - projectionB.min);
                    max = Math.abs(projectionA.max - projectionB.max);
                    // NOTE: depending on which is smaller you may need to
                    // negate the separating axis!!
                    if (min < max) {
                        qd.Vector2D.mutateNegate(axis);
                        overlap += min;
                    } else {
                        overlap += max;
                    }
                }

                // Find the axis with the smallest penetration
                if (overlap < penetration) {
                    penetration = overlap;
                    qd.Vector2D.copy(normal, axis);
                }
            }
        }

        // make sure the vector is pointing from shape1 to shape2
        if (qd.Vector2D.dot(qd.Vector2D.subtract(manifold.relativePosition, positionB, positionA), normal) < 0) {
            // negate the normal if its not
            qd.Vector2D.mutateNegate(normal);
        }

        manifold.penetration = penetration;
        manifold.normal = normal;

        this.getContactsByClipping(manifold);

        return true;
    };

    qd.Collision.prototype.getContactsByClipping = function (manifold) {
        var a = manifold.a,
            b = manifold.b,
            bodyA = a.body,
            bodyB = b.body,
            shapeA = bodyA.bounds._shape,
            shapeB = bodyB.bounds._shape,
            normal,
            negNormal,
            contactEdgeA,
            contactEdgeB,
            projectionA,
            projectionB,
            referenceEdgeNormalised,
            negReferenceEdgeNormalised,
            offsetA,
            offsetB,
            clips,
            referenceEdgeNormal,
            incidenceEdgeNormal,
            maxSeparation,
            reference,
            incidence,
            flipped,
            contact,
            i;

        normal = manifold.normal;
        negNormal = qd.Vector2D.negate(manifold.negNormal, normal);

        contactEdgeA = shapeA.contactEdge(normal);
        contactEdgeB = shapeB.contactEdge(negNormal);

        // Cache the contact edges for debugging
        a.contactEdge = contactEdgeA;
        b.contactEdge = contactEdgeB;


        // Identify the reference and incident edges.
        // The reference edge is the edge most perpendicular to the separation normal.
        // The edge that is most perpendicular to a normal will have a dot product closer to zero.
        // So whichever edge has the smallest projection is the reference edge.
        projectionA = Math.abs(qd.Vector2D.dot(contactEdgeA.direction, normal));
        projectionB = Math.abs(qd.Vector2D.dot(contactEdgeB.direction, normal));

        if (projectionA <= projectionB) {
            reference = contactEdgeA;
            incidence = contactEdgeB;
            flipped = false
        } else {
            // Reference and incidence edges are flipped
            reference = contactEdgeB;
            incidence = contactEdgeA;
            // Flag the flip so the correct edge normal is used when clipping
            flipped = true;
        }

    //    qd.debug("Contact Edge A: ", a.contactEdge.direction)
    //    qd.debug("Contact Edge B: ", b.contactEdge.direction);
    //    qd.debug("Contact Edge " + ((flipped) ? "B" : "A") + " is the reference edge.");
    //    qd.debug("Separation Normal: ", manifold.normal)

        // Normalise the reference edge's direction
        referenceEdgeNormalised = qd.Vector2D.normalise(manifold.referenceEdgeNormalised, reference.direction);

        offsetA = qd.Vector2D.dot(referenceEdgeNormalised, reference.pointA);
        clips = this.clip(incidence.pointA, incidence.pointB, referenceEdgeNormalised, offsetA);

        if (clips.length < 2) {
    //        qd.debug("No clips 1: ", clips.length)
            return false;
        }

        negReferenceEdgeNormalised = qd.Vector2D.negate(manifold.negReferenceEdgeNormalised, referenceEdgeNormalised);

        offsetB = -qd.Vector2D.dot(referenceEdgeNormalised, reference.pointB);
        clips = this.clip(clips[0], clips[1], negReferenceEdgeNormalised, offsetB);

        if (clips.length < 2) {
    //        qd.debug("No clips 2", clips.length)
            return false;
        }

        // Get the reference edge normal (depends on the winding of the reference shape)
        if (reference.shape.clockwiseWinding()) {
            referenceEdgeNormal = qd.Vector2D.clockwisePerpendicular(manifold.referenceEdgeNormal, reference.direction);
        } else {
            referenceEdgeNormal = qd.Vector2D.antiClockwisePerpendicular(manifold.referenceEdgeNormal, reference.direction);
        }

        // If the incident and reference edges were flipped
        // then flip the reference edge normals to clip properly
        if (flipped) {
            qd.Vector2D.mutateNegate(referenceEdgeNormal);
        }

        // Get the largest separation depth
        maxSeparation = qd.Vector2D.dot(referenceEdgeNormal, reference.supportPoint);

        var clip1 = clips[0],
            clip2 = clips[1];

        // make sure the final points are not past this maximum
        var depth = [];
        depth[0] = qd.Vector2D.dot(referenceEdgeNormal, clip1) - maxSeparation;

        if (depth[0] < 0) {
            qd.remove(clips, function (point) {
                return point === clip1;
            });
        }

        depth[1] = qd.Vector2D.dot(referenceEdgeNormal, clip2) - maxSeparation;

        if (depth[1] < 0) {
            qd.remove(clips, function (point) {
                return point === clip2;
            });
        }

    //    qd.debug("Number of contacts: ", clips.length)

        manifold.contactsCount = clips.length;

        for (i = 0; i < clips.length; i += 1) {
    //        manifold.contactsDepth[i] = depth[i];
            contact = manifold.contacts[i];
            qd.Vector2D.copy(contact, clips[i]);
            qd.Vector2D.subtract(a.radialContacts[i], contact, a.position);
            qd.Vector2D.subtract(b.radialContacts[i], contact, b.position);
        }
    };

    /**
     * Clips the line segment between points {@code pointA} and {@code pointB}
     * if they are past the {@code offset} along the {@code normal}.
     *
     * @param {qd.Point2D} pointA
     * @param {qd.Point2D} pointB
     * @param {qd.Vector2D} normal
     * @param {Number} offset
     * @return {Array} the clipped points
     */
    qd.Collision.prototype.clip = function (pointA, pointB, normal, offset) {
        var clips,
            d1,
            d2,
            clipContact,
            clipContactScale;

        clips = [];

        d1 = qd.Vector2D.dot(normal, pointA) - offset;
        d2 = qd.Vector2D.dot(normal, pointB) - offset;

        if (d1 > 0.0) {
            d1 -= qd.math.EPSILON;
        } else {
            d1 += qd.math.EPSILON;
        }

        if (d2 > 0.0) {
            d2 -= qd.math.EPSILON;
        } else {
            d2 += qd.math.EPSILON;
        }
        // If either point is past offset along normal then keep the point
        if (d1 <= 0.0) {
            clips.push(pointA);
        } else {
    //            qd.debug("d1 ", d1)
        }

        if (d2 <= 0.0) {
            clips.push(pointB);
        } else {
    //            qd.debug("d2 ", d2)
        }

        // Check if the points are on opposing sides so that we can
        // compute the correct point
        if (d1 * d2 < 0.0) {
            // if they are on different sides of the
            // offset, d1 and d2 will be a (+) * (-)
            // and will yield a (-) and therefore be
            // less than zero
            // get the vector for the edge we are clipping
            // compute the location along e
            clipContact = qd.Vector2D.subtract(qd.Vector2D.create(0, 0), pointB, pointA);
            clipContactScale = d1 / (d1 - d2);
            qd.Vector2D.mutateScale(clipContact, clipContactScale);
            qd.Vector2D.mutateAdd(clipContact, pointA);
            clips.push(clipContact);
        }

        return clips;
    };

    qd.Collision.prototype.resolveCollision = function (manifold, dt) {
        var i,
            contactsCount = manifold.contactsCount,
            a = manifold.a,
            b = manifold.b,
            bodyA = a.body,
            bodyB = b.body,

            radialContactsA = a.radialContacts,
            radialContactsB = b.radialContacts,
            radialContactA,
            radialContactB,
            relativeContactVelocity,

            normal = manifold.normal,
            normalSpeed,

            restitution,
            inverseMomentA = a.inverseMoment,
            inverseMomentB = b.inverseMoment,
            inverseMassA = a.inverseMass,
            inverseMassB = b.inverseMass,

            impulseScalar,
            impulseScalarDivider,
            impulse;

        for (i = 0; i < contactsCount; i += 1) {

            // Calculate relative velocity

            radialContactA = radialContactsA[i];
            radialContactB = radialContactsB[i];
            relativeContactVelocity = this.relativeContactVelocity(manifold, radialContactA, radialContactB);

            // Calculate speed along normal
            normalSpeed = qd.Vector2D.dot(relativeContactVelocity, normal);

            // Cache normal speed
            manifold.normalSpeed = normalSpeed;

            // Do not resolve if bodies are separating
            if(normalSpeed >= 0) {
                return;
            }

            // Calculate restitution
            // TODO: If only gravity moving object, set restitution to zero
            restitution = Math.min(a.restitution, b.restitution);

            // Calculate impulse scalar
            impulseScalar = -(1.0 + restitution) * normalSpeed;

            impulseScalarDivider = (inverseMassA + inverseMassB)
                + (qd.math.square(qd.Vector2D.cross(radialContactA, normal)) * inverseMomentA)
                + (qd.math.square(qd.Vector2D.cross(radialContactB, normal)) * inverseMomentB);

            if (impulseScalarDivider !== 0) {
                impulseScalar /= (impulseScalarDivider * contactsCount);

                // Cache impulse scalar
                manifold.impulseScalar = impulseScalar;

                // Calculate and cache impulse vector
                impulse = qd.Vector2D.set(manifold.impulse, impulseScalar * normal[0], impulseScalar * normal[1]);

                // Apply impulse
                this.applyMutualImpulse(impulse, radialContactA, radialContactB, bodyA, bodyB);
            }
        }
    };

    qd.Collision.prototype.relativeContactVelocity = function (manifold, radialContactA, radialContactB) {
        var a = manifold.a,
            b = manifold.b,

            radialVelocityA = qd.Vector2D.scaleCross(manifold.radialVelocityA, a.angularVelocity, radialContactA),
            contactVelocityA = qd.Vector2D.subtract(manifold.contactVelocityA, a.velocity, radialVelocityA),

            radialVelocityB = qd.Vector2D.scaleCross(manifold.radialVelocityB, b.angularVelocity, radialContactB),
            contactVelocityB = qd.Vector2D.add(manifold.contactVelocityB, b.velocity, radialVelocityB);

        return qd.Vector2D.subtract(manifold.relativeContactVelocity, contactVelocityB, contactVelocityA);
    };

    /**
     * Apply a mutual impulse to a pair of bodies (body A and body B).
     */
    qd.Collision.prototype.applyMutualImpulse = function (impulse, radialContactA, radialContactB, bodyA, bodyB) {
        var deltaVelocityA = bodyA.deltaVelocity,
            deltaVelocityB = bodyB.deltaVelocity,
            deltaAngularVelocityA,
            deltaAngularVelocityB;

        // Calculate change in velocity
        qd.Vector2D.scale(deltaVelocityA, -bodyA.inverseMass, impulse);
        qd.Vector2D.scale(deltaVelocityB, bodyB.inverseMass, impulse);

        // Update velocity
        qd.Vector2D.mutateAdd(bodyA.velocity, deltaVelocityA);
        qd.Vector2D.mutateAdd(bodyB.velocity, deltaVelocityB);

        // Update angular velocity
        // Note that the impulse on body A is opposite to the impulse on body B
//        bodyA.torque += qd.Vector2D.cross(radialContactA, impulse);
        deltaAngularVelocityA = bodyA.inverseMoment * qd.Vector2D.cross(radialContactA, impulse);
        bodyA.angularVelocity += deltaAngularVelocityA;

//        bodyB.torque -= qd.Vector2D.cross(radialContactB, impulse);
        deltaAngularVelocityB = -bodyB.inverseMoment * qd.Vector2D.cross(radialContactB, impulse);
        bodyB.angularVelocity += deltaAngularVelocityB;
    };

    qd.Collision.prototype.applyFrictionImpulse = function (manifold) {
        var i,
            contactsCount = manifold.contactsCount,
            a = manifold.a,
            b = manifold.b,
            bodyA = a.body,
            bodyB = b.body,
            relativeContactVelocity,
            radialContactsA = a.radialContacts,
            radialContactsB = b.radialContacts,
            radialContactA,
            radialContactB,
            tangent = manifold.tangent,
            normal = manifold.normal,
            normalVelocity = manifold.normalVelocity,
            tangentImpulseScalar,
            inverseMassA = a.inverseMass,
            inverseMassB = b.inverseMass,
            sumInverseMass = inverseMassA + inverseMassB,
            mu,
            impulseScalar = manifold.impulseScalar,
            staticFrictionA = a.linearStaticFriction,
            staticFrictionB = b.linearStaticFriction,
            dynamicFrictionA = a.linearDynamicFriction,
            dynamicFrictionB = b.linearDynamicFriction,
            frictionImpulse = manifold.frictionImpulse,
            dynamicFriction;

        for (i = 0; i < contactsCount; i += 1) {

            // Need to re-calculate relative velocity after the normal impulse has been applied
            radialContactA = radialContactsA[i];
            radialContactB = radialContactsB[i];
            relativeContactVelocity = this.relativeContactVelocity(manifold, radialContactA, radialContactB);

            // Solve for the tangent vector
            normalVelocity = qd.Vector2D.scale(
                normalVelocity, qd.Vector2D.dot(relativeContactVelocity, normal), normal);

            tangent = qd.Vector2D.subtract(tangent, relativeContactVelocity, normalVelocity);

            qd.Vector2D.mutateNormalise(tangent);

            // Solve for magnitude to apply along the friction vector
            tangentImpulseScalar = -qd.Vector2D.dot(relativeContactVelocity, tangent);

            if (sumInverseMass !== 0) {
                tangentImpulseScalar /= (sumInverseMass * contactsCount);

                // Use to approximate mu given friction coefficients of each body
                mu = qd.math.pythagoreanSolve(staticFrictionA, staticFrictionB);

                // Clamp magnitude of friction and create impulse vector
                if (Math.abs(tangentImpulseScalar) < impulseScalar * mu) {
                    frictionImpulse = qd.Vector2D.scale(frictionImpulse, tangentImpulseScalar, tangent);
                } else {
                    dynamicFriction = qd.math.pythagoreanSolve(dynamicFrictionA, dynamicFrictionB);
                    frictionImpulse = qd.Vector2D.mutateNegate(
                        qd.Vector2D.scale(frictionImpulse, impulseScalar * dynamicFriction, tangent));
                }

                //            qd.debug("Friction Mag: ", qd.Vector2D.magnitude(frictionImpulse));

                this.applyMutualImpulse(frictionImpulse, radialContactA, radialContactB, bodyA, bodyB);
            }
        }
    };

    qd.Collision.prototype.separateCollidingBodies = function (manifold) {
        var a,
            b,
            sumInverseMass,
            inverseMassA,
            inverseMassB,
            normal,
            penetrationCorrection,
            correctionScalar,
            positionCorrection,
            positionCorrectionA,
            positionCorrectionB;

        a = manifold.a;
        b = manifold.b;

        inverseMassA = a.inverseMass;
        inverseMassB = b.inverseMass;

        sumInverseMass = inverseMassA + inverseMassB;

        if (sumInverseMass !== 0) {
            normal = manifold.normal;
            penetrationCorrection = Math.max(manifold.penetration - this._penetrationSlop, 0.0);
            correctionScalar = (penetrationCorrection / sumInverseMass) * this._penetrationPercent;
            positionCorrection = qd.Vector2D.scale(manifold.positionCorrection, correctionScalar, normal);
            positionCorrectionA = qd.Vector2D.scale(a.positionCorrection, inverseMassA, positionCorrection);
            positionCorrectionB = qd.Vector2D.scale(b.positionCorrection, inverseMassB, positionCorrection);

            qd.Point2D.mutateSubtract(a.position, positionCorrectionA);
            qd.Point2D.mutateAdd(b.position, positionCorrectionB);
        }
    };
}(qd));
