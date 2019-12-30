(function (qd) {
    "use strict";

    qd.Matrix44 = {

        create: function (a, b, c, d,
                          e, f, g, h,
                          i, j, k, l,
                          m, n, o, p) {

            return [
                [a, b, c, d],
                [e, f, g, h],
                [i, j, k, l],
                [m, n, o, p]
            ];
        },

        createEmpty: function () {
            return [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ];
        },

        createIdentity: function () {
            return [
                [1, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1]
            ];
        },

        multiply: function (out, a, b) {
            var i,
                j;

            for (i = 0; i < 4; ++i) {
                for (j = 0; j < 4; ++j) {
                    out[i][j] = a[i][0] * b[0][j] + a[i][1] * b[1][j] +
                        a[i][2] * b[2][j] + a[i][3] * b[3][j];
                }
            }
        },

        multiplied: function (a, b) {
            var out = qd.Matrix44.createEmpty();
            return qd.Matrix44.multiply(out, a, b);
        },

        transpose: function (out, a) {
            var i,
                j;

            for (i = 0; i < 4; ++i) {
                for (j = 0; j < 4; ++j) {
                    out[i][j] = a[j][i];
                }
            }

            return out;
        },

        transposed: function (a) {
            var out = qd.Matrix44.createEmpty();
            return qd.Matrix44.transpose(out, a);
        },

        multiplyVectorByMatrix: function (out, vector3, matrix44) {
            var a,
                b,
                c,
                w;

            a = vector3[0] * matrix44[0][0] + vector3[1] * matrix44[1][0] + vector3[2] * matrix44[2][0] + matrix44[3][0];
            b = vector3[0] * matrix44[0][1] + vector3[1] * matrix44[1][1] + vector3[2] * matrix44[2][1] + matrix44[3][1];
            c = vector3[0] * matrix44[0][2] + vector3[1] * matrix44[1][2] + vector3[2] * matrix44[2][2] + matrix44[3][2];
            w = vector3[0] * matrix44[0][3] + vector3[1] * matrix44[1][3] + vector3[2] * matrix44[2][3] + matrix44[3][3];

            out.x = a / w;
            out.y = b / w;
            out.z = c / w;
        },

        multiplyDirMatrix: function (out, vector3, matrix44) {
            var a,
                b,
                c;

            a = vector3[0] * matrix44[0][0] + vector3[1] * matrix44[1][0] + vector3[2] * matrix44[2][0];
            b = vector3[0] * matrix44[0][1] + vector3[1] * matrix44[1][1] + vector3[2] * matrix44[2][1];
            c = vector3[0] * matrix44[0][2] + vector3[1] * matrix44[1][2] + vector3[2] * matrix44[2][2];

            out.x = a;
            out.y = b;
            out.z = c;
        },

        inverse: function (out, a) {
            var i,
                j,
                k;

            // Forward elimination
            for (i = 0; i < 3 ; i++) {
                var pivot = i;

                var pivotSize = a[i][i];

                if (pivotSize < 0)
                    pivotSize = -pivotSize;

                for (j = i + 1; j < 4; j++) {
                    var tmp = a[j][i];

                    if (tmp < 0)
                        tmp = -tmp;

                    if (tmp > pivotSize) {
                        pivot = j;
                        pivotSize = tmp;
                    }
                }

                if (pivotSize == 0) {
                    qd.warn("Cannot invert singular matrix, returning identity matrix");
                    return qd.Matrix44.createIdentity();
                }

                if (pivot != i) {
                    for (j = 0; j < 4; j++) {
                        var tmp;

                        tmp = a[i][j];
                        a[i][j] = a[pivot][j];
                        a[pivot][j] = tmp;

                        tmp = out[i][j];
                        out[i][j] = out[pivot][j];
                        out[pivot][j] = tmp;
                    }
                }

                for (j = i + 1; j < 4; j++) {
                    var f = a[j][i] / a[i][i];

                    for (k = 0; k < 4; k++) {
                        a[j][k] -= f * a[i][k];
                        out[j][k] -= f * out[i][k];
                    }
                }
            }

            // Backward substitution
            for (i = 3; i >= 0; --i) {
                var f;

                if ((f = a[i][i]) == 0) {
                    qd.warn("Cannot invert singular matrix, returning identity matrix.");
                    return qd.Matrix44.createIdentity();
                }

                for (j = 0; j < 4; j++) {
                    a[i][j] /= f;
                    out[i][j] /= f;
                }

                for (j = 0; j < i; j++) {
                    f = a[j][i];

                    for (k = 0; k < 4; k++) {
                        a[j][k] -= f * a[i][k];
                        out[j][k] -= f * out[i][k];
                    }
                }
            }

            return out;
        },

        invert: function (a) {
            var out = qd.Matrix44.createEmpty();
            return qd.Matrix44.inverse(out, a);
        }
    }
});
