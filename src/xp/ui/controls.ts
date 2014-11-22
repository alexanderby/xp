module xp.Ui {

    export var Tags: { [tag: string]: typeof Element } = {};


    interface AttrValueDictionary {
        [attr: string]: string;
    }

    interface AttributeMap {
        [attr: string]: ValueMap;
    }

    interface ValueMap {
        [value: string]: (value?: string) => void;
    }


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
            this.initEvents();
        }

        /**
         * Initializes UI element.
         * @param xmlElement Markup XML-element.
         */
        protected initElement(xmlElement?: JQuery) {
            this.domElement = $(this.getTemplate());
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
         * Returns element's HTML template.
         */
        protected getTemplate() {
            return '<div></div>';
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
         * Gets or sets value indicating control is enabled or disabled.
         */
        get enabled() {
            return this._enabled;
        }
        set enabled(value) {
            this._enabled = value;

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

                if (map[key]['*']) {
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
                    '*': (name) => this.enabled = true,
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
    }


    /**
     * UI container.
     */
    export /*abstract*/ class Container extends Element {

        /**
         * Initializes UI container.
         * @param xmlElement Markup XML-element.
         */
        protected initElement(xmlElement?: JQuery) {
            this.domElement = $(this.getTemplate());
            this.children = [];
            if (xmlElement) {
                this.processXml(xmlElement);
            }
        }

        //----
        // DOM
        //------

        /**
         * Returns the DOM-element where children are placed.
         */
        protected getContainerElement(): JQuery {
            return this.domElement;
        }


        //------------------
        // GETTERS / SETTERS
        //------------------


        //------------------
        // ATTRIBUTE MAPPING
        //------------------

        /**
         * Processes XML node (applies attributes, creates children etc).
         * @param xmlElement Markup XML-element.
         */
        protected processXml(xmlElement: JQuery) {
            this.applyAttributes(xmlElement);

            // Create children
            $.each(xmlElement.children(), (i, childXmlNode) => {
                // Create child
                var tagName = childXmlNode.nodeName.toLowerCase();
                if (!xp.Ui.Tags[tagName]) {
                    throw new Error('Tags dictionary has no mathes for tag "' + tagName + '".');
                }
                var type = xp.Ui.Tags[tagName];
                var child = new type($(childXmlNode));

                // Append child
                this.appendElement(child);
            });
        }

        /**
        * Defines the way of setting control's properties through the XML attributes.
        */
        protected getAttributeMap(): AttributeMap {
            return xp.extendObject(super.getAttributeMap(), {
                'enabled': {
                    'true': () => this.cascadeBy((el) => el.enabled = true),
                    'false': () => this.cascadeBy((el) => el.enabled = true)
                }
            });
        }


        //----------
        // RELATIONS
        //----------

        /**
         * Children.
         */
        children: Element[];

        /**
         * Adds an element at container's end.
         * @param element Element to append.
         */
        appendElement(element: Element) {
            if (element.parent) {
                element.parent.detachChild(element);
            }
            this.children.push(element);
            element.parent = this;

            // DOM
            this.getContainerElement().append(element.domElement);
        }

        /**
         * Adds an element at container's beginning.
         * @param element Element to prepend.
         */
        prependElement(element: Element) {
            if (element.parent) {
                element.parent.detachChild(element);
            }
            this.children.splice(0, 0, element);
            element.parent = this;

            // DOM
            this.getContainerElement().prepend(element.domElement);
        }

        /**
         * Inserts element at index.
         * Be accurate: if element is already listed in the container, the resulting index may differ.
         * Use 'insertBefore' or 'insertAfter' instead.
         * @param element Element to prepend.
         * @param index Index to insert at.
         */
        insertElement(element: Element, index: number) {
            if (element.parent === this && this.children.indexOf(element) == index) {
                // Don't do anything.
            }
            else {
                var target = this.children[index];
                if (!target) {
                    // Append at end
                    this.appendElement(element);
                }
                else {
                    var targetIndex = (element.parent === this && this.children.indexOf(element) < index) ?
                        index - 1
                        : index;
                    element.parent.detachChild(element);
                    this.children.splice(targetIndex, 0, element);

                    // DOM
                    element.domElement.insertBefore(target.domElement);
                }
            }
        }

        /**
         * Detaches the child element, but doesn't remove it.
         * @param child Element to detach.
         */
        detachChild(child: Element) {
            var index = this.children.indexOf(child);
            if (index < 0) {
                throw new Error('Element is not a child of this container.');
            }
            this.children.splice(index, 1);
            child.parent = null;

            // DOM
            this.domElement.detach();
        }

        /**
         * Cascades through all child elements invoking a function.
         * Stops when function returns 'truthy' value.
         * @param fn Function to execute on each element.
         * @returns Element which lead to returning 'truthy' value.
         */
        cascadeBy(fn: (el: Element) => any): Element {
            if (!!fn(this) === true) {
                return this;
            }
            else {
                for (var i = 0; i < this.children.length; i++) {
                    if (!!fn(this.children[i]) === true) {
                        return this.children[i];
                    }
                    else {
                        if (this.children[i] instanceof Container) {
                            var result = (<Container>this.children[i]).cascadeBy(fn);
                            if (result != null) {
                                return result;
                            }
                        }
                    }
                }
            }
            return null;
        }

        /**
         * Searches for an element with given name.
         * @param name Element's name.
         */
        findElement(name: string): Element {
            name = name.toLowerCase();
            var result = this.cascadeBy((e) => e.name === name);
            return result;
        }
    }


    /**
     * Simple button.
     */
    export class Button extends Element {

        //----
        // DOM
        //----

        /**
        * Returns element's HTML template.
        */
        protected getTemplate() {
            return '<span class="button"></span>';
        }
        protected getIconTemplate() {
            return '<span class="icon"></span>';
        }
        protected getTextTemplate() {
            return '<span class="text"></span>';
        }

        protected iconElement: JQuery;
        protected textElement: JQuery;


        //------------------
        // GETTERS / SETTERS
        //------------------

        /**
         * Gets or sets the icon image.
         */
        get icon() {
            return this._iconPath;
        }
        set icon(path: string) {
            this._iconPath = path;

            // DOM
            if (!!path === true) {
                if (!this.iconElement) {
                    // Add icon
                    this.iconElement = $(this.getIconTemplate())
                        .prependTo(this.domElement);
                }
                // Set background image
                this.iconElement.css('background-image', path);
            }
            else {
                // Remove icon
                this.iconElement.remove();
            }
        }
        protected _iconPath: string;

        /**
         * Gets or sets button's text.
         */
        get text() {
            return this._text;
        }
        set text(text) {
            this._text = text;

            // DOM
            if (!!text === true) {
                if (!this.textElement) {
                    // Add text
                    this.textElement = $(this.getTextTemplate())
                        .appendTo(this.domElement);
                }
                // Set text
                this.textElement.text(text);
            }
            else {
                // Remove text
                this.textElement.remove();
            }
        }
        protected _text: string;


        //------------------
        // ATTRIBUTE MAPPING
        //------------------

        /**
        * Defines the way of setting control's properties through the XML attributes.
        */
        protected getAttributeMap(): AttributeMap {
            return xp.extendObject(super.getAttributeMap(), {
                'icon': {
                    '*': (value) => this.icon = value
                },
                'text': {
                    '*': (value) => this.text = value
                },
            });
        }
    }
    Tags['button'] = Button;


    /**
     * View.
     */
    export class View extends Container {

        //----
        // DOM
        //----

        protected getTemplate() {
            return '<div class="view"></div>';
        }
    }
    Tags['view'] = View;


    /**
     * Window.
     */
    export class Window extends Container {

        //----
        // DOM
        //----

        protected getTemplate() {
            return '<body></body>';
        }


        //-------
        // EVENTS
        //-------


        //------------------
        // GETTERS / SETTERS
        //------------------

        /**
         * Gets or sets app title.
         */
        get title() {
            return this._title;
        }
        set title(title: string) {
            this._title = title;
            document.title = title;
        }
        protected _title: string;


        //------------------
        // ATTRIBUTE MAPPING
        //------------------

        protected getAttributeMap(): AttributeMap {
            return xp.extendObject(super.getAttributeMap(), {
                'title': {
                    '*': (value) => this.title = value
                }
            });
        }
    }
    Tags['window'] = Window;


    /**
     * Horizontal stack panel.
     */
    export class HBox extends Container {
        protected getTemplate() {
            return '<div class="hbox"></div>';
        }
    }
    Tags['hbox'] = HBox;


    /**
     * Vertical stack panel.
     */
    export class VBox extends Container {
        protected getTemplate() {
            return '<div class="vbox"></div>';
        }
    }
    Tags['vbox'] = VBox;
} 