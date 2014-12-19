module xp.Ui {
    /**
     * UI element.
     */
    export /*abstract*/ class Element {

        /**
         * Creates UI element.
         * @param xmlElement Markup XML-element.
         */
        constructor(xmlElement?: JQuery) {
            this.initElement(xmlElement);
        }

        /**
         * Initializes UI element.
         * @param xmlElement Markup XML-element.
         */
        protected initElement(xmlElement?: JQuery) {
            this.domElement = this.getTemplate();
            this.initEvents();
            this.setDefaults();
            if (xmlElement) {
                this.processXml(xmlElement);
            }
        }


        //----
        // DOM
        //----

        /**
         * DOM element of a control.
         */
        domElement: JQuery;

        /**
         * Returns element's template.
         */
        protected getTemplate(): JQuery {
            return $('<div></div>');
        }


        //-------
        // EVENTS
        //-------

        onClick = new Event<UiEventArgs>();
        onMouseDown = new Event<UiEventArgs>();
        onMouseUp = new Event<UiEventArgs>();
        onMouseMove = new Event<UiEventArgs>();
        onMouseEnter = new Event<UiEventArgs>();
        onMouseLeave = new Event<UiEventArgs>();

        /**
         * Initializes control's events.
         */
        protected initEvents() {
            this.bindings = {};
            this.onContextChanged = new Event<any>();
            this.initEvent('click', this.onClick);
            this.initEvent('mousedown', this.onMouseDown);
            this.initEvent('mouseup', this.onMouseUp);
            this.initEvent('mousemove', this.onMouseMove);
            this.initEvent('mouseenter', this.onMouseEnter);
            this.initEvent('mouseleave', this.onMouseLeave);
        }

        protected initEvent(eventName: string, event: UiEvent) {
            this.domElement.on(eventName, (e: UiEventArgs) => {
                if (this.enabled) {
                    var args = createEventArgs(this, e);
                    event.invoke(args);

                    // TODO: Stop propagation or not?
                    e.stopPropagation();
                }
            });
        }


        //-----------
        // PROPERTIES
        //-----------

        /**
         * Sets default values.
         */
        protected setDefaults() { }

        /**
         * Gets or sets value indicating control being enabled or disabled.
         */
        get enabled() {
            return this._enabled;
        }
        set enabled(value) {
            this._enabled = value

            // DOM
            if (value === true) {
                this.domElement.removeClass('disabled');
            }
            else {
                this.domElement.addClass('disabled');
            }
        }
        protected _enabled = true;

        /**
         * Gets or sets element's name.
         */
        get name() {
            return this._name;
        }
        set name(value: string) {
            value = value.toLowerCase();
            this._name = value;

            // DOM
            this.domElement.attr('id', value);
        }
        protected _name: string;

        /**
         * Gets or sets width of the element (using CSS syntax).
         */
        get width() {
            return this._width;
        }
        set width(width: string) {
            this._width = width;

            // DOM
            this.domElement.css('width', width);
        }
        protected _width: string;

        /**
         * Gets or sets height of the element (using CSS syntax).
         */
        get height() {
            return this._height;
        }
        set height(height: string) {
            this._height = height;

            // DOM
            this.domElement.css('height', height);
        }
        protected _height: string;


        //------------------
        // MARKUP PROCESSING
        //------------------

        /**
         * Processes XML node (applies attributes, creates children etc).
         * @param xmlElement Markup XML-element.
         */
        protected processXml(xmlElement: JQuery) {
            this.applyAttributes(xmlElement);
        }

        /**
         * Applies the attributes' values.
         * @param xmlElement Markup XML-element.
         */
        protected applyAttributes(xmlElement: JQuery) {

            // Get attribute values
            var attributes = xmlElement.get(0).attributes;
            var values: AttrValueDictionary = {};
            var contextPath: string;
            $.each(attributes, (i, attr: Attr) => {
                // Add attribute's name and value into dictionary
                values[attr.name] = attr.value;
            });

            var map = this.getAttributeMap();
            for (var key in values) {
                // Find attribute
                if (!map[key]) {
                    throw new Error(xp.formatString('Illegal attribute "{0}" of element "{1}".', key, xmlElement[0].nodeName.toLowerCase()));
                }

                // Check for binding
                var matches = values[key].match(/^\{(.*)\}$/);
                if (matches && matches[1]) {
                    var path = matches[1];
                    if (contextPath) {
                        path = contextPath + '.' + path;
                    }
                    // Bind control property
                    this.bind(key, path);
                }
                else if (map[key]['*']) {
                    // If accepts any value -> call setter with value
                    var setter = map[key]['*'];
                    setter(values[key]);
                }
                else {
                    // Find value
                    if (!map[key][values[key]] && !map['*']) {
                        throw new Error(xp.formatString('Illegal value "{0}" for attribute "{1}" of element "{2}".', values[key], key, xmlElement[0].nodeName.toLowerCase()));
                    }
                    // Call setter
                    var setter = map[key][values[key]];
                    setter();
                }
            }
        }

        /**
        * Defines the way of setting control's properties through the XML attributes.
        */
        protected getAttributeMap(): AttributeMap {
            return {
                'enabled': {
                    'true': () => this.enabled = true,
                    'false': () => this.enabled = false
                },
                'name': {
                    '*': (name) => this.name = name,
                },
                'width': {
                    '*': (width) => this.width = width
                },
                'height': {
                    '*': (height) => this.height = height
                },
                'context': {} // ?
            };
        }


        //----------
        // RELATIONS
        //----------

        /**
         * Gets or sets element's parent.
         * WARNING: Must be set only by parent.
         */
        //parent: Container;
        get parent() {
            return this._parent;
        }
        /*internal*/set parent(parent) {
            // If there is no binding for 'context', than take parent's context.
            if (this._parent) {
                this._parent.onContextChanged.removeHandler(this.parentContextChangeHandler);
            }
            this._parent = parent;
            if (parent) {
                this._parent.onContextChanged.addHandler(this.parentContextChangeHandler, this);
            }
        }

        /**
         * Handles parent context change.
         */
        protected parentContextChangeHandler = () => {
            if (!this.bindings['context']) {
                // Use parent's context
                this.context = this.parent.context;
            }
            else {
                // Update context binding
                this.bindings['context'].resetWith(this.parent.context);
            }
        };

        protected _parent: Container;

        /**
         * Removes element.
         */
        remove() {
            this.detach();
            for (var cp in this.bindings) {
                this.bindings[cp].unbind();
                delete this.bindings[cp];
            }

            // DOM
            this.domElement.remove();
        }

        /**
         * Inserts element before target element.
         * @param target Target element.
         */
        insertBefore(target: Element) {
            if (!target.parent) {
                throw new Error('Target element has no parent.');
            }
            var index = target.parent.children.indexOf(target);
            target.parent.insertElement(this, index);
        }

        /**
         * Inserts element after target element.
         * @param target Target element.
         */
        insertAfter(target: Element) {
            if (!target.parent) {
                throw new Error('Target element has no parent.');
            }
            var index = target.parent.children.indexOf(target) + 1;
            target.parent.insertElement(this, index);
        }

        /**
         * Adds an element at container's end.
         * @param container Container element.
         */
        appendTo(container: Container) {
            container.appendElement(this);
        }

        /**
         * Adds an element at container's beginning.
         * @param container Container element.
         */
        prependTo(container: Container) {
            container.prependElement(this);
        }

        /*
         * Detaches the element, but doesn't remove it.
         */
        detach() {
            if (this.parent) {
                this.parent.detachChild(this);
            }
        }

        /**
         * Bubbles up through all parents invoking a function.
         * Stops when function returns 'truthy' value.
         * @param fn Function to execute on each parent.
         * @returns Element which lead to returning 'truthy' value.
         */
        bubbleBy(fn: (el: Container) => any): Container {
            var parent = this.parent;
            do {
                if (!!fn(parent) === true) {
                    return parent;
                }
                parent = parent.parent;
            }
            while (!parent);

            return null;
        }


        //--------
        // BINDING
        //--------

        /**
         * Holds control's properties' bindings.
         */
        protected bindings: UiBindingDictionary;

        /**
         * Binds control's property to source property.
         * @param controlProperty Control's property name.
         * @param objectPropertyPath Object's property name.
         * @param [source] Binding source object.
         */
        bind(controlProperty: string, objectPropertyPath: string, source?) {
            if (this.bindings[controlProperty]) {
                // Unsubscribe from prev changes
                this.bindings[controlProperty].unbind();
            }

            this.bindings[controlProperty] = new Binding.BindingManager(
                this,
                controlProperty,
                source || this.context,
                objectPropertyPath);
        }

        /**
         * Unbinds control property from data context.
         * @param controlProperty Name of the property to unbind.
         */
        unbind(controlProperty: string) {
            if (this.bindings[controlProperty]) {
                this.bindings[controlProperty].unbind();
                delete this.bindings[controlProperty];
            }
        }

        /**
         * Gets or sets control's data binding context.
         */
        get context() {
            if (this._context) {
                return this._context;
            }
            else {
                if (this.parent) {
                    return this.parent.context;
                }
                else {
                    return null;
                }
            }
        }
        set context(context) {
            console.log(xp.formatString('{0}:{1}: Change context to "{2}".', xp.getClassName(this), this.name || '-', context));
            this._context = context;

            for (var cp in this.bindings) {
                if (cp !== 'context') {
                    this.bindings[cp].resetWith(context);
                }
            }
            this.onContextChanged.invoke(context);
        }
        protected _context: Binding.INotifier;

        /**
         * Is invoked when user performs an input action.
         * @param controlProp Target control property.
         * @param value Value, that user inputs.
         */
        protected onInput(controlProp: string, value) {
            console.log(xp.formatString('{0}:{1}.{2}: Input "{3}".', xp.getClassName(this), this.name || '-', controlProp, value));
            this[controlProp] = value;
            if (this.bindings[controlProp]) {
                this.bindings[controlProp].updateSource();
            }
        }

        /**
         * Fires when data context is changed.
         */
        onContextChanged: Event<any>;
    }


    export interface AttrValueDictionary {
        [attr: string]: string;
    }

    export interface AttributeMap {
        [attr: string]: ValueMap;
    }

    export interface ValueMap {
        [value: string]: (value?: string) => void;
    }

    /**
     * Represents "control property name":"binding manager" dictionary.
     */
    export interface UiBindingDictionary {
        [controlProperty: string]: Binding.BindingManager;
    }
}