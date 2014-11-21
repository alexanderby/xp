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
            // Create element
            this.domElement = $(this.template);
            if (xmlElement) {
                this.processXml(xmlElement);
            }
            this.afterCreateTemplate();

            // Init events
            this.initEvents();
        }


        //----
        // DOM
        //----

        /**
         * DOM element of a control.
         */
        domElement: JQuery;
        protected template = '<div></div>';
        protected afterCreateTemplate() { }


        //-------
        // EVENTS
        //-------

        onClick = new Event<EventArgs>();
        onMouseDown = new Event<EventArgs>();
        onMouseUp = new Event<EventArgs>();
        onMouseMove = new Event<EventArgs>();
        onMouseEnter = new Event<EventArgs>();
        onMouseLeave = new Event<EventArgs>();

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
            this.domElement.on(eventName, (e: EventArgs) => {
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
                this.domElement.addClass('disabled');
            }
            else {
                this.domElement.removeClass('disabled');
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
            if (this.parent) {
                this.parent.children.splice(this.parent.children.indexOf(this), 1);
                this.parent = null;
            }

            // DOM
            this.domElement.remove();
        }

        /**
         * Inserts element before target element.
         */
        insertBefore(target: Element) {
            if (this.parent) {
                this.parent.children.splice(this.parent.children.indexOf(this), 1);
            }
            target.parent.children.splice(target.parent.children.indexOf(target), 0, this);
            this.parent = target.parent;

            // DOM
            this.domElement.insertBefore(target.domElement);
        }

        /**
         * Inserts element after target element.
         */
        insertAfter(target: Element) {
            if (this.parent) {
                this.parent.children.splice(this.parent.children.indexOf(this), 1);
            }
            target.parent.children.splice(target.parent.children.indexOf(target) + 1, 0, this);
            this.parent = target.parent;

            // DOM
            this.domElement.insertAfter(target.domElement);
        }

        /**
         * Adds an element at container's end.
         */
        appendTo(container: Container) {
            container.appendElement(this);
        }

        /**
         * Adds an element at container's beginning.
         */
        prependTo(container: Container) {
            container.prependElement(this);
        }
    }


    /**
     * UI container.
     */
    export /*abstract*/ class Container extends Element {

        /**
         * Creates UI container.
         * @param xmlElement Markup XML-element. 
         */
        constructor(xmlElement?: JQuery) {
            super(xmlElement);
            this.children = [];
            alert(this.children);
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
        children: Element[] = new Array<Element>();

        /**
         * Adds an element at container's end.
         */
        appendElement(element: Element) {
            debugger;
            if (element.parent) {
                element.parent.children.splice(element.parent.children.indexOf(element), 1);
            }
            this.children.push(element);
            element.parent = this;

            // DOM
            this.getContainerElement().append(element.domElement);
        }

        /**
         * Adds an element at container's beginning.
         */
        prependElement(element: Element) {
            if (element.parent) {
                element.parent.children.splice(element.parent.children.indexOf(element), 1);
            }
            this.children.splice(0, 0, element);
            element.parent = this;

            // DOM
            this.getContainerElement().prepend(element.domElement);
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

        protected template = '<span class="button"></span>';
        protected iconTemplate = '<span class="icon"></span>';
        protected textTemplate = '<span class="text"></span>';

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
                    this.iconElement = $(this.iconTemplate)
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
                    this.textElement = $(this.textTemplate)
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
        protected template = '<div class="view"></div>';
    }
    Tags['view'] = View;


    /**
     * Window.
     */
    export class Window extends Container {

        constructor(xmlElement?: JQuery) {
            super(xmlElement);
            this.children = [];
            alert(this.children);
        }

        children: Element[] = new Array<Element>();

        //----
        // DOM
        //----

        protected template = '<body></body>';


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
        protected template = '<div class="hbox"></div>';
    }
    Tags['hbox'] = HBox;


    /**
     * Vertical stack panel.
     */
    export class VBox extends Container {
        protected template = '<div class="vbox"></div>';
    }
    Tags['vbox'] = VBox;
} 