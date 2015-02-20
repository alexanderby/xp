module xp.UI {
    /**
     * UI element.
     */
    export /*abstract*/ class Element {

        /**
         * Creates UI element.
         */
        constructor() {
            this.initElement();
        }

        /**
         * Initializes UI element.
         */
        protected initElement() {
            this.domElement = this.getTemplate();
            this.initEvents();
            this.setDefaults();
            this.applyInitializers();
        }

        /**
         * Applies initializers that were defined outside.
         */
        protected applyInitializers() {
            if (this instanceof Window) {
            }
            var inits = Initializers.get(<any>this['constructor']);
            if (inits) {
                inits.forEach((init) => {
                    init(this);
                });
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

        /**
         * Renders control to the HTML element or element with given selector.
         * @param selector HTML element or selector.
         */
        renderTo(elementOrSelector: string|JQuery) {
            var target: JQuery;
            if (typeof elementOrSelector === 'string')
                target = $(elementOrSelector);
            else
                target = elementOrSelector;
            target.replaceWith(this.domElement);

            this.setRenderedState(true);
        }

        /*internal*/ setRenderedState(rendered) {
            this.isRendered = rendered;
            if (rendered)
                this.onRendered.invoke(this);
        }
        /*internal*/ isRendered = false;


        //-------
        // EVENTS
        //-------

        onClick: Event<UIEventArgs>;
        onMouseDown: Event<UIEventArgs>;
        onMouseUp: Event<UIEventArgs>;
        onMouseMove: Event<UIEventArgs>;
        onMouseEnter: Event<UIEventArgs>;
        onMouseLeave: Event<UIEventArgs>;
        onKeyPress: Event<UIEventArgs>;
        onKeyDown: Event<UIEventArgs>;
        onKeyUp: Event<UIEventArgs>;

        /**
         * Is invoked when element is being removed.
         */
        onRemoved: Event<Element>;

        /**
         * Is invoked when element is first time rendered.
         */
        onRendered: Event<Element>;

        /**
         * Initializes control's events.
         */
        protected initEvents() {
            this.bindings = {};
            this.expressions = {};

            // Control's events
            this.onScopeChanged = new Event();
            this.onRendered = new Event();

            this.onClick = new Event();
            this.onMouseDown = new Event();
            this.onMouseUp = new Event;
            this.onMouseMove = new Event();
            this.onMouseEnter = new Event();
            this.onMouseLeave = new Event();
            this.onKeyPress = new Event();
            this.onKeyDown = new Event();
            this.onKeyUp = new Event();

            // Unregister events on remove?
            this.onRemoved = new Event();
            this.onRemoved.addHandler(() => {
                this.onScopeChanged.removeAllHandlers();
                this.onRendered.removeAllHandlers();
                this.onClick.removeAllHandlers();
                this.onMouseDown.removeAllHandlers();
                this.onMouseUp.removeAllHandlers();
                this.onMouseMove.removeAllHandlers();
                this.onMouseEnter.removeAllHandlers();
                this.onMouseLeave.removeAllHandlers();
                this.onKeyPress.removeAllHandlers();
                this.onKeyDown.removeAllHandlers();
                this.onKeyUp.removeAllHandlers();
            }, this);

            // DOM events
            this.initDomEvent('click', this.onClick);
            this.initDomEvent('mousedown', this.onMouseDown);
            this.initDomEvent('mouseup', this.onMouseUp);
            this.initDomEvent('mousemove', this.onMouseMove);
            this.initDomEvent('mouseenter', this.onMouseEnter);
            this.initDomEvent('mouseleave', this.onMouseLeave);
            this.initDomEvent('keypress', this.onKeyPress);
            this.initDomEvent('keydown', this.onKeyDown);
            this.initDomEvent('keyup', this.onKeyUp);
        }

        protected initDomEvent(eventName: string, event: UIEvent) {
            this.domElement.on(eventName,(e: UIEventArgs) => {
                if (this.enabled) {
                    var args = createEventArgs(this, e);
                    event.invoke(args);

                    // TODO: Stop propagation or not?
                    //e.stopPropagation();
                }
            });
        }

        /**
         * Registers control's event handler by name.
         * @param event Event.
         * @param handlerName Handler name.
         */
        registerUIHandler(event: Event<UIEventArgs>, handlerName: string) {
            event.addHandler((args) => {
                var elementWithHandler = this.bubbleBy((el) => el[handlerName] !== void 0);
                if (!elementWithHandler) {
                    throw new Error(xp.formatString('{0}:{1}: Unable to find event handler "{2}".', xp.getClassName(this), this.name || '-', handlerName));
                }
                if (typeof elementWithHandler[handlerName] !== 'function') {
                    throw new Error(xp.formatString('{0}:{1}: Property "{2}" is not a function.', xp.getClassName(this), this.name || '-', handlerName));
                }
                elementWithHandler[handlerName](args);
            }, this);
        }


        //-----------
        // PROPERTIES
        //-----------

        /**
         * Sets default values.
         */
        protected setDefaults() {
            this.enabled = true;
        }

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
        private _enabled = true;

        /**
         * Gets or sets element's name.
         */
        get name() {
            return this._name;
        }
        set name(value: string) {
            this._name = value;

            // DOM
            this.domElement.attr('id', value);
        }
        private _name: string;

        /**
         * Gets or sets element's key.
         */
        get key() {
            return this._key;
        }
        set key(key) {
            this._key = key;
        }
        private _key: string;

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
        private _width: string;

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
        private _height: string;

        /**
         * Gets or sets margin of the element (using CSS syntax).
         */
        get margin() {
            return this._margin;
        }
        set margin(margin: string) {
            this._margin = margin;

            // DOM
            this.domElement.css('margin', margin);
        }
        private _margin: string;

        /**
         * Gets or sets element's CSS class.
         */
        get style() {
            return this._style;
        }
        set style(cssClass) {
            var old = this._style;
            this._style = cssClass;

            // DOM
            this.domElement.removeClass(old);
            this.domElement.addClass(cssClass);
        }
        private _style: string;

        /**
         * Gets or sets element's flexible behavior.
         */
        get flex() {
            return this._flex;
        }
        set flex(flex) {
            this._flex = flex;

            // DOM
            this.removeFlexClasses();
            switch (flex) {
                case FlexValue.None:
                    this.domElement.addClass('flex-None');
                    break;
                case FlexValue.Stretch:
                    this.domElement.addClass('flex-Stretch');
                    break;
                default:
                    throw new Error('Unknown flex value "' + flex + '".');
            }
        }
        private _flex: FlexValue;
        private removeFlexClasses() {
            this.domElement.removeClass('flex-None flex-Stretch');
        }


        //----------
        // RELATIONS
        //----------

        /**
         * Gets or sets element's parent.
         * WARNING: Must be set only by parent.
         */
        get parent() {
            return this._parent;
        }
        /*internal*/set parent(parent) {
            if (parent && parent.children.indexOf(this) < 0)
                throw new Error('The "parent" property must be set only by parent.');

            if (this._parent) {
                this._parent.onScopeChanged.removeHandler(this.parentScopeChangeHandler);
            }
            this._parent = parent;
            if (parent) {
                this._parent.onScopeChanged.addHandler(this.parentScopeChangeHandler, this);
                this.parentScopeChangeHandler();

                if (!this.isRendered && parent.isRendered)
                    // Mark as rendered
                    this.setRenderedState(true);
            }
        }
        private _parent: Container;

        /**
         * Handles parent context change.
         */
        protected parentScopeChangeHandler = () => {
            if (this.useParentScope) {
                if (!this.bindings['scope']) {
                    // Use parent's scope
                    this.scope = this.parent.scope;
                }
                else {
                    // Update context binding
                    this.bindings['scope'].resetWith(this.parent.scope);
                }
            }
        };
        /**
         * Specifies whether element should use parent data scope. 
         */
        useParentScope = true;

        /**
         * Removes element.
         */
        remove() {
            this.detach();
            for (var cp in this.bindings) {
                this.bindings[cp].unbind();
                delete this.bindings[cp];
            }
            for (var cp in this.expressions) {
                this.expressions[cp].unbind();
                delete this.expressions[cp];
            }

            // DOM
            this.domElement.remove();

            this.onRemoved.invoke(this);
            this.onRemoved.removeAllHandlers();
        }

        /**
         * Inserts element before target element.
         * @param target Target element.
         */
        insertBefore(target: Element) {
            if (!target.parent) {
                throw new Error('Target element has no parent.');
            }
            var index: number;
            if (this.parent === target.parent) {
                var from = this.parent.children.indexOf(this);
                var to = this.parent.children.indexOf(target);
                index = from < to ? to - 1 : to;
            }
            else {
                index = target.parent.children.indexOf(target);
            }
            target.parent.insert(this, index);
        }

        /**
         * Inserts element after target element.
         * @param target Target element.
         */
        insertAfter(target: Element) {
            if (!target.parent) {
                throw new Error('Target element has no parent.');
            }
            var index: number;
            if (this.parent === target.parent) {
                var from = this.parent.children.indexOf(this);
                var to = this.parent.children.indexOf(target);
                index = from < to ? to : to + 1;
            }
            else {
                index = target.parent.children.indexOf(target) + 1;
            }
            target.parent.insert(this, index);
        }

        /**
         * Adds an element at container's end.
         * @param container Container element.
         */
        appendTo(container: Container) {
            container.append(this);
        }

        /**
         * Adds an element at container's beginning.
         * @param container Container element.
         */
        prependTo(container: Container) {
            container.prepend(this);
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
        bubbleBy(fn: (el: Element) => any): Element {
            var current = this;
            while (current) {
                if (!!fn(current) === true) {
                    return current;
                }
                current = current.parent;
            }

            return null;
        }

        /**
         * Sets the focus to this element.
         */
        focus() {
            this.domElement.focus();
        }


        //--------
        // BINDING
        //--------

        /**
         * Holds control's properties' bindings.
         */
        protected bindings: UIBindingDictionary;
        /**
         * Holds control's properties' expressions.
         */
        protected expressions: UIExpressionDictionary;

        /**
         * Binds control's property to source property.
         * @param controlProperty Control's property name.
         * @param objectPropertyPath Object's property name.
         * @param [source] Binding source object. If not specified the element's scope will be used.
         */
        bind(controlProperty: string, objectPropertyPath: string, source?) {
            if (this.bindings[controlProperty]) {
                // Unsubscribe from prev changes
                this.bindings[controlProperty].unbind();
            }

            if (objectPropertyPath === '') {
                throw new Error('Binding path cannot be empty.');
            }

            if (controlProperty === 'scope' && !source) {
                if (!this.parent) {
                    //throw new Error('Unable to bind "scope" property. Element has no parent.');
                    source = {};
                }
                else {
                    source = this.parent.scope;
                }
            }

            this.bindings[controlProperty] = new BindingManager(
                this,
                controlProperty,
                source || this.scope,
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
            if (this.expressions[controlProperty]) {
                this.expressions[controlProperty].unbind();
                delete this.expressions[controlProperty];
            }
        }

        /**
         * Binds control's property to expression.
         * @param controlProperty Control's property name.
         * @param expression Expression e.g. "{obj.a} * 2 + Math.round({b})".
         * @param [source] Binding source object.
         */
        express(controlProperty: string, expression: string, source?) {
            if (this.expressions[controlProperty]) {
                this.expressions[controlProperty].unbind();
            }
            this.expressions[controlProperty] = new Expression(expression);
            this.bindings[controlProperty] = new BindingManager(
                this,
                controlProperty,
                this.expressions[controlProperty],
                'result');
        }

        /**
         * Get's or sets control's data scope.
         */
        get scope() {
            return this._scope;
        }
        set scope(scope) {
            if (scope && !(scope instanceof xp.Scope))
                throw new Error('"scope" is not an instance of Scope.');

            if (this.bindings['scope'])
                scope = new xp.Scope(scope, this.parent.scope);

            console.log(xp.formatString('{0}:{1}: Set data scope "{2}".', xp.getClassName(this), this.name || '-', scope));
            this._scope = scope;

            for (var cp in this.bindings) {
                if (cp !== 'scope') {
                    if (!this.expressions[cp]) {
                        this.bindings[cp].resetWith(scope);
                    }
                }
            }
            for (var cp in this.expressions) {
                if (cp !== 'scope') {
                    this.expressions[cp].resetWith(scope);
                }
            }
            this.onScopeChanged.invoke(scope);
        }
        private _scope: xp.Scope;

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
         * Fires when data scope is changed.
         */
        onScopeChanged: Event<xp.Scope>;
    }


    /**
     * Represents "control property name":"binding manager" dictionary.
     */
    export interface UIBindingDictionary {
        [controlProperty: string]: BindingManager;
    }

    /**
     * Represents "control property name":"expression" dictionary.
     */
    export interface UIExpressionDictionary {
        [controlProperty: string]: Expression;
    }

    /**
     * Flex values.
     */
    export enum FlexValue {
        None,
        Stretch
    }


    //---------------
    // MARKUP PARSING
    //---------------

    /**
     * Markup parser base.
     */
    export class ElementMarkupParser<T extends Element> implements MarkupParser<T>{

        /**
         * Returns function which initializes control
         * according to provider markup.
         * @param markup Element's markup.
         */
        getInitializer(markup: JQuery): UIInitializer<T> {
            var initAttributes = this.getAttributesInitializer(markup);
            return (el) => {
                initAttributes(el);
            };
        }

        /**
         * Returns function whilch initializes control
         * according to provided attributes of root element.
         * @param markup Element's markup.
         */
        protected getAttributesInitializer(markup: JQuery): UIInitializer<T> {
            var actions: UIInitializer<Element>[] = [];

            // Get attribute values
            var attributes = markup.get(0).attributes;
            var values: { [attr: string]: string; } = {};
            $.each(attributes,(i, attr: Attr) => {
                // Add attribute's name and value into dictionary
                values[attr.name] = attr.value;
            });

            var map = this.getAttributeMap();
            for (var key in values) {
                // Find attribute
                if (!map[key]) {
                    throw new Error(xp.formatString('Illegal attribute "{0}" of element <"{1}">.', key, markup[0].nodeName));
                }

                // Check for binding
                var bindings = values[key].match(/^\{(.*)\}$/);
                var expressions = values[key].match(/^\((.*)\)$/);
                if (bindings && bindings[1] !== void 0) {
                    var path = bindings[1];
                    // Bind control property
                    var act = ((k, p) => {
                        return (el: Element) => el.bind(k, p);
                    })(key, path);
                    actions.push(act);
                }
                else if (expressions && expressions[1] !== void 0) {
                    var expr = expressions[1];
                    // Register expression
                    var act = ((k, ex) => {
                        return (el: Element) => el.express(k, ex);
                    })(key, expr);
                    actions.push(act);
                }
                else if (map[key]['*']) {
                    // If accepts any value -> call setter with value
                    var setter = map[key]['*'];
                    var init = setter(values[key]);
                    actions.push(init);
                }
                else {
                    // Find value
                    if (!map[key][values[key]] && !map['*']) {
                        throw new Error(xp.formatString('Illegal value "{0}" for attribute "{1}" of element "{2}".', values[key], key, markup[0].nodeName));
                    }
                    // Call setter
                    var setter = map[key][values[key]];
                    var init = setter()
                    actions.push(init);
                }
            }

            return (el) => actions.forEach((init) => init(el));
        }

        /**
         * Returns markup attributes mapping to control's properties.
         */
        protected getAttributeMap(): AttributeMap<T> {
            return {
                'enabled': {
                    'true': () => (el) => el.enabled = true,
                    'false': () => (el) => el.enabled = false
                },
                'name': {
                    '*': (name) => (el) => el.name = name,
                },
                'key': {
                    '*': (key) => (el) => el.key = key,
                },
                'style': {
                    '*': (cssClass) => (el) => el.style = cssClass,
                },
                'width': {
                    '*': (width) => (el) => el.width = width
                },
                'height': {
                    '*': (height) => (el) => el.height = height
                },
                'margin': {
                    '*': (margin) => (el) => el.margin = margin
                },
                'flex': {
                    'None': (flex) => (el) => el.flex = FlexValue.None,
                    'Stretch': (flex) => (el) => el.flex = FlexValue.Stretch
                },
                'scope': {}, // TODO: Deserialize JSON?

                // Events
                'onClick': {
                    '*': (name) => (el) => el.registerUIHandler(el.onClick, name)
                },
                'onMouseDown': {
                    '*': (name) => (el) => el.registerUIHandler(el.onMouseDown, name)
                },
                'onMouseUp': {
                    '*': (name) => (el) => el.registerUIHandler(el.onMouseUp, name)
                },
                'onMouseMove': {
                    '*': (name) => (el) => el.registerUIHandler(el.onMouseMove, name)
                },
                'onMouseEnter': {
                    '*': (name) => (el) => el.registerUIHandler(el.onMouseEnter, name)
                },
                'onMouseLeave': {
                    '*': (name) => (el) => el.registerUIHandler(el.onMouseLeave, name)
                },
                'onKeyPress': {
                    '*': (name) => (el) => el.registerUIHandler(el.onKeyPress, name)
                },
                'onKeyDown': {
                    '*': (name) => (el) => el.registerUIHandler(el.onKeyDown, name)
                },
                'onKeyUp': {
                    '*': (name) => (el) => el.registerUIHandler(el.onKeyUp, name)
                }
            };
        }
    }
}