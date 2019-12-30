(function (qd) {

    /**
     * Styles used to apply style to canvas paths.
     *
     * @param {Object} styles
     * @constructor
     */
    qd.Styles = function (styles) {
        this.init(styles);
    };

    qd.Styles.prototype.init = function (styles) {
        this._styler = {};
        this._stroke = false;
        this._fill = false;
        this._fillRule = qd.Styler.STYLES.FILL_RULE.DEFAULT;

        this.addAll(styles || {});

        return this;
    };

    qd.Styles.prototype.clone = function () {
        return new qd.Styles(this._styler);
    };

    /** Public Methods */

    qd.Styles.prototype.add = function (style, value) {
        switch (style) {
            case "stroke":
            case "strokeStyle":
            case "strokeColor":
            case "strokeColour":
                if (value === "" || value === "transparent") {
                    // No Stroke
                    this._stroke = false
                } else {
                    this._styler["strokeStyle"] = value;
                    this._stroke = true;
                }
                break;

            case "fill":
            case "fillStyle":
            case "fillColor":
            case "fillColour":
                if (value === "" || value === "transparent") {
                    // No Fill
                    this._fill = false;
                } else {
                    this._styler["fillStyle"] = value;
                    this._fill = true;
                }
                break;

            case "fillRule":
                this._fillRule = value;
                break;

            case "lineDash":
                var lineDash;

                if (qd.isUndefinedOrNull(value)) {
                    lineDash = [];
                } else if (typeof value === "string") {
                    if (value === "" || value === "solid") {
                        lineDash = [];
                    } else if (qd.Styler.STYLES.LINE_DASH.REGEX.test(value)) {
                        lineDash = qd.map(value.split(/, */), function (str) {
                            return parseInt(str);
                        });
                    }
                } else if (value instanceof Array) {
                     lineDash = value;
                }

                if (lineDash != null) {
                    this._styler["lineDash"] = lineDash;
                }

                break;
            case "shadowColor":
            case "shadowColour":
                this._styler["shadowColor"] = value;
                break;

            default:
                this._styler[style] = value;
        }

        return this;
    };

    qd.Styles.prototype.addAll = function (styles) {
        qd.eachProperty(styles, function (style, value) {
            this.add(style, value);
        }, this);

        return this;
    };

    qd.Styles.prototype.get = function (style) {
        return this._styler[style];
    };

    qd.Styles.prototype.getAll = function () {
        return qd.cloneProperties(this._styler);
    };

    qd.Styles.prototype.apply = function (ctx) {
        var i,
            styles = this._styler,
            keys = Object.keys(styles),
            style,
            value;

        ctx.save();

        for (i = 0; i < keys.length; i += 1) {
            style = keys[i];
            value = styles[style];

            switch (style) {
                case "lineDash":
                    ctx.setLineDash(value);
                    break;
                default:
                    ctx[style] = value;
            }
        }

        if (this._fill) {
            if (this._fillRule) {
                ctx.fill(this._fillRule);
            } else {
                ctx.fill();
            }
        }

        if (this._stroke) {
            ctx.stroke();
        }

        ctx.restore();

        return this;
    };

}(qd));
