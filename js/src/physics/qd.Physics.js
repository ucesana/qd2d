(function (qd) {

    /**
     * qd.Physics
     *
     * @param {Object?} options
     * @constructor
     */
    qd.Physics = function (options) {
        this.init(options);
    };

    /* Static */

    qd.Physics.rotationalInertia = function (name, properties) {
        var p = properties,
            moment;

        switch (name) {
            case "two-point-masses":
                moment = ((p.massA * p.massB) / (p.massA + p.massB)) * (p.separation * p.separation);
                break;
            case "rod-centre":
                moment = p.mass * p.length * p.length / 12;
                break;
            case "rod-end":
                moment = p.mass * p.length * p.length / 3;
                break;
            case "circular-hoop":
                moment = p.mass * p.radius * p.radius;
                break;
            case "circular-disk":
                moment = p.mass * p.radius * p.radius / 2;
                break;
            case "cylinder":
                moment = p.mass * p.radius * p.radius / 2;
                break;
            case "rectangle":
                moment = (p.mass / 12) * (p.height * p.height + p.width * p.width);
                break;
            case "polygon":
                // TODO:
                break;
            case "point-mass":
            default:
                moment = p.mass * p.radius * p.radius;
        }

        return moment;
    };

    /* Public Methods */

    qd.Physics.prototype.init = function (options) {
        this.settings = qd.mergeProperties({
            linearDamping: 1,
            rotationalDamping: 1,
            gravity: 0,
            gravitationalConstant: 0,
            integrator: "euler",
            penetrationPercent: 1,
            penetrationSlop: 0.02,
            canvas: null
        }, (options || {}));

        this._integrator = this.integrator(this.settings.integrator);
        this._collision = new qd.Collision(this);
        this._forceFields = [];
        this._bodies = [];

        this._linearDamping = this.settings.linearDamping;
        this._rotationalDamping = this.settings.rotationalDamping;
        this._gravitationalConstant = this.settings.gravitationalConstant;
        this._gravitationalField = this.forceField("gravitational-field", { "gravity": this.settings.gravity } );
        this._forceFields.push(this._gravitationalField);
        this._constraints = [];
        this._energy = {
            kinetic: 0,
            potential: 0
        };
    };

    qd.Physics.prototype.clear = function () {
        this._bodies = [];
        return this;
    };

    qd.Physics.prototype.setting = function (setting, value) {
        qd.debug("qd.Physics.setting: ", setting, ", ", value);

        switch (setting) {
            case "linearDamping":
                this._linearDamping = value;
                break;
            case "rotationalDamping":
                this._rotationalDamping = value;
                break
            case "gravity":
                this._gravitationalField._gravity = value;
                break;
            case "gravitationalConstant":
                this._gravitationalConstant = value;
                break;
            default:
            // Nothing to set
        }

        return this;
    };

    /**
     * Simulate a physic's time step.
     *
     * @param {Number} t current simulation time
     * @param {Number} dt current simulation time step
     * @return {qd.Physics}
     */
    qd.Physics.prototype.step = function (t, dt) {
        var bodies = this._bodies,
            i,
            body,
            integrate = this._integrator.integrate;

        // Add up all forces on all bodies

        for (i = 0; i < bodies.length; i += 1) {
            body = bodies[i];

            if (body.active) {
                body.clearForcesAndDeltas();
                this.applyForceFields(body, dt);
            }
        }

        // Apply gravitation

        if (this._gravitationalConstant > 0) {
            this.eachActiveInteraction(bodies, this.gravitate);
        }

        // Apply Constraints
        for (i = 0; i < this._constraints.length; i += 1) {
            this._constraints[i].apply();
        }

        // Resolve collisions
        this._collision.resolve(bodies);

        // Displacement, Derivative, Acceleration
        for (i = 0; i < bodies.length; i += 1) {
            body = bodies[i];

            if (body.active) {
                integrate(body, t, dt);
                this.applyDamping(body);
            }
        }

        return this;
    };

    qd.Physics.prototype.add = function (object) {
        if (object.constructor === qd.Body) {

            this._bodies.push(object);

        } else if (object.constructor === qd.Physics.ConstantGravitationalField
                || object.constructor === qd.Physics.VariableGravitationalField) {

            this._forceFields.push(object);

        } else if (object.constructor === qd.EulerIntegrator
                || object.constructor === qd.SymplecticEulerIntegrator
                || object.constructor === qd.VerletIntegrator) {

            this.integrator = object;

        } else if (object.constructor === qd.Physics.DistanceConstraint) {

            this._constraints.push(object);

        }

        return this;
    };

    qd.Physics.prototype.remove = function (object) {
        if (object.constructor === qd.Body) {

            qd.remove(this._bodies, function (body) {
                return object === body;
            });

        } else if (object.constructor === qd.Physics.ConstantGravitationalField
                || object.constructor === qd.Physics.VariableGravitationalField) {

            qd.remove(this._forceFields, function (forceField) {
                return object === forceField;
            });

        } else if (object.constructor === qd.Physics.DistanceConstraint) {

            qd.remove(this._constraints, function (constraint) {
                return object === constraint;
            });

        }

        return this;
    };

    /**
     * Body factory method.
     *
     * @param type
     * @param bounds
     * @return {*}
     */
    qd.Physics.prototype.body = function (type, options) {
        var body;

        switch (type) {
            case "dynamic":
                body = new qd.Body(options.bounds, this.material(options.material));
                break;
            case "static":
            default:
                body = new qd.Body(options.bounds, this.material("static"));
        }

        return body;
    };

    /**
     * Material factory method.
     *
     * @param {String} type
     */
    qd.Physics.prototype.material = function (type) {
        var material;

        switch (type) {
            case "rock":
                material = {
                    density: 0.0006,
                    restitution: 0.1,
                    linearStaticFriction: 0.9,
                    linearDynamicFriction: 0.9
                };
                break;
            case "wood":
                material = {
                    density: 0.0003,
                    restitution: 0.01,
                    linearStaticFriction: 0.7,
                    linearDynamicFriction: 0.6
                };
                break;
            case "metal":
                material = {
                    density: .0012,
                    restitution: 0.05,
                    linearStaticFriction: 0.4,
                    linearDynamicFriction: 0.3
                };
                break;
            case "bouncyBall":
                material = {
                    density: 0.0003,
                    restitution: 0.8,
                    linearStaticFriction: 0.5,
                    linearDynamicFriction: 0.5
                };
                break;
            case "superBall":
                material = {
                    density: 0.0003,
                    restitution: 0.95,
                    linearStaticFriction: 0.5,
                    linearDynamicFriction: 0.5
                };
                break;
            case "pillow":
                material = {
                    density: 0.0001,
                    restitution: 0.02,
                    linearStaticFriction: 0.6,
                    linearDynamicFriction: 0.5
                };
                break;
            case "static":
            default:
                material = {
                    density: 0.0,
                    restitution: 0.4,
                    linearStaticFriction: .1,
                    linearDynamicFriction: .1
                };
        }

        return material
    };

    qd.Physics.ConstantField = function (vectorField) {
        this._vectorField = vectorField;
    };

    qd.Physics.ConstantField.prototype.apply = function (body, dt) {
        var field = this._vectorField,
            mass = body.mass,
            force = body.force;

        force[0] = field[0] * mass;
        force[1] = field[1] * mass;
    };

    qd.Physics.ConstantGravitationalField = function (gravity) {
        this._gravity = gravity;
    };

    qd.Physics.ConstantGravitationalField.prototype.apply = function (body, dt) {
        body.force[1] += this._gravity * body.gMass;
    };

    qd.Physics.VariableGravitationalField = function (vectorFieldEquation) {
        this._fieldEquation = vectorFieldEquation;
    };

    qd.Physics.VariableGravitationalField.prototype.apply = function (body, dt) {
        var position = body.position,
            mass = body.mass,
            force = body.force,
            field = this._fieldEquation.evaluate(position[0], position[1]);

        force[0] += field[0] * mass;
        force[1] += field[1] * mass;
    };

    qd.Physics.DynamicGravitationalField = function (fieldEquation) {
        this._fieldEquation = fieldEquation;
    };

    qd.Physics.DynamicGravitationalField.prototype.apply = function (body, dt) {
        var position = body.position,
            mass = body.mass,
            force = body.force,
            field = this._fieldEquation.evaluate(position[0], position[1], dt);

        force[0] += field[0] * mass;
        force[1] += field[1] * mass;
    };

    /**
     * Force field builder.
     *
     * @param fieldVector
     */
    qd.Physics.prototype.forceField = function (type, properties) {
        var forceField;

        switch (type) {
            case "gravitational-field":
            case "constant-gravitational-field":
                forceField = new qd.Physics.ConstantGravitationalField(properties.gravity);
                break;
            case "variable-gravitational-field":
                forceField = new qd.Physics.VariableGravitationalField(properties._fieldEquation);
                break;
            case "dynamic-gravitational-field":
                forceField = new qd.Physics.DynamicGravitationalField(properties._fieldEquation);
                break;
            default:
                forceField = new qd.Physics.ConstantGravitationalField(this.settings.gravity);
        }

        return forceField;
    };

    /**
     * Integrator factory method.
     *
     * @param {String} name
     * @return {Function}
     */
    qd.Physics.prototype.integrator = function (name, settings) {
        var integrator;

        switch (name) {
            case "semi-implicit-euler":
            case "symplectic-euler":
                integrator = new qd.Physics.SymplecticEulerIntegrator(this, settings);
                break;
            case "verlet":
                integrator = new qd.Physics.VerletIntegrator(this, settings);
                break;
            case "euler":
            case "explicit-euler":
            default:
                integrator = new qd.Physics.EulerIntegrator(this, settings);
        }

        return integrator;
    };

    /**
     * Euler Integrator.
     *
     * @constructor
     */
    qd.Physics.EulerIntegrator = function () {

    };

    qd.Physics.EulerIntegrator.prototype.integrate = function (body, t, dt) {
        var inverseMass,
            position,
            deltaPosition,
            dx,
            dy,
            velocity,
            force,
            inverseMoment,
            deltaAngle;

        inverseMass = body.inverseMass;

        if (inverseMass > 0) {
            // Linear displacement
            position = body.position;
            deltaPosition = body.deltaPosition;
            velocity = body.velocity;

            dx = velocity[0] * dt;
            dy = velocity[1] * dt;

            deltaPosition[0] = dx;
            deltaPosition[1] = dy;

            position[0] += dx;
            position[1] += dy;

            // Linear acceleration
            force = body.force;

            velocity[0] += force[0] * inverseMass * dt;
            velocity[1] += force[1] * inverseMass * dt;
        }

        inverseMoment = body.inverseMoment;

        if (inverseMoment > 0) {
            // Rotational displacement
            deltaAngle = body.angularVelocity * dt;
            body.deltaAngle = deltaAngle;
            body.angle += deltaAngle;

            // Rotational acceleration
            body.angularVelocity += body.torque * inverseMoment * dt;
        }
    };

    qd.Physics.SymplecticEulerIntegrator = function () {

    };

    qd.Physics.SymplecticEulerIntegrator.prototype.integrate = function (body, t, dt) {
        var force,
            velocity,
            position,
            deltaPosition,
            dx,
            dy,
            inverseMass,
            inverseMoment,
            deltaAngle;

        inverseMass = body.inverseMass;

        if (inverseMass > 0) {
            // Linear acceleration
            force = body.force;
            velocity = body.velocity;

            velocity[0] += (force[0] * inverseMass * dt);
            velocity[1] += (force[1] * inverseMass * dt);

            // Linear displacement
            position = body.position;
            deltaPosition = body.deltaPosition;

            dx = velocity[0] * dt;
            dy = velocity[1] * dt;

            deltaPosition[0] = dx;
            deltaPosition[1] = dy;

            position[0] += dx;
            position[1] += dy;
        }

        inverseMoment = body.inverseMoment;

        if (inverseMoment > 0) {
            // Rotational acceleration
            body.angularVelocity += body.torque * inverseMoment * dt;

            // Rotational displacement
            deltaAngle = body.angularVelocity * dt;
            body.deltaAngle = deltaAngle;
            body.angle += deltaAngle;
        }
    };

    qd.Physics.VerletIntegrator = function () {

    };

    qd.Physics.VerletIntegrator.prototype.integrate = function (body, t, dt) {
        var force,
            position,
            positionX,
            positionY,
            previousPosition,
            deltaPosition,
            inverseMass,
            accelerationX,
            accelerationY,
            velocity,
            deltaVelocityX,
            deltaVelocityY,
            inverseMoment,
            angularAcceleration,
            deltaAngularVelocity;

        // Linear motion
        inverseMass = body.inverseMass;

        if (inverseMass > 0) {
            // Get position data
            position = body.position;
            previousPosition = body.previousPosition;
            deltaPosition = body.deltaPosition;

            // Calculate acceleration
            force = body.force;
            accelerationX = force[0] * inverseMass;
            accelerationY = force[1] * inverseMass;

            // Update velocity
            deltaVelocityX = accelerationX * dt;
            deltaVelocityY = accelerationY * dt;

            velocity = body.velocity;
            velocity[0] += deltaVelocityX;
            velocity[1] += deltaVelocityY;

            // Update position
            positionX = position[0];
            positionY = position[1];

            deltaPosition[0] = (positionX - previousPosition[0]) + deltaVelocityX * dt;
            deltaPosition[1] = (positionY - previousPosition[1]) + deltaVelocityY * dt;

            position[0] += deltaPosition[0];
            position[1] += deltaPosition[1];

            previousPosition[0] = position[0];
            previousPosition[1] = position[1];
        }

        // Angular motion
        inverseMoment = body.inverseMoment;

        if (inverseMoment > 0) {
            // Rotational displacement
            angularAcceleration = body.torque * inverseMoment;
            deltaAngularVelocity = angularAcceleration * dt;
            body.deltaAngle = (body.angle - body.previousAngle) + deltaAngularVelocity * dt;
            body.angle += body.deltaAngle;
            body.previousAngle = body.angle;

            // Rotational acceleration
            body.angularVelocity += deltaAngularVelocity;
        }
    };

    qd.Physics.prototype.constraint = function (name, properties) {
        switch (name) {
            case "distance":
                return new qd.Physics.DistanceConstraint(properties.bodyA, properties.bodyB, properties.distance);
                break;

            default:
            // Maximum world collision box
        }
    };

    qd.Physics.DistanceConstraint = function (bodyA, bodyB, target) {
        this.bodyA = bodyA;
        this.bodyB = bodyB;
        this.target = target;

        // Cache
        this.direction = qd.Vector2D.create(0.0, 0.0);
    };

    qd.Physics.DistanceConstraint.prototype.apply = function () {
        var positionA = this.bodyA.position,
            positionB = this.bodyB.position,
            direction = qd.Vector2D.subtract(this.direction, positionB, positionA),
            length = qd.Vector2D.magnitude(direction),
            factor = (length - this.target) / (length * 2.0),
            correction = qd.Vector2D.mutateScale(direction, factor);

        qd.Vector2D.mutateAdd(positionA, correction);
        qd.Vector2D.mutateSubtract(positionB, correction);
    };

    qd.Physics.prototype.applyDamping = function (body) {
        var linearDamping,
            velocity;

        if (body.mass > 0) {
            // Linear Damping
            velocity = body.velocity;
            linearDamping = this._linearDamping;
            velocity[0] *= linearDamping;
            velocity[1] *= linearDamping;
        }

        if (body.moment > 0) {
            // Rotational Damping
            body.angularVelocity *= this._rotationalDamping;
        }

        return this;
    };

    qd.Physics.prototype.applyForceFields = function (body) {
        var i,
            forceFields = this._forceFields,
            forceField;

        for (i = 0; i < forceFields.length; i += 1) {
            forceField = forceFields[i];
            forceField.apply(body);
        }
    };

    qd.Physics.prototype.kineticEnergy = function (body) {
        var speed = qd.Vector2D.magnitude(body.velocity);

        return 0.5 * body.mass * speed * speed;
    };

    /**
     * Applies the interactor function for each pair of active {@code bodies}.
     *
     * @param {Array<qd.Body>} bodies
     * @param {Function} interactor function(bodyA, bodyB}
     * @return {qd.Physics}
     */
    qd.Physics.prototype.eachActiveInteraction = function (bodies, interactor, context) {
        var i,
            j,
            bodyA,
            bodyB,
            interactorCtx = context || this;

        for (i = 0; i < bodies.length - 1; i += 1) {
            bodyA = bodies[i];
            if (bodyA.active) {
                for (j = i + 1; j < bodies.length; j += 1) {
                    bodyB = bodies[j];
                    if (bodyB.active) {
                        interactor.call(interactorCtx, bodyA, bodyB);
                    }
                }
            }
        }
        return this;
    };

    /**
     * Applies the interactor function for each pair of {@code bodies}, whether they are active or not.
     *
     * @param {Array<qd.Body>} bodies
     * @param {Function} interactor function(bodyA, bodyB}
     * @return {qd.Physics}
     */
    qd.Physics.prototype.eachInteraction = function (bodies, interactor, context) {
        var i,
            j,
            bodyA,
            bodyB,
            interactorCtx = context || this;

        for (i = 0; i < bodies.length - 1; i += 1) {
            bodyA = bodies[i];

            for (j = i + 1; j < bodies.length; j += 1) {
                bodyB = bodies[j];

                interactor.call(interactorCtx, bodyA, bodyB);
            }
        }
        return this;
    };

    qd.Physics.prototype.gravitate = function (bodyA, bodyB) {
        var pA,
            pB,
            dx,
            dy,
            distSquared,
            oneOverDistSquared,
            oneOverNormalLength,
            massA,
            massB,
            forceScalar,
            forceX,
            forceY,
            fA,
            fB,
            normalX,
            normalY;

        massA = bodyA.gMass;
        massB = bodyB.gMass;

        if (massA !== 0 && massB !== 0) {
            pA = bodyA.position;
            pB = bodyB.position;

            dx = pB[0] - pA[0];
            dy = pB[1] - pA[1];

            distSquared = dx * dx + dy * dy;

            if (distSquared >= 0) {
                oneOverDistSquared = 1 / distSquared;
                forceScalar = this._gravitationalConstant * massA * massB * oneOverDistSquared;

                oneOverNormalLength = Math.sqrt(oneOverDistSquared);
                normalX = dx * oneOverNormalLength;
                normalY = dy * oneOverNormalLength;

                forceX = forceScalar * normalX;
                forceY = forceScalar * normalY;

                fA = bodyA.force;
                fB = bodyB.force;

                fA[0] += forceX;
                fA[1] += forceY;

                fB[0] -= forceX;
                fB[1] -= forceY;

                // Calculate and cache gravitational potential energy
                var den = (Math.sqrt(distSquared) - bodyA.bounds.radius() - bodyB.bounds.radius());
                if (den > 0) {
                    this._energy.potential += -this._gravitationalConstant * massA * massB / den;
                }
            }
        }
    };

}(qd));
