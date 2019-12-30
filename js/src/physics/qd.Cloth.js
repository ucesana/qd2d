/**
 * Represents a 2D rectangular cloth with dimensions {@code width} X {@code height}.
 *
 * The cloth is divided into squares whose vertices are connected by springs with
 * the given {@code springConstant}.
 *
 * @param width
 * @param height
 * @param rows
 * @param columns
 * @param springConstant
 * @constructor
 */
qd.Cloth = function (height, width, rows, columns, springConstant) {
    var dx, dy,
        x, y,
        row, col,
        rowBodies,
        bodyA,
        bodyB,
        rowA,
        rowB;

    function buildSpring(bodyA, bodyB, springConstant) {
        return new qd.DynamicSpring(bodyA, bodyB, springConstant);
    }

    function buildBody(x, y) {
        return new qd.Body(x, y);
    }

    this.columns = columns;
    this.rows = rows;
    this.bodies = []; // 2D array of bodies
    this.springs = []; // flat array of springs

    dx = width / columns;
    dy = height / rows;

    for (row = 0; row < rows; row += 1) {
        y = dy * row;

        rowBodies = [];

        for (col = 0; col < columns; col += 1) {
            x = dx * col;
            rowBodies.push(buildBody(x, y));
        }

        this.bodies.push(rowBodies);
    }

    // Attach springs for each row
    for (row = 0; row < rows; row += 1) {
        for (col = 0; col < columns - 1; col += 1) {
            bodyA = this.bodies[row][col];
            bodyB = this.bodies[row][col + 1];
            this.springs.push(buildSpring(bodyA, bodyB, springConstant));
        }
    }

    // Attach springs for each column
    for (row = 0; row < rows - 1; row += 1) {
        rowA = this.bodies[row];
        rowB = this.bodies[row + 1];

        for (col = 0; col < columns; col += 1) {
            bodyA = rowA[col];
            bodyB = rowB[col];
            this.springs.push(buildSpring(bodyA, bodyB, springConstant));
        }
    }
};

qd.Cloth.prototype.getBodies = function () {
    return this.bodies;
};

qd.Cloth.prototype.getSprings = function () {
    return this.springs;
};

qd.Cloth.prototype.getPerimeterBodies = function () {
    var perimeterBodies = [],
        column,
        row;

    for (column = 0; column < this.columns; column += 1) {
        perimeterBodies.push(this.bodies[0][column]);
    }

    for (row = 1; row < this.rows - 1; row += 1) {
        perimeterBodies.push(this.bodies[row][this.columns - 1]);
    }

    for (column = this.columns - 1; column > 0; column -= 1) {
        perimeterBodies.push(this.bodies[this.rows - 1][column]);
    }

    for (row = this.rows - 1; row > 0; row = row - 1) {
        perimeterBodies.push(this.bodies[row][0]);
    }

    return perimeterBodies;
};