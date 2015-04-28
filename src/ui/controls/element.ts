type gElement = Element;

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
        domElement: HTMLElement;

        /**
         * Returns element's template.
         */
        protected getTemplate(): HTMLElement {
            return document.createElement('div');
        }

        /*internal*/ __setRenderedState__(rendered) {
            this.__isRendered__ = rendered;
            if (rendered && this.onRendered)
                this.onRendered.invoke(this);
        }
        /*internal*/ __isRendered__ = false;


        //-------
        // EVENTS
        //-------

        onClick: Event<EventArgs<MouseEvent>>;
        onDoubleClick: Event<EventArgs<MouseEvent>>;
        onMouseDown: Event<EventArgs<MouseEvent>>;
        onMouseUp: Event<EventArgs<MouseEvent>>;
        onMouseMove: Event<EventArgs<MouseEvent>>;
        onMouseEnter: Event<EventArgs<MouseEvent>>;
        onMouseLeave: Event<EventArgs<MouseEvent>>;
        onKeyPress: Event<EventArgs<KeyboardEvent>>;
        onKeyDown: Event<EventArgs<KeyboardEvent>>;
        onKeyUp: Event<EventArgs<KeyboardEvent>>;

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
            this.onDoubleClick = new Event();
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
                this.onDoubleClick.removeAllHandlers();
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
            this.initSimpleDomEvent('click', this.onClick);
            this.initSimpleDomEvent('dblclick', this.onDoubleClick);
            this.initSimpleDomEvent('mousedown', this.onMouseDown);
            this.initSimpleDomEvent('mouseup', this.onMouseUp);
            this.initSimpleDomEvent('mousemove', this.onMouseMove);
            // TODO: Fix mouseenter and mouseleave events.
            //this.initSimpleDomEvent('mouseenter', this.onMouseEnter);
            //this.initSimpleDomEvent('mouseleave', this.onMouseLeave);
            this.initSimpleDomEvent('mouseover', this.onMouseEnter);
            this.initSimpleDomEvent('mouseout', this.onMouseLeave);
            this.initSimpleDomEvent('keypress', this.onKeyPress);
            this.initSimpleDomEvent('keydown', this.onKeyDown);
            this.initSimpleDomEvent('keyup', this.onKeyUp);
        }

        protected initSimpleDomEvent(eventName: string, event: UIEvent<gEvent>) {
            this.domElement.addEventListener(eventName,(e) => {
                if (this.enabled) {
                    var args = createEventArgs(this, e);
                    event.invoke(args);
                }
            });
        }

        /**
         * Registers control's event handler by name.
         * @param event Event.
         * @param handlerName Handler name.
         */
        registerUIHandler(event: Event<EventArgs<gEvent>>, handlerName: string) {
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
            this.visible = true;
        }

        /**
         * Gets or sets value indicating control being enabled or disabled.
         */
        get enabled() {
            return !this.domElement.classList.contains('disabled');
        }
        set enabled(value) {
            if (value) {
                this.domElement.classList.remove('disabled');
            }
            else {
                this.domElement.classList.add('disabled');
            }
        }

        /**
         * Gets or sets element's name.
         */
        get name() {
            return this.domElement.id;
        }
        set name(value: string) {
            this.domElement.id = value;
        }

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
            return this.domElement.offsetWidth + 'px';
        }
        set width(width: string) {
            this.domElement.style.width = width;
        }

        /**
         * Gets or sets height of the element (using CSS syntax).
         */
        get height() {
            return this.domElement.offsetHeight + 'px';
        }
        set height(height: string) {
            this.domElement.style.height = height;
        }

        /**
         * Gets or sets minimal width of the element (using CSS syntax).
         */
        get minWidth() {
            return this.domElement.style.minWidth;
        }
        set minWidth(width: string) {
            this.domElement.style.minWidth = width;
        }

        /**
         * Gets or sets minimal height of the element (using CSS syntax).
         */
        get minHeight() {
            return this.domElement.style.minHeight;
        }
        set minHeight(height: string) {
            this.domElement.style.minHeight = height;
        }

        /**
         * Gets or sets maximal width of the element (using CSS syntax).
         */
        get maxWidth() {
            return this.domElement.style.maxWidth;
        }
        set maxWidth(width: string) {
            this.domElement.style.maxWidth = width;
        }

        /**
         * Gets or sets maximal height of the element (using CSS syntax).
         */
        get maxHeight() {
            return this.domElement.style.maxHeight;
        }
        set maxHeight(height: string) {
            this.domElement.style.maxHeight = height;
        }

        /**
         * Gets or sets margin of the element (using CSS syntax).
         */
        get margin() {
            return this.domElement.style.margin;
        }
        set margin(margin: string) {
            this.domElement.style.margin = margin;
        }

        /**
         * Gets or sets element's CSS class (or multiple separated by white space).
         */
        get style() {
            return this._style;
        }
        set style(cssClass) {
            // Remove prev
            if (this._style) {
                var classes = this._style.split(' ');
                classes.forEach((c) => this.domElement.classList.remove(c));
            }
            // Set new
            this._style = cssClass;
            var classes = cssClass.split(' ');
            classes.forEach((c) => this.domElement.classList.add(c));
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
            this.domElement.classList.remove('flex-None');
            this.domElement.classList.remove('flex-Stretch');
            this.domElement.classList.remove('flex-Grow');
            this.domElement.classList.remove('flex-Shrink');
            switch (flex) {
                case FlexValue.None:
                    this.domElement.classList.add('flex-None');
                    break;
                case FlexValue.Stretch:
                    this.domElement.classList.add('flex-Stretch');
                    break;
                case FlexValue.Grow:
                    this.domElement.classList.add('flex-Grow');
                    break;
                case FlexValue.Shrink:
                    this.domElement.classList.add('flex-Shrink');
                    break;
                default:
                    throw new Error('Unknown flex value "' + flex + '".');
            }
        }
        private _flex: FlexValue;

        get visible() {
            // TODO: Determine if element is really visible?
            return !this.domElement.classList.contains('hidden');
        }
        set visible(v) {
            if (v) {
                this.domElement.classList.remove('hidden');
            }
            else {
                this.domElement.classList.add('hidden');
            }
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

                if (!this.__isRendered__ && parent.__isRendered__)
                    // Mark as rendered
                    this.__setRenderedState__(true);
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
            Dom.remove(this.domElement);

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
         * @param [defaultValue] Value to use is case when source property is unreachable.
         * @param [sourceConverter] Function which converts source value.
         * @param [targetConverter] Function which converts target value.
         */
        bind(controlProperty: string, objectPropertyPath: string, source?, defaultValue?: any, sourceConverter?: (srcValue) => any, targetConverter?: (targetValue) => any) {
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
                source || this.scope || new Scope(null),
                objectPropertyPath,
                defaultValue,
                sourceConverter,
                targetConverter);
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
            this.expressions[controlProperty] = new Expression(expression, source || this.scope);
            this.bindings[controlProperty] = new BindingManager(
                this,
                controlProperty,
                new Scope(this.expressions[controlProperty]),
                'result');
        }

        /**
         * Get's or sets control's data scope.
         */
        get scope() {
            return this._scope;
        }
        set scope(scope) {
            if (this.bindings['scope'] && scope !== this.parent.scope)
                scope = new xp.Scope(scope, this.parent.scope);

            Log.write(Log.HeatLevel.Log, Log.Domain.UI | Log.Domain.Binding, '{0}:{1}: Set data scope "{2}".', xp.getClassName(this), this.name || '-', scope);
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
        private _scope: Object;

        /**
         * Is invoked when user performs an input action.
         * @param controlProp Target control property.
         * @param value Value, that user inputs.
         */
        protected onInput(controlProp: string, value) {
            Log.write(Log.HeatLevel.Log, Log.Domain.UI, '{0}:{1}.{2}: Input "{3}".', xp.getClassName(this), this.name || '-', controlProp, value);
            this[controlProp] = value;
            if (this.bindings[controlProp]) {
                this.bindings[controlProp].updateSource();
            }
        }

        /**
         * Fires when data scope is changed.
         */
        onScopeChanged: Event<Object>;
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
        Stretch,
        Grow,
        Shrink
    }

    ///**
    // * Visibility values.
    // */
    //export enum Visibility {
    //    Visible,
    //    Hidden,
    //    Collapsed
    //}


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
        getInitializer(markup: gElement): UIInitializer<T> {
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
        protected getAttributesInitializer(markup: gElement): UIInitializer<T> {
            var actions: UIInitializer<Element>[] = [];

            // Get attribute values
            var attributes = markup.attributes;
            var values: { [attr: string]: string; } = {};
            Array.prototype.forEach.call(attributes,(attr: Attr) => {
                // Add attribute's name and value into dictionary
                values[attr.name] = attr.value;
            });

            var map = this.getAttributeMap();
            for (var key in values) {
                // Find attribute
                if (!map[key]) {
                    throw new Error(xp.formatString('Illegal attribute "{0}" of element <"{1}">.', key, markup.nodeName));
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
                        throw new Error(xp.formatString('Illegal value "{0}" for attribute "{1}" of element "{2}".', values[key], key, markup.nodeName));
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
                'minWidth': {
                    '*': (width) => (el) => el.minWidth = width
                },
                'minHeight': {
                    '*': (height) => (el) => el.minHeight = height
                },
                'maxWidth': {
                    '*': (width) => (el) => el.maxWidth = width
                },
                'maxHeight': {
                    '*': (height) => (el) => el.maxHeight = height
                },
                'margin': {
                    '*': (margin) => (el) => el.margin = margin
                },
                'flex': {
                    'None': (flex) => (el) => el.flex = FlexValue.None,
                    'Stretch': (flex) => (el) => el.flex = FlexValue.Stretch,
                    'Grow': (flex) => (el) => el.flex = FlexValue.Grow,
                    'Shrink': (flex) => (el) => el.flex = FlexValue.Shrink
                },
                'visible': {
                    'true': () => (el) => el.visible = true,
                    'false': () => (el) => el.visible = false
                },
                //'visibility': {
                //    'Visible': (v) => (el) => el.visibility = Visibility.Visible,
                //    'Hidden': (v) => (el) => el.visibility = Visibility.Hidden,
                //    'Collapsed': (v) => (el) => el.visibility = Visibility.Collapsed
                //},
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
        
        /**
         * Extends markup parser's attribute map.
         * @param parser Type of markup parser.
         * @param extMap Attribute map extension.
         */
        static extendAttributeMap<T extends Element>(parser: Constructor<ElementMarkupParser<T>>, extMap: AttributeMap<T>) {
            var map = parser.prototype['getAttributeMap']();
            for (var key in extMap) {
                map[key] = extMap[key];
            }
            parser.prototype['getAttributeMap'] = () => map;
        }
    }
}