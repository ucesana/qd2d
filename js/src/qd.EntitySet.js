(function (qd) {

    qd.EntitySet = function () {
        this.init();
    };

    qd.EntitySet.prototype.init = function () {
        this._entities = [];
        this._centroid = this.centroid(qd.Point2D.create(0, 0));

        return this;
    };

    qd.EntitySet.prototype.destroy = function () {
        this.each(function (entity) {
            entity.destroy();
        });
    };

    qd.EntitySet.prototype.clone = function () {
        var clone;

        qd.debug("Cloning " + this.toString());

        clone = new qd.EntitySet();

        this.each(function (entity) {
            clone.add(entity.clone());
        }, this);

        return clone;
    };

    qd.EntitySet.prototype.put = function (entity) {
        this.clear();
        this._entities.push(entity);

        return this;
    };

    qd.EntitySet.prototype.add = function (entity) {
        if (entity) {
            if (!qd.includes(this._entities, entity)) {
                this._entities.push(entity);
            }
        }

        return this;
    };

    qd.EntitySet.prototype.addAll = function (entities) {
        if (entities instanceof Array) {
            qd.forEach(entities, function (entity) {
                this.add(entity);
            }, this);
        } else if (entities instanceof qd.EntitySet) {
            entities.each(function (entity) {
                this.add(entity);
            }, this);
        }
    };

    qd.EntitySet.prototype.remove = function (entity) {
        if (entity) {
            qd.remove(this._entities, function (thatEntity) {
                return entity === thatEntity;
            });
        }

        return this;
    };

    qd.EntitySet.prototype.empty = function () {
        return this._entities.length === 0;
    };

    qd.EntitySet.prototype.clear = function () {
        this._entities = [];

        return this;
    };

    qd.EntitySet.prototype.position = function (x, y, origin) {
        return this.each(function (entity) {
            entity.position(x, y, origin);
        });
    };

    qd.EntitySet.prototype.translate = function (dx, dy) {
        return this.eachGraphic(function (graphic) {
            graphic.translate(dx, dy);
        });
    };

    qd.EntitySet.prototype.scale = function (sx, sy) {
        var centre;

        return this.each(function (entity) {
            centre = entity.position();

            qd.forEach(entity.graphics(), function (graphic) {
                graphic.scale(sx, sy, centre);
            });
        });
    };

    qd.EntitySet.prototype.rotate = function (dtheta) {
        var centre;

        return this.each(function (entity) {
            centre = entity.position();

            qd.forEach(entity.graphics(), function (graphic) {
                graphic.rotate(dtheta, centre);
            });
        });
    };

    qd.EntitySet.prototype.skew = function (kx, ky) {
        var centre;

        return this.each(function (entity) {
            centre = entity.position();

            qd.forEach(entity.graphics(), function (graphic) {
                graphic.skew(kx, ky, centre);
            });
        });
    };

    qd.EntitySet.prototype.applyStyle = function (style, value) {
        return this.eachGraphic(function (graphic) {
            graphic.style(style, value);
        });
    };

    qd.EntitySet.prototype.size = function () {
        return this._entities.length;
    };

    qd.EntitySet.prototype.each = function (callback, context) {
        var i;

        for (i = 0; i < this._entities.length; i += 1) {
            callback.call(context, this._entities[i]);
        }

        return this;
    };

    qd.EntitySet.prototype.eachGraphic = function (callback, context) {
        var i,
            j,
            graphics;

        for (i = 0; i < this._entities.length; i += 1) {
            graphics = this._entities[i].graphics();

            for (j = 0; j < graphics.length; j += 1) {
                callback.call(context, graphics[j]);
            }
        }

        return this;
    };

    qd.EntitySet.prototype.centroid = function (centroid) {
        var points = [];

        this.each(function (entity) {
            points.push(entity.centroid());
        });

        if (qd.isDefinedAndNotNull(centroid)) {
            this._centroid = qd.Vector2D.clone(centroid);
        }

        return qd.math.centroid(this._centroid, points);
    };

    qd.EntitySet.prototype.sortZOrder = function () {
        this._entities = this._entities.sort(function (a, b) {
            return a.zOrder() - b.zOrder();
        });

        return this;
    };

    qd.EntitySet.prototype.bottom = function () {
        return (this._entities.length > 0)
            ? this._entities[0]
            : undefined;
    };

    qd.EntitySet.prototype.top = function () {
        return (this._entities.length > 0)
            ? this._entities[this._entities.length - 1]
            : undefined;
    };

    qd.EntitySet.prototype.raise = function () {
        qd.forEach(this._entities, function (entity) {
            entity.raise();
        });
    };

    qd.EntitySet.prototype.raiseToTop = function () {
        qd.forEach(this._entities, function (entity) {
            entity.raiseToTop();
        });
    };

    qd.EntitySet.prototype.lower = function () {
        qd.forEach(this._entities, function (entity) {
            entity.lower();
        });
    };

    qd.EntitySet.prototype.lowerToBottom = function () {
        qd.forEach(this._entities, function (entity) {
            entity.lowerToBottom();
        });
    };

    // TODO: Need to improve this to return hit data, which could include multiple entities, etc
    qd.EntitySet.prototype.hitTest = function (x, y) {
        var candidates = new qd.EntitySet();

        qd.forEach(this._entities, function (entity) {
            if (entity.hitTest(x, y)) {
                candidates.add(entity);
            }
        });

        candidates.sortZOrder();

        return candidates.top();
    };

    qd.EntitySet.prototype.clickTest = function (mouse) {
        var candidates = new qd.EntitySet();

        qd.forEach(this._entities, function (entity) {
            if (entity.clickTest(mouse)) {
                candidates.add(entity);
            }
        });

        candidates.sortZOrder();

        return candidates.top();
    };

    qd.EntitySet.prototype.applyBodyProperty = function (property, value) {
        return this.each(function (entity) {
            entity.body().setProperty(property, value);
        });
    };

    qd.EntitySet.prototype.toString = function () {
        return "EntitySet";
    };
}(qd));
