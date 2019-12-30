(function (qd) {

    /**
     * qd.Camera
     *
     * @constructor
     */
    qd.Camera = function (view) {

        /* Protected Methods */

        this.update = function () {
            // Update Camera canvas points
            this.canvasPos[0] = this.worldPos[0] * this.view.inverseScale();
            this.canvasPos[1] = this.worldPos[1] * this.view.inverseScale();

            // Notify observers that camera has been updated
            qd.debug("Firing Camera Pan or Zoom Event");
            this.panOrZoomTrigger.fire();
        };

        this.init(view);
    };

    /* Public Methods */

    qd.Camera.prototype.init = function (view) {
        this.view = view;
        this.worldPos = qd.Point2D.create(0, 0);
        this.canvasPos = qd.Point2D.create(0, 0);
        this.zoomStep = 0.1;
        this.panOrZoomTrigger = new qd.EventTrigger();
        return this;
    };

    qd.Camera.prototype.destroy = function () {
        this.panOrZoomTrigger.destroy();
        this.zoomStep = undefined;
        this.canvasPos = undefined;
        this.worldPos = undefined;
        this.view = undefined;
    };

    qd.Camera.prototype.worldXPos = function () {
        return this.worldPos[0];
    };

    qd.Camera.prototype.worldYPos = function () {
        return this.worldPos[1];
    };

    qd.Camera.prototype.canvasXPos = function () {
        return this.canvasPos[0];
    };

    qd.Camera.prototype.canvasYPos = function () {
        return this.canvasPos[1];
    };

    qd.Camera.prototype.position = function (x, y) {
        qd.Point2D.position(this.worldPos, x, y);
        this.update();

        return this;
    };

    // TODO: Rename to pan?
    qd.Camera.prototype.translate = function (dx, dy) {
        var x = this.worldPos[0] + dx,
            y = this.worldPos[1] + dy;

        return this.position(x, y);
    };

    qd.Camera.prototype.zoomLevel = function (zoomLevel) {
        if (zoomLevel) {
            this.view.scale(zoomLevel);
            this.update();
            return this;
        }

        return this.view.scale();
    };

    qd.Camera.prototype.zoomLevels = function (zoomLevels) {
        if (zoomLevels) {
            this.view.maxScale(zoomLevels);
            return this;
        }

        return this.view.maxScale();
    };

    qd.Camera.prototype.zoomOut = function (target) {
        var zoomDelta = this.view.scale() + this.zoomStep;

        if (zoomDelta <= this.view.maxScale()) {
            var centre = target || this.view.centre();
            this.translate(this.view.scale()*centre[0], this.view.scale()*centre[1]);
            this.view.scale(zoomDelta);
            this.translate(-this.view.scale()*centre[0], -this.view.scale()*centre[1]);
            this.update();
        }

        return this;
    };

    qd.Camera.prototype.zoomIn = function (target) {
        var zoomDelta = this.view.scale() - this.zoomStep;

        if (zoomDelta >= this.view.minScale()) {
            var centre = target || this.view.centre();
            this.translate(this.view.scale()*centre[0], this.view.scale()*centre[1]);
            this.view.scale(zoomDelta);
            this.translate(-this.view.scale()*centre[0], -this.view.scale()*centre[1]);
            this.update();
        }

        return this;
    };

    qd.Camera.prototype.onPanOrZoom = function (namespace, handler, context) {
        this.panOrZoomTrigger.bind(namespace, handler, context);
        return this;
    };

    qd.Camera.prototype.offPanOrZoom = function (namespace, handler, context) {
        this.panOrZoomTrigger.unbind(namespace, handler, context);
        return this;
    };

    qd.Camera.prototype.reset = function () {
        this.init(this.view);
    };

}(qd));
