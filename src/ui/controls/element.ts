type domElement = Element;

module xp.ui {

    export interface ElementMarkup {
        //onClick: string|{ (e: MouseEvent): void };
        //onDoubleClick: string|{ (e: MouseEvent): void };
        //onMouseDown: string|{ (e: MouseEvent): void };
        //onMouseUp: string|{ (e: MouseEvent): void };
        //onMouseMove: string|{ (e: MouseEvent): void };
        //onMouseEnter: string|{ (e: MouseEvent): void };
        //onMouseLeave: string|{ (e: MouseEvent): void };
        //onKeyPress: string|{ (e: KeyboardEvent): void };
        //onKeyDown: string|{ (e: KeyboardEvent): void };
        //onKeyUp: string|{ (e: KeyboardEvent): void };

        //onRendered: string|{ (e: Element): void };

        initializer?: (el: Element) => void;
        enabled?: boolean;
        name?: string;
        key?: string;
        width?: string;
        height?: string;
        minWidth?: string;
        minHeight?: string;
        maxWidth?: string;
        maxHeight?: string;
        margin?: string;
        style?: string;
        flex?: string;
        visible?: boolean;
    }

    /**
     * UI element.
     */
    export /*abstract*/ class Element extends Model {
        initializer: (el: Element) => void;
        enabled: boolean;
        name: string;
        //key: string;
        width: string;
        height: string;
        minWidth: string;
        minHeight: string;
        maxWidth: string;
        maxHeight: string;
        margin: string;
        style: string;
        flex: string;
        visible: boolean;

        /**
         * Creates UI element.
         */
        constructor(markup?: ElementMarkup) {
            super();
            this.initElement();
            if (markup) {
                this.applyMarkup(markup);
            }
            this.initializer && this.initializer(this);
        }

        /**
         * Initializes UI element.
         */
        protected initElement() {
            this.defineProperties();
            this.domElement = this.getTemplate();
            this.initEvents();
            this.setDefaults();
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
            //return document.createElement('div');
            throw new Error('Unable to create an instance of an abstract element.');
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

        onClick: Event<MouseEventArgs>;
        onDoubleClick: Event<MouseEventArgs>;
        onMouseDown: Event<MouseEventArgs>;
        onMouseUp: Event<MouseEventArgs>;
        onMouseMove: Event<MouseEventArgs>;
        onMouseEnter: Event<MouseEventArgs>;
        onMouseLeave: Event<MouseEventArgs>;
        onKeyPress: Event<KeyboardEventArgs>;
        onKeyDown: Event<KeyboardEventArgs>;
        onKeyUp: Event<KeyboardEventArgs>;

        /**
         * Is invoked when element is being removed.
         */
        onRemoved: xp.Event<Element>;

        /**
         * Is invoked when element is first time rendered.
         */
        onRendered: xp.Event<Element>;

        /**
         * Initializes control's events.
         */
        protected initEvents() {
            this.bindings = {};
            this.expressions = {};

            // Control's events

            this.onScopeChanged = new xp.Event();
            this.onRendered = new xp.Event();

            this.onClick = new xp.Event();
            this.onDoubleClick = new xp.Event();
            this.onMouseDown = new xp.Event();
            this.onMouseUp = new xp.Event;
            this.onMouseMove = new xp.Event();
            this.onMouseEnter = new xp.Event();
            this.onMouseLeave = new xp.Event();
            this.onKeyPress = new xp.Event();
            this.onKeyDown = new xp.Event();
            this.onKeyUp = new xp.Event();

            // Unregister events on remove?
            this.onRemoved = new xp.Event();
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

        protected initSimpleDomEvent(eventName: string, event: Event<EventArgs>) {
            this.domElement.addEventListener(eventName,(e) => {
                if (this.enabled) {
                    var args = createEventArgs(this, e);
                    event.invoke(args);
                }
            });
        }


        //-----------
        // PROPERTIES
        //-----------

        applyMarkup(markup: ElementMarkup) {
            for (var prop in markup) {
                // Check for binding
                var value = markup[prop];
                if (typeof value === 'string') {
                    var binding = (<string>value).match(/^\{(.*)\}$/);
                    var expression = (<string>value).match(/^\((.*)\)$/);
                    if (binding && binding[1]) {
                        this.bind(prop, binding[1]);
                    }
                    else if (expression && expression[1]) {
                        this.express(prop, expression[1]);
                    }
                    else {
                        this[prop] = value;
                    }
                }
                else {
                    this[prop] = value;
                }
            }
        }
        
        /**
         * Defines a single property.
         * @param prop Property name.
         * @param options Property options.
         */
        protected defineProperty(prop: string, options: PropertyOptions) {
            var value;
            Object.defineProperty(this, prop, {
                enumerable: true,
                configurable: true,
                get: () => {
                    if (options.getter) {
                        return options.getter();
                    }
                    return value;
                },
                set: (v) => {
                    if (options.acceptedValues && options.acceptedValues.indexOf(v) < 0) {
                        throw new Error(xp.formatString(
                            'The value "{0}" is not accepted for a {1}. List of accepted values: {2}.',
                            v, xp.getClassName(this), options.acceptedValues.join(', ')));
                    }
                    if (options.setter) {
                        options.setter(v);
                    }
                    value = v;
                    if (options.observable) {
                        this.onPropertyChanged.invoke(prop);
                    }
                }
            });
        }

        /**
         * Defines element's properties.
         */
        protected defineProperties() {
            this.defineProperty('enabled', {
                setter: (value) => {
                    if (value) {
                        this.domElement.classList.remove('disabled');
                    }
                    else {
                        this.domElement.classList.add('disabled');
                    }
                },
                observable: true
            });
            this.defineProperty('name', {
                setter: (value) => this.domElement.id = value,
                getter: () => this.domElement.id
            });
            this.defineProperty('key', {});
            this.defineProperty('width', {
                setter: (value) => this.domElement.style.width = value,
                getter: () => this.domElement.offsetWidth + 'px'
            });
            this.defineProperty('height', {
                setter: (value) => this.domElement.style.height = value,
                getter: () => this.domElement.offsetHeight + 'px'
            });
            this.defineProperty('minWidth', {
                setter: (value) => this.domElement.style.minWidth = value,
                getter: () => this.domElement.style.minWidth
            });
            this.defineProperty('minHeight', {
                setter: (value) => this.domElement.style.minHeight = value,
                getter: () => this.domElement.style.minHeight
            });
            this.defineProperty('maxWidth', {
                setter: (value) => this.domElement.style.maxWidth = value,
                getter: () => this.domElement.style.maxWidth
            });
            this.defineProperty('maxHeight', {
                setter: (value) => this.domElement.style.maxHeight = value,
                getter: () => this.domElement.style.maxHeight
            });
            this.defineProperty('margin', {
                setter: (value) => this.domElement.style.margin = value,
                getter: () => this.domElement.style.margin
            });
            var style = '';
            this.defineProperty('style', {
                getter: () => style,
                setter: (value: string) => {
                    // Remove prev
                    if (style) {
                        var classes = style.split(' ');
                        classes.forEach((c) => this.domElement.classList.remove(c));
                    }
                    // Set new
                    style = value;
                    var classes = value.split(' ');
                    classes.forEach((c) => this.domElement.classList.add(c));
                }
            });
            this.defineProperty('flex', {
                setter: (flex: string) => {
                    this.domElement.classList.remove('flex-None');
                    this.domElement.classList.remove('flex-Stretch');
                    this.domElement.classList.remove('flex-Grow');
                    this.domElement.classList.remove('flex-Shrink');
                    switch (flex) {
                        case 'none':
                            this.domElement.classList.add('flex-None');
                            break;
                        case 'stretch':
                            this.domElement.classList.add('flex-Stretch');
                            break;
                        case 'grow':
                            this.domElement.classList.add('flex-Grow');
                            break;
                        case 'shrink':
                            this.domElement.classList.add('flex-Shrink');
                            break;
                        default:
                            throw new Error('Unknown flex value "' + flex + '".');
                    }
                },
                acceptedValues: ['none', 'shrink', 'grow', 'stretch']
            });

            this.defineProperty('visible', {
                setter: (value) => {
                    if (value) {
                        this.domElement.classList.remove('hidden');
                    }
                    else {
                        this.domElement.classList.add('hidden');
                    }
                },
                // TODO: Determine if element is really visible?
                //getter: !this.domElement.classList.contains('hidden');
                observable: true
            });
        }

        /**
         * Sets default values.
         */
        protected setDefaults() {
            this.enabled = true;
            this.visible = true;
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
         * @param setter Control's property name or a function.
         * @param path Source property name.
         * @param source Binding source object. If not specified the element's scope will be used.
         * @param defaultValue Value to use is case when source property is null or undefined.
         */
        bind(setter: string|{ (element: Element, value): void }, path: string, source?, defaultValue?) {
            var prop = setter.toString();

            if (this.bindings[prop]) {
                // Unsubscribe from prev changes
                this.bindings[prop].unbind();
            }

            if (prop === '') {
                throw new Error('Binding path cannot be empty.');
            }

            if (prop === 'scope' && !source) {
                if (this.useParentScope && this.parent) {
                    source = this.parent.scope;
                }
            }

            if (typeof setter === 'string') {
                this.bindings[prop] = new BindingManager(
                    this,
                    prop,
                    source,
                    path,
                    defaultValue);
            }
            else {
                this.bindings[prop] = new BindingCallManager(
                    source,
                    path,
                    (value) => setter(this, value),
                    null,
                    defaultValue);
            }
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
        express(setter: string|{ (element: Element, value): void }, expression: string, source?) {
            var prop = setter.toString();
            if (this.expressions[prop]) {
                this.expressions[prop].unbind();
            }
            this.expressions[prop] = new Expression(expression, source || this.scope);
            if (typeof setter === 'string') {
                this.bindings[prop] = new BindingManager(
                    this,
                    prop,
                    new Scope(this.expressions[prop]),
                    'result');
            }
            else {
                this.bindings[prop] = new BindingCallManager(
                    new Scope(this.expressions[prop]),
                    'result',
                    (result) => setter(this, result));
            }
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
        onScopeChanged: xp.Event<Object>;
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

    export interface PropertyOptions {
        setter?: (v) => void;
        getter?: () => void;
        observable?: boolean;
        acceptedValues?: any[];
    }
}