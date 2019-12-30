// /**
//  * qd.Kinematics namespace.
//  *
//  * @type {Object}
//  */
// qd.Kinematics = {};
//
// /**
//  * Drag the {@code segment} to the target point (targetX, targetY).
//  *
//  * @param {qd.Kinematics.Segment} segment
//  * @param {Number} targetX
//  * @param {Number} targetY
//  */
// qd.Kinematics.dragSegment = function (segment, targetX, targetY) {
//     if (segment === null || !(segment instanceof qd.Kinematics.Segment)) {
//         return;
//     }
//
//     var dx, dy, angle, w, h;
//
//     dx = targetX - segment.x;
//     dy = targetY - segment.y;
//     angle = Math.atan2(dy, dx);
//
//     segment.r = angle;
//
//     w = segment.jointX() - segment.x;
//     h = segment.jointY() - segment.y;
//     segment.x = targetX - w;
//     segment.y = targetY - h;
//
//     qd.Kinematics.dragSegment(
//         segment.attachedSegment,
//         segment.x,
//         segment.y
//     );
// };
//
// /**
//  * qd.Kinematics.Segment extends qd.Body
//  *
//  * A kinematics segment has two endpoints (its Head and Joint) separated
//  * by a length. You can create a chain of segments by attaching the head
//  * of one segment to the joint of another segment.
//  *
//  * The head endpoint is treated like a {@code qd.Body}
//  * object and it is positioned by this segment's x and y properties.
//  * All physical interactions with the segment are applied to the head.
//  *
//  * The second endpoint is the segment's joint. Use
//  * {@code qd.Kinematics.Segment.prototype.attachSegment} to
//  * attach the head of another {qd.Physics.Segment} to this
//  * segment's joint.
//  *
//  * @type {qd.Kinematics.Segment|qd.Body}
//  */
// qd.Kinematics.Segment = qd.extendClass(
//     qd.Body,
//     "qd.Kinematics.Segment",
//     function (x, y, r, length) {
//         this.attachedSegment = null;
//         this.segmentLength = length || 0;
//         this.x = x || 0.0;
//         this.y = y || 0.0;
//         this.r = r || 0.0;
//         this.m = 1;
//     }
// );
//
// /**
//  * Builds a {qd.BoundingBox} for the {qd.Kinematics.Segment}.
//  *
//  * @return {qd.BoundingBox}
//  */
// qd.Kinematics.Segment.prototype.buildBoundingBox = function () {
//     var width = Math.abs(this.jointX() - this.x),
//         height = Math.abs(this.jointY() - this.y);
//     return new qd.BoundingBox(this, width, height);
// };
//
// /**
//  * Get this segment joint's x position.
//  *
//  * @return {Number}
//  */
// qd.Kinematics.Segment.prototype.jointX = function () {
//     return qd.Math.rotateXPosition(this.x, this.r, this.segmentLength);
// };
//
// /**
//  * Get the segment joint's y position.
//  *
//  * @return {Number}
//  */
// qd.Kinematics.Segment.prototype.jointY = function () {
//     return qd.Math.rotateYPosition(this.y, this.r, this.segmentLength);
// };
//
// /**
//  * Attach the head of the specified {@code segment} to the tail of this segment.
//  *
//  * @param segment
//  */
// qd.Kinematics.Segment.prototype.attachSegment = function (segment) {
//     this.attachedSegment = segment;
//     this.attachedSegment.x = qd.Math.rotateXPosition(this.x, this.r, this.segmentLength);
//     this.attachedSegment.y = qd.Math.rotateYPosition(this.y, this.r, this.segmentLength);
// };
//
// /**
//  * qd.Kinematics.Rod
//  *
//  * Represents a rod with two points (its Tip and End) separated by a length.
//  *
//  * The rod's tip and end are {qd.Body} objects, so you can
//  * interact with the rod by manipulating them.
//  *
//  * IMPORTANT: Never apply {qd.Physics.prototype.update} function on either of the rod's points.
//  * Instead use {@code qd.Kinematics.Rod.prototype.update} so that
//  * the length between its two points is maintained.
//  *
//  * @param {Number} tipX
//  * @param {Number} tipY
//  * @param {Number} endX
//  * @param {Number} endY
//  * @constructor
//  */
// qd.Kinematics.Rod = function (tipX, tipY, endX, endY) {
//     this.rodLength = qd.Math.distance(tipX, tipY, endX, endY);
//
//     this._tip = new qd.Body(tipX, tipY);
//     this._tip.m = 1;
//     this._tip.boundingBox = new qd.BoundingBox(this._tip, 0, 0);
//
//     this._end = new qd.Body(endX, endY);
//     this._end.m = 1;
//     this._end.boundingBox = new qd.BoundingBox(this._end, 0, 0);
// };
//
// /**
//  * Update the motion of this rod.
//  *
//  * @param {qd.Physics} physics
//  */
// qd.Kinematics.Rod.prototype.update = function (physics) {
//     physics.update(this._tip);
//     physics.update(this._end);
//
//     if (this._end.dragging) {
//         this.dragSegment(this._tip, this._end.x, this._end.y);
//     } else if (this._tip.dragging) {
//         this.dragSegment(this._end, this._tip.x, this._tip.y);
//     } else {
//         this.dragSegment(this._tip, this._end.x, this._end.y);
//         this.dragSegment(this._end, this._tip.x, this._tip.y);
//     }
// };
//
// /**
//  * Move the tip of this rod to the target point (targetX, targetY}. This rod's
//  * end will drag behind its tip.
//  *
//  * @param {qd.Body} body
//  * @param {Number} targetX
//  * @param {Number} targetY
//  */
// qd.Kinematics.Rod.prototype.dragSegment = function (body, targetX, targetY) {
//     var dx, dy, angle, jointX, jointY, w, h;
//
//     dx = targetX - body.x;
//     dy = targetY - body.y;
//     angle = Math.atan2(dy, dx);
//
//     jointX = (body.x + Math.cos(angle) * this.rodLength);
//     jointY = (body.y + Math.sin(angle) * this.rodLength);
//
//     w = jointX - body.x;
//     h = jointY - body.y;
//     body.x = targetX - w;
//     body.y = targetY - h;
// };
//
// /**
//  * Get the tip of this rod.
//  *
//  * @return {qd.Body}
//  */
// qd.Kinematics.Rod.prototype.tip = function () {
//     return this._tip;
// };
//
// /**
//  * Get the end of this rod.
//  *
//  * @return {qd.Body}
//  */
// qd.Kinematics.Rod.prototype.end = function () {
//     return this._end;
// };
//
// /**
//  * Constructs a flexible rod with the given {@code numberJoints}.
//  * Each joint is represented by a {@code qd.Spring.CoiledSpring}
//  * with the given {@code springConstant}.
//  *
//  * @param {qd.Point2D} tipPoint
//  * @param {qd.Point2D} endPoint
//  * @param numberInternalJoints internal joints between the tip and the end
//  * @param springConstant of each joint
//  * @constructor
//  */
// qd.Kinematics.FlexibleRod = function (tipPoint, endPoint, numberInternalJoints, springConstant) {
//     var numberJoints = numberInternalJoints + 2, // includes tip and end joints
//         angle,
//         i,
//         lambda,
//         dLambda,
//         jointPoint,
//         joint;
//
//     this.rodLength = tipPoint.distance(endPoint);
//
//     // Build the joints
//     this.joints = [];
//     angle = qd.Math.angleOf(tipPoint.x, tipPoint.y, endPoint.x, endPoint.y);
//
//     dLambda = 1 / (numberJoints - 1);
//
//     for (i = 0; i < numberJoints; i += 1) {
//         joint = new qd.Spring.CoiledSpring({
//             rotation: angle,
//             equilibriumAngle: angle,
//             springConstant: springConstant
//         });
//
//         lambda = i * dLambda;
//         jointPoint = qd.Math.lerpPoint2D(tipPoint, endPoint, lambda);
//         joint.x = jointPoint.x;
//         joint.y = jointPoint.y;
//         joint.m = 1;
//         joint.boundingBox = new qd.BoundingBox(joint, 10, 10);
//
//         this.joints.push(joint);
//     }
//
//     this.tip = this.joints[0];
//     this.end = this.joints[numberJoints - 1];
// };
//
// /**
//  * Update the motion of this rod.
//  *
//  * @param {qd.Physics} physics
//  */
// qd.Kinematics.FlexibleRod.prototype.update = function (physics) {
//     var joint0,
//         joint1,
//         i,
//         segmentLength = this.rodLength / (this.joints.length - 1);
//
//     for (i = 0; i < this.joints.length - 1; i += 1) {
//         joint0 = this.joints[i];
//         joint1 = this.joints[i + 1];
//
//         this.dragSegment(joint0, joint1.x, joint1.y, segmentLength);
//         //this.dragSegment(joint1, joint0.x, joint0.y, segmentLength);
//     }
// };
//
// /**
//  * Move the tip of this rod to the target point (targetX, targetY}. This rod's
//  * end will drag behind its tip.
//  *
//  * @param {qd.Body} body
//  * @param {Number} targetX
//  * @param {Number} targetY
//  */
// qd.Kinematics.FlexibleRod.prototype.dragSegment = function (body, targetX, targetY, segmentLength) {
//     var dx, dy, angle, jointX, jointY, w, h;
//
//     dx = targetX - body.x;
//     dy = targetY - body.y;
//     angle = Math.atan2(dy, dx);
//
//     jointX = (body.x + Math.cos(angle) * segmentLength);
//     jointY = (body.y + Math.sin(angle) * segmentLength);
//
//     w = jointX - body.x;
//     h = jointY - body.y;
//     body.x = targetX - w;
//     body.y = targetY - h;
// };
//
// qd.Kinematics.Joint = qd.extendClass(
//     qd.Body,
//     "qd.Kinematics.Joint",
//     function (minR, maxR) {
//         this.minR = minR;
//         this.maxR = maxR;
//     }
// );
