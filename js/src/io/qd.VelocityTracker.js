(function (qd) {

    /**
     * qd.Input.VelocityTracker tracks the velocity of a point
     * between two instants of time.
     *
     * @param {Number?} x position of the point at the first instant
     * @param {Number?} y position of the point at the first instant
     * @constructor
     */
    qd.VelocityTracker = function (x, y) {
        this.start(x, y);
    };

    qd.VelocityTracker.prototype = {

        /**
         * Start tracking velocity by specifying the x and y coordinates of
         * the point at the first instant of time.
         *
         * @param {Number?} x position of the point at the first instant
         * @param {Number?} y position of the point at the first instant
         */
        start: function (x, y) {
            this.initialX = (x || 0);
            this.initialY = (y || 0);
            this.vx = 0;
            this.vy = 0;
        },

        /**
         * Mark the x and y coordinates of the point at second (or subsequent)
         * instant of time.
         *
         * @param {Number?} x position of the point at the subsequent instant
         * @param {Number?} y position of the point at the subsequent instant
         */
        track: function (x, y) {
            this.vx = x - this.initialX;
            this.vy = y - this.initialY;
            this.initialX = x;
            this.initialY = y;
        }
    };

}(qd));
