type DOMElement = Element;

module xp {

    export interface ElementMarkup<T extends Element> {
        onClick?: (e: MouseEventArgs) => void;
        onDoubleClick?: (e: MouseEventArgs) => void;
        onMouseDown?: (e: MouseEventArgs) => void;
        onMouseUp?: (e: MouseEventArgs) => void;
        onMouseMove?: (e: MouseEventArgs) => void;
        onMouseEnter?: (e: MouseEventArgs) => void;
        onMouseLeave?: (e: MouseEventArgs) => void;
        onKeyPress?: (e: KeyboardEventArgs) => void;
        onKeyDown?: (e: KeyboardEventArgs) => void;
        onKeyUp?: (e: KeyboardEventArgs) => void;

        onRendered?: (e: T) => void;
        onRemoved?: (e: T) => void;

        init?: (el: T) => void;
        enabled?: boolean|string;
        name?: string; // Maybe is obsolete. init() may be used.
        key?: string; // Maybe is obsolete. init() may be used.
        width?: string;
        height?: string;
        minWidth?: string;
        minHeight?: string;
        maxWidth?: string;
        maxHeight?: string;
        margin?: string;
        style?: string;
        flex?: string;
        visible?: boolean|string;

        useParentScope?: boolean;
        scope?: any;
    }

    /**
     * UI element.
     */
    export /*abstract*/ class Element extends Model {
        init: (el: Element) => void;
        enabled: boolean;
        name: string;
        key: string;
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
        constructor(markup?: ElementMarkup<Element>) {
            super();
            this.initElement();
            if (markup) {
                this.applyMarkup(markup);
            }
            this.init && this.init(this);
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


        //-----------
        //    DOM
        //-----------

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

        /**
         * Renders an element into DOM.
         * @param domElement Target DOM element to be replaced with control.
         */
        renderTo(domElement: HTMLElement) {
            domElement.parentElement.replaceChild(this.domElement, domElement);
            this.__setRenderedState__(true);
        }

        /*internal*/ __setRenderedState__(rendered) {
            this.__isRendered__ = rendered;
            if (rendered && this.onRendered)
                this.onRendered.invoke(this);
        }
        /*internal*/ __isRendered__ = false;


        //-----------
        //   EVENTS
        //-----------

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
            this.bindings = new Dictionary<string|{ (value): void }, BindingManager>();
            this.expressions = new Dictionary<string|{ (value, el?: Element): void }, Expression>();

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
            this.domElement.addEventListener(eventName, (e) => {
                var args = createEventArgs(this, e);
                event.invoke(args);
            });
        }


        //--------------
        //   PROPERTIES
        //--------------

        applyMarkup(markup: ElementMarkup<Element>) {
            for (var prop in markup) {
                // Check for binding
                var value = markup[prop];
                if (typeof value === 'string') {
                    var binding = (<string>value).match(/^\{(.*)\}$/);
                    var expression = (<string>value).match(/^\((.*)\)$/);
                    if (binding && binding[1]) {
                        this.bind(prop, { path: binding[1] });
                    }
                    else if (expression && expression[1]) {
                        this.express(prop, expression[1]);
                    }
                    else {
                        this[prop] = value;
                    }
                }
                else {
                    if (this[prop] instanceof xp.Event) {
                        (<xp.Event<any>>this[prop]).addHandler(markup[prop], this);
                    }
                    else {
                        this[prop] = value;
                    }
                }
            }
        }
        
        /**
         * Defines a single property.
         * @param prop Property name.
         * @param options Property options.
         */
        protected defineProperty(prop: string, options: ElementPropertyOptions) {
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
                        throw new Error(`The value "${v}" is not accepted for a ${xp.getClassName(this) }. List of accepted values: ${options.acceptedValues.join(', ') }.`);
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
                        this.domElement.style.pointerEvents = '';
                    }
                    else {
                        this.domElement.classList.add('disabled');
                        this.domElement.style.pointerEvents = 'none';
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


        //------------
        //  RELATIONS
        //------------

        /**
         * Gets element's parent.
         */
        get parent() {
            return this._parent;
        }
        /*internal*/ __setParent__(parent) {
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
                var scopeBinding = this.bindings.get('scope');
                if (!scopeBinding) {
                    // Use parent's scope
                    this.scope = this.parent.scope;
                }
                else {
                    // Update context binding
                    scopeBinding.resetWith(this.parent.scope);
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
            this.bindings.pairs.forEach((p) => p.value.unbind());
            this.bindings.pairs.splice(0);
            this.expressions.pairs.forEach((p) => p.value.unbind());
            this.expressions.pairs.splice(0);

            // DOM
            if (this.domElement.parentElement) {
                this.domElement.parentElement.removeChild(this.domElement);
            }

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


        //------------
        //   BINDING
        //------------

        /**
         * Holds control's properties' bindings.
         */
        protected bindings: xp.Dictionary<string|{ (value): void }, BindingManager>;
        /**
         * Holds control's properties' expressions.
         */
        protected expressions: xp.Dictionary<string|{ (value, el?: Element): void }, Expression>;

        /**
         * Binds control's property to source property.
         * @param setter Control's property name or a function.
         * @param options Binding options.
         */
        bind(setter: string|{ (value): void }, options: { scope?: Object, path: string, defaultValue?: any, getter?: () => any }) {
            var binding = this.bindings.get(setter);

            if (binding) {
                // Unsubscribe from prev changes
                binding.unbind();
            }
            if (setter === '' || options.path === '') {
                throw new Error('Binding path cannot be empty.');
            }

            if (setter === 'scope' && !this.useParentScope && !options.scope) {
                throw new Error('Unable to bind element\'s scope to itself.');
            }
            var source = options.scope;
            if (!source) {
                if (this.useParentScope) {
                    if (this.parent) {
                        source = this.parent.scope;
                    }
                }
                else {
                    source = this.scope;
                }
            }

            this.bindings.set(setter, new BindingManager({
                scope: source,
                path: options.path,
                setter: (typeof setter === 'string' ?
                    (v) => this[setter] = v
                    : setter),
                getter: (options.getter
                    || (typeof setter === 'string' ?
                        () => { return this[setter]; }
                        : () => { throw new Error('Getter or property name is not set.'); })
                    ),
                defaultValue: options.defaultValue
            }));
        }

        /**
         * Unbinds control property from data context.
         * @param setter Name of the property to unbind, or a reference to a setter.
         */
        unbind(setter: string) {
            var binding = this.bindings.get(setter);
            if (binding) {
                binding.unbind();
                this.bindings.remove(setter);
            }
            var expr = this.expressions.get(setter);
            if (expr) {
                expr.unbind();
                this.expressions.remove(setter);
            }
        }

        /**
         * Binds control's property to expression.
         * @param controlProperty Control's property name.
         * @param expression Expression e.g. "{obj.a} * 2 + Math.round({b})".
         * @param [source] Binding source object.
         */
        express(setter: string|{ (value, element?: Element): void }, expression: string, source?) {
            var expr = this.expressions.get(setter);
            if (expr) {
                expr.unbind();
            }
            expr = new Expression(expression, source || this.scope);
            this.expressions.set(setter, expr);
            this.bindings.set(setter, new BindingManager({
                scope: expr,
                path: 'result',
                setter: (typeof setter === 'string' ?
                    (v) => this[setter] = v
                    : setter),
                getter: expr.result
            }));
        }

        /**
         * Get's or sets control's data scope.
         */
        get scope() {
            return this._scope;
        }
        set scope(scope) {
            if (this.bindings.get('scope') && scope !== this.parent.scope)
                scope = new xp.Scope(scope, this.parent.scope);

            Log.write(Log.HeatLevel.Log, Log.Domain.UI | Log.Domain.Binding, `${xp.getClassName(this) }:${this.name || '-'}: Set data scope "${scope}".`);
            this._scope = scope;

            this.bindings.pairs.forEach((p) => {
                var setter = p.key;
                var binding = p.value;
                if (setter !== 'scope' && !this.expressions.get(setter)) {
                    binding.resetWith(scope);
                }
            });
            this.expressions.pairs.forEach((p) => {
                var setter = p.key;
                var expr = p.value;
                if (setter !== 'scope') {
                    expr.resetWith(scope);
                }
            });
            this.onScopeChanged.invoke(scope);
        }
        private _scope: Object;

        /**
         * Is invoked when user performs an input action.
         * @param setter Target control property or setter.
         * @param value Value, that user inputs.
         */
        protected onInput(setter: string|{ (value): void }, value) {
            Log.write(Log.HeatLevel.Log, Log.Domain.UI, `${xp.getClassName(this) }:${this.name || '-'}.${setter}: Input "${value}".`);
            if (typeof setter === 'string') {
                Path.setPropertyByPath(this, setter, value);
            }
            else {
                setter(value);
            }
            var binding = this.bindings.get(setter);
            if (binding) {
                // TODO: Does it cause double control property change?
                binding.updateSource();
            }
        }

        /**
         * Fires when data scope is changed.
         */
        onScopeChanged: xp.Event<Object>;
    }


    export interface ElementPropertyOptions {
        setter?: (v) => void;
        getter?: () => any;
        observable?: boolean;
        acceptedValues?: any[];
    }
}