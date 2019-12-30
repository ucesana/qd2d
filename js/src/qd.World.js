(function (qd) {

    qd.World = function (engine) {
        this.init(engine);
    };

    qd.World.ORIGIN = qd.Point2D.create(0, 0);

    qd.World.prototype.init = function (engine) {
        this._engine = engine;
        this._physics = engine.physics();

        // TODO: Should be multiple canvases. Include Background, and Grid (fixed zOrder). Enable Parallax.
        this._layers = new qd.DynamicStack();
        this.addLayer("layer0");

        this._selectable = new qd.EntitySet();
    };

    qd.World.prototype.addLayer = function (name) {
        this._activeLayer = new qd.Layer(name);
        this._layers.push(this._activeLayer);
    };

    qd.World.prototype.activeLayer = function () {
        return this._activeLayer;
    };

    qd.World.prototype.eachLayer = function (callback) {
        this._layers.each(callback);
    };

    qd.World.prototype.selectable = function (entity) {
        if (entity) {
            this._selectable.add(entity);
            return this;
        }

        return this._selectable;
    };

    qd.World.prototype.unselectable = function (entity) {
        this._selectable.remove(entity);

        return this;
    };

    qd.World.prototype.createEntity = function (graphic) {
        var entity = new qd.Entity(this._engine, this._activeLayer, graphic, "wood");
        this.addEntity(entity);

        qd.debug("Created: " + entity.toString());

        return entity;
    };

    qd.World.prototype.addEntity = function (entity) {
        qd.debug("Adding: " + entity.toString());

        this._activeLayer.entitySet.add(entity);

        // TODO: need 1 Universe per layer
        this._physics.add(entity.body());
        return this;
    };

    qd.World.prototype.removeEntity = function (entity) {
        qd.debug("Removing: " + entity.toString());

        entity.layer().entitySet.remove(entity);

        this._physics.remove(entity.body());

        return this;
    };

    qd.World.prototype.destroyEntity = function (entity) {
        qd.debug("Destroying: " + entity.toString());

        this.removeEntity(entity);
        entity.destroy();

        return this;
    };

    qd.World.prototype.clear = function () {
        this._layers.each(function (layer) {
            layer.entitySet.destroy();
        });
        return this.init(this._engine);
    };

    qd.World.prototype.step = function (t, dt) {
        var i,
            entities,
            entity,
            body,
            position;

        this._physics.step(t, dt);

        this._layers.each(function (layer) {
            entities = layer.entitySet._entities;

            for (i = 0; i < entities.length; i += 1) {
                entity = entities[i];
                body = entity.body();

                if (body.active) {
                    position = body.position;
                    entity.position(position[0], position[1]);
                    entity.rotate(body.deltaAngle);
                }
            }
        });
    };

    qd.World.prototype.draw = function (canvas) {
        var i,
            entities;
        this._layers.each(function (layer) {
            entities = layer.entitySet._entities;

            for (i = 0; i < entities.length; i += 1) {
                entities[i].draw(canvas);
            }
        });

        return this;
    };
}(qd));
