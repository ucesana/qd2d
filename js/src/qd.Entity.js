(function (qd) {

    /**
     * You can bind input events
     *
     * TODO: Bind events to entity
     *
     * @constructor
     */
    qd.Entity = function (engine, layer, graphic, material) {
        var self = this;

        /* Protected Methods */

        this._namespace = function (event) {
            return "qd.Entity." + event + "[id:" + this._id + "]";
        };

        this._updateBounds = function () {
            var i,
                graphic,
                bounds,
                points = [];

            for (i = 0; i < self._graphics.length; i += 1) {
                graphic = self._graphics[i];
                bounds = graphic.bounds();
                points.push(bounds.min());
                points.push(bounds.max());
            }

            qd.debug("Updating Entity[id=" + this.id() + "] Bounds");

            this._bounds.resizeAsPolygon(points);
        };

        this.init(engine, layer, graphic, material);
    };

    /* Static Methods */

    qd.Entity.ID = new qd.Id();

    /* Public Methods */

    qd.Entity.prototype.id = function () {
        return this._id;
    };

    qd.Entity.prototype.init = function (engine, layer, graphic, material) {
        this._id = qd.Entity.ID.next();

        this._engine = engine;
        this._view = engine.view();
        this._camera = this._view.camera();
        this._mouse = this._engine.mouse();
        this._world = this._engine.world();

        this._visible = true;
        this._inCameraView = true;// TODO: On every shape update, update ths flag

        this._layer = layer;

        this._draggable = false;
        this._throwable = false;
        this._dragClick = qd.Point2D.create(0, 0);

        this.dragging = false;

        this._graphics = [];

        // Sum of all the bounding boxes of the graphic children
        this._bounds;

        if (graphic != null) {
            this._bounds = new qd.BoundingBox();
            this._bounds._shape = graphic.shape();
            this.graphic(graphic);
        } else {
            this._bounds = new qd.BoundingBox(this._view);
        }

        this._body = engine.physics().body("dynamic", { bounds: this._bounds, material: material } );
    };

    qd.Entity.prototype.destroy = function () {
        var i,
            graphic;

        this.undraggable();
        this.unselectable();

        this.dragging = undefined;
        this._dragClick = undefined;

        this._draggable = undefined;

        this._layer = undefined;

        this._body.destroy();
        this._body = undefined;

        this._bounds.destroy();
        this._bounds = undefined;

        for (i = 0; i < this._graphics.length; i += 1) {
            graphic = this._graphics[i];
            graphic.bounds().offResize("qd.BoundingBox.onResize:qd.Entity._updateBounds", this._updateBounds, this);
            graphic.destroy();
        }

        this._inCameraView = undefined;
        this._visible = undefined;
        this._world = undefined;
        this._mouse = undefined;
        this._camera = undefined;
        this._view = undefined;
        this._engine = undefined;

        qd.debug("Destroyed entity[id=" + this.id() + "]");
        return this;
    };

    qd.Entity.prototype.clone = function () {
        var clone;

        qd.debug("Cloning " + this.toString());

        clone = new qd.Entity(this._engine, this._layer, this._graphics[0].clone());

        // qd.forEach(this._graphics, function (graphic) {
        //     clone.graphic(graphic.clone());
        // });

        // copy body
        clone._body = this._body.clone(this._bounds);

        return clone;
    };

    qd.Entity.prototype.bounds = function () {
        return this._bounds;
    };

    qd.Entity.prototype.graphic = function (arg) {
        var graphic,
            index;

        if (arg instanceof qd.VectorGraphic
                || arg instanceof qd.Sprite
                || arg instanceof qd.Text) {

            graphic = arg;

            this._graphics.push(graphic);

            this._updateBounds();

            graphic.bounds().onResize("qd.BoundingBox.onResize:qd.Entity._updateBounds", this._updateBounds, this);

            return this;
        } else if (arg instanceof Number) {
            index = arg
        } else {
            index = 0;
        }

        return this._graphics[index];
    };

    qd.Entity.prototype.graphics = function (graphics) {
        var i;

        if (graphics) {
            for (i = 0; i < graphics.length; i += 1) {
                this.graphic(graphics[i]);
            }

            return this;
        }

        return this._graphics;
    };

    qd.Entity.prototype.body = function (body) {
        if (body) {
            this._body = body;
            return this;
        }

        return this._body;
    };

    qd.Entity.prototype.layer = function () {
        return this._layer;
    };

    qd.Entity.prototype.position = function (x, y) {
        var dx,
            dy;

        if (arguments.length > 0) {
            dx = (x - this._bounds.centroidX());
            dy = (y - this._bounds.centroidY());

            return this.translate(dx, dy);
        }

        return this._bounds.centroid();
    };

    qd.Entity.prototype.translate = function (dx, dy) {
        var i;

        for (i = 0; i < this._graphics.length; i += 1) {
            this._graphics[i].translate(dx, dy);
        }

        this._updateBounds();

        return this;
    };

    qd.Entity.prototype.angle = function (angle) {
        var dtheta = angle - this._bounds.angle();
        this.rotate(dtheta);
    };

    qd.Entity.prototype.rotate = function (dtheta) {
        var i;

        if (dtheta != 0) {
            for (i = 0; i < this._graphics.length; i += 1) {
                this._graphics[i].rotate(dtheta, this._bounds.centroid());
            }
        }

        this._bounds.rotate(dtheta);

        return this;
    };

    qd.Entity.prototype.throwable = function (mouse) {



        return this;
    };

    qd.Entity.prototype.selectable = function () {
        this._world.selectable(this);
        return this;
    };

    qd.Entity.prototype.unselectable = function () {
        this._world.unselectable(this);
        return this;
    };

    /**
     * Make this entity draggable.
     *
     * @return {qd.Entity}
     */
    qd.Entity.prototype.draggable = function () {
        var velocityTracker,
            mousePos,
            namespace,
            mouse,
            centroid,
            dx,
            dy;

        if (!this._draggable) {
            namespace = this._namespace("draggable");
            mouse = this._engine.mouse();

            if (this._throwable) {
                velocityTracker = new qd.VelocityTracker();
            }

            // TODO: Move this into edit mode, that way we can move multiple items at once!

            mouse.press(namespace, function () {
                mousePos = mouse.worldPoint();

                if (this._bounds.hitTest(mousePos[0], mousePos[1])) {
                    console.log("dragging " + this.toString())
                    this.dragging = true;
                    centroid = this._bounds.centroid();
                    qd.Point2D.subtract(this._dragClick, mousePos, centroid);

                    this._body.deactivate();

                    if (this._throwable) {
                        velocityTracker.start(centroid[0], centroid[1]);
                    }

                    mouse.cursor("move");
                }
            }, this);

            mouse.move(namespace, function () {
                mousePos = mouse.worldPoint();

                var i,
                    self = this;

                if (this.dragging) {
                    centroid = this._bounds.centroid();
                    dx = mousePos[0] - centroid[0] - this._dragClick[0];
                    dy = mousePos[1] - centroid[1] - this._dragClick[1];

                    for (i = 0; i < self._graphics.length; i += 1) {
                        self._graphics[i].translate(dx, dy);
                    }

                    if (this._throwable) {
                        velocityTracker.track(mousePos[0], mousePos[1]);
                    }
                }
            }, this);

            mouse.release(namespace, function () {
                mousePos = mouse.worldPoint();

                if (this.dragging) {
                    this.dragging = false;
                    qd.Point2D.mutateZero(this._dragClick);

                    if (this._throwable) {
                        this._body.velocity[0] = velocityTracker.vx;
                        this._body.velocity[1] = velocityTracker.vy;
                    }

                    this._body.activate();

                    mouse.cursor("default");
                }
            }, this);

            mouse.dblClick(namespace, function () {
                mousePos = mouse.worldPoint();

                if (this._bounds.hitTest(mousePos[0], mousePos[1])) {
                    qd.Vector2D.mutateZero(this._body.velocity);
                }
            }, this);

            this._draggable = true;
        }

        return this;
    };

    qd.Entity.prototype.undraggable = function () {
        var namespace = this._namespace("draggable"),
            mouse = this._engine.mouse();

        if (this._draggable) {
            mouse.unpress(namespace);
            mouse.unmove(namespace);
            mouse.unrelease(namespace);

            this._draggable = false;
        }

        return this;
    };

    /**
     * Make this entity a drop target
     *
     * TODO: Add ability to bind dragenter, dragleave, drop events
     */
    qd.Entity.prototype.droppable = function () {
        // TODO
    };

    qd.Entity.prototype.clickTest = function (mouse) {
        var clickPoint = this._view.mouseWorldPoint(mouse);

        return this.hitTest(clickPoint[0], clickPoint[1]);
    };

    qd.Entity.prototype.hitTest = function (x, y) {
        return this._bounds.hitTest(x, y);
    };

    qd.Entity.prototype.show = function () {
        this._visible = true;
    };

    qd.Entity.prototype.hide = function () {
        this._visible = false;
    };

    qd.Entity.prototype.visible = function () {
        return this._visible;
    };

    qd.Entity.prototype.bounds = function () {
        return this._bounds;
    };

    qd.Entity.prototype.centroid = function () {
        return this._bounds.centroid();
    };

    qd.Entity.prototype.raise = function () {
        var zOrder,
            entities = this._layer.entitySet._entities,  // qd.Entity is a friend of qdEntitySet
            size = entities.length,
            topZOrder = size - 1;

        if (size > 1) {
            zOrder = this.zOrder();

            if (zOrder > -1 && zOrder !== topZOrder) {
                qd.swap(entities, zOrder, zOrder + 1);
            }
        }

        return this;
    };

    qd.Entity.prototype.raiseToTop = function () {
        var i,
            zOrder,
            entities = this._layer.entitySet._entities,  // qd.Entity is a friend of qdEntitySet
            size = entities.length,
            topZOrder = size - 1;

        if (size > 1) {
            zOrder = this.zOrder();

            if (zOrder > -1 && zOrder !== topZOrder) {
                for (i = zOrder; i < topZOrder; i ++) {
                    qd.swap(entities, i, i + 1);
                }
            }
        }

        return this;
    };

    qd.Entity.prototype.lower = function () {
        var zOrder,
            entities = this._layer.entitySet._entities,  // qd.Entity is a friend of qdEntitySet
            size = entities.length,
            bottomZOrder = 0;

        if (size > 1) {
            zOrder = this.zOrder();

            if (zOrder > -1 && zOrder !== bottomZOrder) {
                qd.swap(entities, zOrder, zOrder - 1);
            }
        }

        return this;
    };

    qd.Entity.prototype.lowerToBottom = function () {
        var i,
            zOrder,
            entities = this._layer.entitySet._entities,  // qd.Entity is a friend of qdEntitySet
            size = entities.length,
            bottomZOrder = 0;

        if (size > 1) {
            zOrder = this.zOrder();

            if (zOrder > -1 && zOrder !== bottomZOrder) {
                for (i = zOrder; i > bottomZOrder; i -= 1) {
                    qd.swap(entities, i, i - 1);
                }
            }
        }

        return this;
    };

    // zOrder = 0 -> bottom
    qd.Entity.prototype.zOrder = function () {
        var _this = this,
            entities = this._layer.entitySet._entities; // qd.Entity is a friend of qdEntitySet

        return qd.findIndex(entities, function (entity) {
            return entity === _this;
        });
    };

    qd.Entity.prototype.isDrawable = function () {
        return (this._inCameraView && this._layer.visible && this._visible);
    };

    qd.Entity.prototype.draw = function (canvas) {
        var i,
            graphics;

        if (this.isDrawable()) {
            graphics = this._graphics;

            for (i = 0; i < graphics.length; i += 1) {
                graphics[i].draw(canvas);
            }

            this._body.draw(canvas);
        }
    };

    qd.Entity.prototype.toString = function () {
        return "Entity[id=" + this._id + "]";
    };
}(qd));
