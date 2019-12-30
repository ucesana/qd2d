/**
 * qd.Spring
 *
 * @constructor
 */
qd.Spring = function (endPoint0, endPoint1, springLength, springConstant) {
    this.endPoint0 = endPoint0 || new qd.Body();
    this.endPoint1 = endPoint1 || new qd.Body();
    this.springLength = springLength || 0;
    this.springConstant = springConstant || 0.85;
};

/**
 * Update physics of body which has a spring attached to target point
 * {@code (targetX, targetY)} with the specified {@code springConstant}.
 *
 * @param {qd.Body} body
 * @param {Number} targetX
 * @param {Number} targetY
 * @param {Number} springConstant
 */
qd.Spring.updateSpringToTarget = function (body, targetX, targetY, springConstant) {
    body.vx = body.vx + (targetX - body.x) * springConstant;
    body.vy = body.vy + (targetY - body.y) * springConstant;
};

/**
 * Simulates a fixed spring. A fixed spring is a spring that has a
 * fixed length that it tries to maintain.
 */
qd.Spring.prototype.update = function () {
    var dx = this.endPoint1.x - this.endPoint0.x,
        dy = this.endPoint1.y - this.endPoint0.y,
        angle = Math.atan2(dy, dx),
        targetX = this.endPoint0.x + Math.cos(angle) * this.springLength,
        targetY = this.endPoint0.y + Math.sin(angle) * this.springLength;
    this.endPoint1.vx = this.endPoint1.vx + (targetX - this.endPoint1.x) * this.springConstant;
    this.endPoint1.vy = this.endPoint1.vy + (targetY - this.endPoint1.y) * this.springConstant;
};

