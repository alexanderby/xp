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
            //this.onPropertyChanged = new Event<PropertyChangedArgs>();
            this.bindingRegistar = new EventRegistar();
            this.bindings = {};
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


        //------------------
        // GETTERS / SETTERS
        //------------------

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
            //this.onPropertyChanged.invoke({
            //    propertyName: 'enabled',
            //    oldValue: value,
            //    newValue: this._enabled = value
            //});

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
        // ATTRIBUTE MAPPING
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
            $.each(attributes, (i, attr: Attr) => {
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
                    // Bind control property to data context property
                    this.bind(key, path, this.dataContext);
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
                }
            };
        }


        //----------
        // RELATIONS
        //----------

        /**
         * Parent.
         */
        parent: Container;

        /**
         * Removes element.
         */
        remove() {
            this.detach();
            this.bindingRegistar.unsubscribeAll();

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
         * Binds control's property to data context property.
         * @param controlProperty Control's property name.
         * @param objectPropertyPath Object's property name.
         * @param context If specified, sets the data context.
         */
        bind(controlProperty: string, objectPropertyPath: string, context?: INotifier) {
            this.bindings[controlProperty] = objectPropertyPath;
            if (context)
                this.dataContext = context;

            if (this.dataContext) {
                // Set current value
                this[controlProperty] = xp.getPropertyByPath(this.dataContext, objectPropertyPath);
            }

            console.log(xp.formatString('Binded property "{0}" to "{1}:{2}.{3}".', objectPropertyPath, xp.getClassName(this), this.name || '-', controlProperty));
        }

        /**
         * Unbinds control property from data context.
         * @param controlProperty Name of the property to unbind.
         */
        unbind(controlProperty: string) {
            if (this.bindings[controlProperty]) {
                delete this.bindings[controlProperty];
            }
        }

        /**
         * Gets or sets control's binding data context.
         */
        get dataContext() {
            return this._dataContext;
        }
        set dataContext(context) {
            this._dataContext = context;

            if (context) {
                this.initDataContext();
            }
            else {
                this.bindingRegistar.unsubscribeAll();
            }
        }
        protected _dataContext: INotifier;

        protected initDataContext() {
            // Re-init context changes handler 
            this.bindingRegistar.unsubscribeAll();
            this.bindingRegistar.subscribe(this.dataContext.onPropertyChanged, (objProp) => {
                for (var controlProp in this.bindings) {
                    if (this.bindings[controlProp] === objProp) {
                        this[controlProp] = this.dataContext[objProp];
                    }
                }
            }, this);
        }

        protected bindingRegistar: EventRegistar;
        protected bindings: UiBindingDictionary;

        /**
         * Is invoked when user performs an input.
         */
        protected onInput(controlProperty: string, value) {
            if (this.bindings[controlProperty]) {
                this.dataContext[this.bindings[controlProperty]] = value;
            }
        }
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
     * Represents "control property name":"object property name" dictionary.
     */
    export interface UiBindingDictionary {
        [controlProperty: string]: string;
    }
}