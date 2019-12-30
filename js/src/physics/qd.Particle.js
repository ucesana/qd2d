(function (qd) {

    qd.Particle = function () {
        this.init();
    };

    qd.Particle.prototype.init = function () {
        this.active = true;

        /* Linear motion */

        this.mass = 1.0; // Gravitational Mass
        this.inertialMass = 1.0; // Inertial Mass

        this.position = qd.Point2D.create(0.0, 0.0);

        this.velocity = qd.Vector2D.create(0.0, 0.0);

        /* Electromagnetism */

        this.charge = 0;
    };

    qd.Particle.prototype.mass = function (mass) {
        this.mass = mass;
        this.inertialMass = mass;
        return this;
    };
}(qd));
