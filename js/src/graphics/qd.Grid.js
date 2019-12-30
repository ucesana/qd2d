(function (qd) {

    qd.Grid = function (canvasId, camera) {
        this.init(canvasId, camera);
    };

    qd.Grid.MIN_SPACING = 12;
    qd.Grid.STYLES = { lineWidth: 0.125, stroke: qd.Q_BLUE };

    qd.Grid.prototype.init = function (canvasId, camera) {
        this.canvasId = canvasId;
        this.canvas = new qd.Canvas({ canvas: canvasId });

        this.camera = camera.onPanOrZoom("qd.Camera.onPanOrZoom:qd.Grid.draw", this.draw, this);

        this.minSpacing = qd.Grid.MIN_SPACING;
        this.maxSpacing = qd.Grid.MIN_SPACING * camera.zoomLevels();
        this.style = qd.cloneProperties(qd.Grid.STYLES);

        this.visible = true;
    };

    qd.Grid.prototype.destroy = function () {
        this.camera.offPanOrZoom("qd.Camera.onPanOrZoom:qd.Grid.draw", this.draw, this);

        this.visible = undefined;
        this.style = undefined;
        this.minSpacing = undefined;
        this.camera = undefined;
        this.canvas = undefined;
        this.canvasId = undefined;
    };

    qd.Grid.prototype.reset = function () {
        return this.init(this.canvasId, this.camera);
    };

    qd.Grid.prototype.draw = function () {
        var canvas = this.canvas,
            camera = this.camera,
            cellSize;

        if (this.visible) {
            canvas.clear();
            canvas.path();

            cellSize = this.maxSpacing * (1 / camera.zoomLevel());

            while (cellSize >= this.minSpacing) {
                canvas.grid(cellSize, cellSize, camera.canvasXPos(), camera.canvasYPos());
                cellSize = cellSize / 2;
            }

            canvas.draw(this.style);
        }
    };

    qd.Grid.prototype.enable = function () {
        this.visible = true;
        this.draw();
    };

    qd.Grid.prototype.disable = function () {
        this.visible = false;
        this.canvas.clear();
    };

    qd.Grid.prototype.toggle = function () {
        if (this.visible === true) {
            this.visible = false;
            this.canvas.clear();
        } else if (this.visible === false) {
            this.visible = true;
            this.draw();
        }
    };

}(qd));
