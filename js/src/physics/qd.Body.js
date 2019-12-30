(function (qd) {

    /**
     * qd.Body2D represents a rigid, solid body with physical properties
     * such as position, velocity, rotation angle, rotational velocity,
     * and mass.
     *
     * TODO: Should bounds and body be the same object?
     *
     * @constructor
     */
    qd.Body = function (bounds, material) {
        this.init(bounds, material);
    };

    qd.Body.prototype.init = function (bounds, material) {

        /* Bounds */

        this.bounds = bounds;

        this.bounds.onResize("qd.BoundingBox.onResize:qd.Body2D._reposition",
            this._reposition,
            this);

        /* Material */

        this.material = qd.cloneProperties(material);

        /* State */

        this.active = false;  // TODO: Maybe deactivating just removes it from the list of bodies to simulate
        this.asleep = false;

        /* Linear motion */

        this.position = bounds.centroid();
        this.deltaPosition = qd.Vector2D.create(0.0, 0.0);

        this.velocity = qd.Vector2D.create(0.0, 0.0);
        this.deltaVelocity = qd.Vector2D.create(0.0, 0.0);

        // Inertial Mass
        this.mass = 0.0;
        this.inverseMass = 0.0;

        // Gravitational Mass
        this.gMass = 0.0;
        this.inverseGMass = 0.0;

        /* Moment of Inertia */
        this.moment = 0.0;
        this.inverseMoment = 0.0;

        // Density sets both inertial and gravitational mass
        this.density(this.material.density);

        // TODO: Needs to calculate from the shape
        this.momentOfInertia(qd.Physics.rotationalInertia(
            "circular-disk", {
                mass: this.mass,
                radius: this.bounds.radius()
            }
        ));

        this.angle = 0.0;    // Radians
        this.deltaAngle = 0.0;

        this.angularVelocity = 0.0;        // Radians/second

        /* Force, Acceleration, Change of Momentum */

        this.force = qd.Vector2D.create(0.0, 0.0);

        this.torque = 0.0;

        /* Verlet integrator specific */
        this.previousPosition = qd.Point2D.clone(this.position); // Used by Verlet integrator
        this.previousAngle = this.angle;

        /* Collision */
        this.collisionData = {
            contacts: [],
            radialContacts: [],
            edges: []
        };

        /* Constraints */

        // TODO

        return this;
    };

    qd.Body.prototype.destroy = function () {
        this.bounds.offResize("qd.BoundingBox.onResize:qd.Body2D._reposition",
            this._reposition,
            this);

        this.bounds = undefined;
        this.material = undefined;
        this.active = undefined;
        this.asleep = undefined;
        this.position = undefined;
        this.velocity = undefined;
        this.mass = undefined;
        this.inverseMass = undefined;
        this.moment = undefined;
        this.inverseMoment = undefined;
        this.angle = undefined;
        this.angularVelocity = undefined;
        this.force = undefined;
        this.torque = undefined;
    };

    qd.Body.prototype.clone = function (bounds) {
        var bodyCopy = new qd.Body(bounds, this.material);

        bodyCopy.active = this.active;
        bodyCopy.asleep = this.asleep;

        // bodyCopy.position = this.bounds.centroid();
        bodyCopy.velocity = qd.Vector2D.clone(this.velocity);

        bodyCopy.mass = this.mass;
        bodyCopy.inverseMass = this.inverseMass;

        bodyCopy.moment = this.moment;
        bodyCopy.inverseMoment = this.inverseMoment;

        bodyCopy.angle = this.angle;
        bodyCopy.angularVelocity = this.angularVelocity;

        bodyCopy.force = qd.Vector2D.clone(this.force);

        bodyCopy.torque = this.torque;

        return bodyCopy;
    };

    qd.Body.prototype.setProperty = function (property, value) {
        switch (property) {
            case "active":
                this.active = qd.isTruthy(value);
                qd.debug("body.active = " + this.active);
                break;
            case "density":
                this.density(value);
                qd.debug("body.density = " + this.material.density);
                break;
            case "moment":
                this.momentOfInertia(value);
                qd.debug("body.moment = " + this.moment);
                break;
            case "restitution":
                this.restitution(value);
                qd.debug("body.restitution = " + this.material.restitution);
                break;
            default:
                // nothing to set
        }
    };

    /* Private Methods */

    qd.Body.prototype._reposition = function () {
        var position = this.position,
            previousPosition = this.previousPosition,
            deltaPosition = this.deltaPosition,
            bounds = this.bounds,
            centroidX = bounds.centroidX(),
            centroidY = bounds.centroidY();

        // TODO: Should not be repositioning if it was the body that translated the bbox.
        previousPosition[0] = centroidX - deltaPosition[0];
        previousPosition[1] = centroidY - deltaPosition[1];

        position[0] = centroidX;
        position[1] = centroidY;

    //    qd.debug("Repositioning Body to Bounds Centroid");
    };

    qd.Body.prototype.density = function (density) {
        var mass;

        if (density != null) {
            this.material.density = density;
            mass = this.bounds.area() * density;

            this.inertialMass(mass);
            this.gravitationalMass(mass);

            return this;
        }

        return this.material.density;

    };

    /* Public Methods */

    /**
     * Get or set the inertial mass of the body.
     *
     * Note that the mass will override this change if the bounds is resized.
     * @param {Number} mass
     * @return {Number|qd.Body}
     */
    qd.Body.prototype.inertialMass = function (mass) {

        if (mass != null) {
            if (mass > 0) {
                this.mass = mass;
                this.inverseMass = 1 / mass;
            } else {
                this.mass = 0;
                this.inverseMass = 0;

                qd.Vector2D.mutateZero(this.velocity);
            }

            return this;
        }

        return this.mass;
    };

    /**
     * Get or set the gravitational mass of the body.
     *
     * Note that the mass will override this change if the bounds is resized.
     *
     * @param {Number} mass
     * @return {Number|qd.Body}
     */
    qd.Body.prototype.gravitationalMass = function (mass) {

        if (mass != null) {
            if (mass > 0) {
                this.gMass = mass;
                this.inverseGMass = 1 / mass;
            } else {
                this.gMass = 0;
                this.inverseGMass = 0;
            }

            return this;
        }

        return this.gMass;
    };

    /**
     * Calculate rotational inertia given the bounds.
     *
     * @param bounds
     */
    qd.Body.prototype.momentOfInertia = function (moment) {
        if (moment != null) {
            if (moment > 0) {
                this.moment = moment;
                this.inverseMoment = 1 / moment;
            } else {
                this.moment = 0;
                this.inverseMoment = 0;
            }

            return this;
        }

        return this.moment;
    };

    qd.Body.prototype.restitution = function (restitution) {
        if (restitution != null) {
            this.material.restitution = restitution;
            return this;
        }

        return this.material.restitution;
    };

    qd.Body.prototype.activate = function () {
        if (this.active === false) {
            this.active = true;
        }
        return this;
    };

    qd.Body.prototype.deactivate = function () {
        if (this.active) {
            this.active = false;
            qd.Vector2D.mutateZero(this.velocity);
        }
        return this;
    };

    qd.Body.prototype.draw = function (canvas) {
        var cd,
            view,
            contact,
            radialContact,
            position,
            edge,
            i;

        // Draw Body debug features
        cd = this.collisionData;

        if (cd != null) {
            view = canvas.view();

            for (i = 0; i < cd.edges.length; i += 1) {
                // Draw collision edge
                edge = cd.edges[i];
                view.path()
                    .traceLine(edge.pointA[0], edge.pointA[1], edge.pointB[0], edge.pointB[1])
                    .draw({ stroke: "orange", lineWidth: "3" });

                view.path()
                    .traceRectangle(edge.supportPoint[0], edge.supportPoint[1], 5, 5)
                    .draw({ stroke: cd.colour })
            }

            for (i = 0; i < cd.contacts.length; i += 1) {
                // Draw contacts
                contact = cd.contacts[i];
                view.path().traceCircle(contact[0], contact[1], 3);

                // Draw radial contact lines
                position = this.position;
                radialContact = cd.radialContacts[i];
                view.arrow(position, radialContact)
                    .draw({ stroke: cd.colour, fill: cd.colour });
            }
        }
    };

    qd.Body.prototype.clearForcesAndDeltas = function () {
        this.force[0] = 0.0;
        this.force[1] = 0.0;
        this.torque = 0.0;

        this.deltaPosition[0] = 0.0;
        this.deltaPosition[1] = 0.0;

        this.deltaAngle = 0.0;

        this.deltaVelocity[0] = 0.0;
        this.deltaVelocity[1] = 0.0;

        // Clear collision data for debugging
        this.collisionData.contacts = [];
        this.collisionData.radialContacts = [];
        this.collisionData.edges = [];

        return this;
    };

    qd.Body.prototype.accelerate = function (acceleration) {

    };
}(qd));
