(function (qd) {

    "use strict";

    /**
     * qd.Vector3D
     */
    qd.Vector3D = {

        /**
         * Create a vector with components {@code (x, y, z)}.
         *
         * @param {Number} x
         * @param {Number} y
         * @param {Number} z
         */
        create: function (x, y, z) {
            //noinspection JSCheckFunctionSignatures
            return qd.Tuple.create(x || 0.0, y || 0.0, z || 0.0);
        },

        /**
         * Copy the vector {@code a}.
         *
         * @param {qd.Vector3D} out
         * @param {qd.Vector3D} a
         * @return {qd.Vector3D} out
         */
        copy: function (out, a) {
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            return out;
        },

        /**
         * Clone the vector {@code a}.
         *
         * @param {qd.Vector3D} a
         * @return {qd.Vector3D} the cloned vector
         */
        clone: function (a) {
            return qd.Vector3D.create(a[0], a[1], a[2]);
        },

        /**
         * Negate the vector.
         *
         * @param {qd.Vector3D} out
         * @return {qd.Vector3D} the negated vector
         */
        mutateNegate: function (out) {
            out[0] = -out[0];
            out[1] = -out[1];
            out[2] = -out[2];
        },

        /**
         * Get the magnitude of the vector {@code a}.
         *
         * @param {qd.Vector3D} a
         * @return {Number}
         */
        magnitude:function (a) {
            var x = a[0],
                y = a[1],
                z = a[2];

            return Math.sqrt((x * x) + (y * y) + (z * z));
        },

        /**
         * Normalise the vector {@code a}.
         *
         * @param {qd.Vector3D} out
         * @param {qd.Vector3D} a
         */
        mutateNormalise: function (out, a) {
            var x = a[0],
                y = a[1],
                z = a[2],
                mag = 1 / Math.sqrt((x * x) + (y * y) + (z * z));

            out[0] = (x * mag);
            out[1] = (y * mag);
            out[2] = (z * mag);
        },

        /**
         * Get the dot product of vectors {@code a} and {@code b}
         *
         * @param {qd.Vector3D} a
         * @param {qd.Vector3D} b
         * @return {Number} the magnitude of the dot product
         */
        dot: function (out, a, b) {
            return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        },

        /**
         * Cross product of vectors {@code a} and {@code b}.
         *
         * @param {qd.Vector3D} out
         * @param {qd.Vector3D} a
         * @param {qd.Vector3D} b
         * @return {qd.Vector3D} out
         */
        cross: function (out, a, b) {

            var ax = a[0],
                ay = a[1],
                az = a[2],
                bx = b[0],
                by = b[1],
                bz = b[2];

            out[0] = -az * by + ay * bz;
            out[1] = az * bx - ax * bz;
            out[2] = -ay * bx + ax * by;
            return out;
        },

        /**
         * Add the vectors {@code a} and {@code b}.
         *
         * @param {qd.Vector3D} out
         * @param {qd.Vector3D} a
         * @param {qd.Vector3D} b
         * @return {qd.Vector3D} out
         */
        add: function (out, a, b) {
            out[0] = a[0] + b[0];
            out[1] = a[1] + b[1];
            out[2] = a[2] + b[2];
            return out;
        },

        /**
         * Subtract the vectors {@code a} and {@code b}
         *
         * @param {qd.Vector3D} out
         * @param {qd.Vector3D} a
         * @param {qd.Vector3D} b
         * @return {qd.Vector3D} out
         */
        subtract: function (out, a, b) {
            out[0] = a[0] - b[0];
            out[1] = a[1] - b[1];
            out[2] = a[2] - b[2];
            return out;
        },

        /**
         * Multiply the vector {@code a} by the {@code scalar}.
         *
         * @param {Number} s
         * @param {qd.Vector3D} a
         * @return {qd.Vector3D} out
         */
        scale: function (out, s, a) {
            out[0] = a[0] * s;
            out[1] = a[1] * s;
            out[2] = a[2] * s;
            return out;
        }
    };

}(qd));
