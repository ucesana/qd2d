(function (qd) {

    /**
     *
     * @param arg
     * @constructor
     */
    qd.Element = function (arg) {
        this._element = null;

        if (typeof arg === "string") {
            this._element = window.document.createElement(arg);
        } else if (arg instanceof HTMLElement) {
            this._element = arg;
        }
    };

    /* Static Methods */

    qd.Element.getById = function (id) {
        return new qd.Element(qd.getElementById(id));
    };

    qd.Element.find = function (selector) {
        var domElems = window.document.querySelectorAll(selector),
            elements = [];

        qd.forEach(domElems, function (domElem) {
            elements.push(new qd.Element(domElem));
        });

        if (elements.length === 1) {
            return elements[0];
        }

        return elements;
    };

    qd.Element.create = function () {
        var args = new qd.Args(arguments),
            tag,
            template,
            element;

        if (args.matches(String)) {
            tag = args.get(0);
        } else if (args.matches(String, Object)) {
            tag = args.get(0);
            template = args.get(1);
        } else if (args.matches(Object)) {
            template = args.get(0);
            tag = template["tag"];
        }

        element = new qd.Element(tag);

        if (template) {
            if (qd.isNotEmpty(template["id"])) {
                element.id(template["id"]);
            }

            if (qd.isNotEmpty(template["className"])) {
                element.className(template["className"]);
            }

            if (qd.isDefinedAndNotNull(template["styles"])) {
                element.styles(template["styles"]);
            }

            if (qd.isDefinedAndNotNull(template["attrs"])) {
                element.attrs(template["attrs"]);
            }

            if (qd.isNotEmpty(template["text"])) {
                element.text(template["text"]);
            }

            if (qd.isDefinedAndNotNull(template["binds"])) {
                qd.eachProperty(template["binds"], function (type, callback) {
                    element.bind(type, callback);
                });
            }

            if (qd.isDefinedAndNotNull(template["children"])) {
                qd.forEach(template["children"], function (child) {
                    element.append(qd.Element.create(child));
                });
            }

            if (qd.isDefinedAndNotNull(template["binds"])) {
                qd.forEach(template["binds"], function (binding) {
                    element.bind(binding.event, binding.callback, element);
                });
            }
        }

        return element;
    };

    /** Public Methods */

    qd.Element.prototype.get = function () {
        return this._element;
    };

    qd.Element.prototype.id = function (id) {
        if (qd.isDefinedAndNotNull(id)) {
            this._element.id = id;
            return this;
        }

        return this._element.id;
    };

    qd.Element.prototype.getClass = function () {
        var classNames = this._element.className,
            classes;

        if (qd.isNotEmpty(classNames)) {
            if (classNames.search(/\s/)) {
                classes = classNames.split(" ");
            }
        } else {
            classes = [];
            classes.push(classNames);
        }

        return classes;
    };

    qd.Element.prototype.className = function (className) {
        if (className) {
            this._element.className = className;
            return this;
        }

        return this._element.className;
    };

    qd.Element.prototype.addClass = function (className) {
        if (qd.isNotEmpty(this._element.className)) {
            this._element.className += "," + className;
        } else {
            this._element.className = className;
        }

        return this;
    };

    qd.Element.prototype.removeClass = function (className) {
        if (this._element.className) {
            this._element.className.replace(className, "");
        }

        return this;
    };

    qd.Element.prototype.toggleClass = function (className) {
        if (this.hasClass(className)) {
            this.removeClass(className);
        } else {
            this.addClass(className);
        }

        return this;
    };

    qd.Element.prototype.style = function (style, value) {
        if (qd.isDefinedAndNotNull(style)) {
            if (qd.isDefined(value)) {
                this._element.style[style] = value;
            }
        }

        return this._element[style];
    };

    qd.Element.prototype.styles = function (styles) {
        qd.eachProperty(styles, function (style, value) {
            this._element.style[style] = value;
        }, this);

        return this;
    };

    qd.Element.prototype.attr = function (attr, value) {
        if (qd.isDefinedAndNotNull(attr)) {
            if (qd.isDefined(value)) {
                this._element.setAttribute(attr, value);
                return this;
            }
        }

        return this._element.getAttribute(attr);
    };

    qd.Element.prototype.attrs = function (attrs) {
        qd.eachProperty(attrs, function (attr, value) {
            this._element.setAttribute(attr, value);
        }, this);

        return this;
    };

    qd.Element.prototype.append = function () {
        var args = new qd.Args(arguments),
            element = args.get(0),
            node;

        if (args.matches(String)) {
            node = document.createTextNode(element);
        } else if (args.matches(qd.Element)) {
            node = element.get();
        } else if (args.matches(HTMLElement)) {
            node = element;
        }

        this._element.appendChild(node);

        return this;
    };

    qd.Element.prototype.prepend = function () {
        var args = new qd.Args(arguments),
            element = args.get(0),
            firstChild,
            node;

        if (args.matches(String)) {
            node = document.createTextNode(element);
        } else if (args.matches(qd.Element)) {
            node = element.get();
        } else if (args.matches(HTMLElement)) {
            node = element;
        }

        firstChild = this._element.firstChild;
        this._element.insertBefore(node, firstChild);

        return this;
    };

    qd.Element.prototype.text = function (text) {
        if (text) {
            this._element.textContent = text || "";
            return this;
        }

        return this._element.textContent;
    };

    qd.Element.prototype.value = function (value) {
        if (value) {
            this._element.value = value;
            return this;
        }

        return this._element.value;
    };

    qd.Element.prototype.innerHTML = function (innerHTML) {
        if (innerHTML) {
            this._element.innerHTML = innerHTML;
            return this;
        }

        return this._element.innerHTML;
    };

    qd.Element.prototype.remove = function (child) {
        var self = this._element;

        if (child) {
            self.removeChild(child);
        } else {
            self.parentNode.removeChild(self);
        }

        return this;
    };

    qd.Element.prototype.replace = function (child, replacement) {
        this._element.replaceChild(child, replacement);
        return this;
    };

    qd.Element.prototype.bind = function (type, callback, context) {
        this._element.addEventListener(type, qd.callbackWithContext(callback, (context) ? context : this));
        return this;
    };

    qd.Element.prototype.unbind = function (type, callback) {
        this._element.removeEventListener(type, callback);
        return this;
    };

    qd.Element.prototype.hide = function () {
        // TODO: Need to store previous display value so it can be restored by show()
        this.style("display", "none");
        return this;
    };

    qd.Element.prototype.show = function () {
        this.style("display", "block");
        return this;
    };

    qd.Element.prototype.droppable = function () {
        this.bind("dragenter", function (event) {
            this.text("");
            event.stopPropagation();
            event.preventDefault();
        })
            .bind("dragover", function (event) {
                event.stopPropagation();
                event.preventDefault();
            })
            .bind("drop", function (event) {
                event.stopPropagation();
                event.preventDefault();
            });

        return this;
    };

    qd.Element.prototype.draggable = function () {
        this.attr("draggable", true);
    };

    qd.Element.prototype.undraggable = function () {
        this.attr("draggable", false);
    };

    qd.Element.prototype.width = function () {
        return this._element.offsetWidth;
    };

    qd.Element.prototype.height = function () {
        return this._element.offsetHeight;
    };

    qd.Element.tag = function () {
        return qd.Element.create.apply(this, arguments);
    };

    qd.Element.fieldSet = function (id, label) {
        return qd.Element.tag("fieldset").id(id).append(
            qd.Element.tag("legend").text(label));
    };

    qd.Element.text = function (id, label, title, name, value) {
        var textLabel = qd.Element.tag("span").text(label),
            input = qd.Element.tag("input", {
                id: id,
                attrs: {
                    type: "text",
                    name: name,
                    value: ((qd.isDefinedAndNotNull(value)) ? value : name),
                    title: title
                }
            });

        return qd.Element.tag("span").append(textLabel).append(input);
    };

    qd.Element.button = function (id, label, title, name, value) {
        return qd.Element.tag("button", {
            id: id,
            attrs: {
                type: "button",
                name: name,
                value: ((qd.isDefinedAndNotNull(value)) ? value : name),
                title: title
            },
            text: label
        });
    };

    qd.Element.radio = function (id, label, title, checked, name, value) {
        var radioLabel = qd.Element.tag("label").attr("for", id).text(label),
            radio = qd.Element.tag("input", {
                id: id,
                attrs: {
                    type: "radio",
                    name: name,
                    value: ((qd.isDefinedAndNotNull(value)) ? value : name),
                    title: title
                }
            });

        if (checked) {
            radio.attr("checked", "checked");
        }

        return qd.Element.tag("span").append(radioLabel).append(radio);
    };

    qd.Element.file = function (id, label, title, name, value) {
        var file = qd.Element.tag("input", {
                id: id,
                attrs: {
                    type: "file",
                    name: name,
                    value: ((qd.isDefinedAndNotNull(value)) ? value : name)
                },
                styles: {
                    width: "0.1px",
                    height: "0.1px",
                    opacity: 0,
                    overflow: "hidden",
                    position: "absolute",
                    "z-index": -1
                }
            }),
            fileLabel = qd.Element.tag("label").attr("for", id).append(
                qd.Element.tag("button")
                    .attr("title", title)
                    .text(label)
                    .bind("click", function () { file.get().click(); }));

        return qd.Element.tag("span").append(fileLabel).append(file);
    };

    qd.Element.input = function (id, type, title, name, value) {
        return qd.Element.tag("input", {
            id: id,
            attrs: {
                type: type,
                name: name,
                value: ((qd.isDefinedAndNotNull(value)) ? value : name),
                title: title
            }
        });
    };
}(qd));
