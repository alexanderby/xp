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
        }

        /**
         * Initializes UI element.
         * @param xmlElement Markup XML-element.
         */
        protected initElement(xmlElement?: JQuery) {
            this.domElement = this.getTemplate();
            this.setDefaults();
            if (xmlElement) {
                this.processXml(xmlElement);
            }
            this.initEvents();
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
            this.domElement = this.getTemplate();
            this.initContent();
            this.setDefaults();
            if (xmlElement) {
                this.processXml(xmlElement);
            }
            this.initEvents();
        }

        /**
         * Initializes empty content.
         */
        protected initContent() {
            this.children = [];
        }

        //----
        // DOM
        //----

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

        protected getTemplate(): JQuery {
            var template = $('<span class="button"><span class="icon"></span><span class="text"></span></span>');
            this.iconElement = template.find('.icon');
            this.textElement = template.find('.text');
            return template;
        }

        protected iconElement: JQuery;
        protected textElement: JQuery;


        //------------------
        // GETTERS / SETTERS
        //------------------

        protected setDefaults() {
            this.icon = '';
            this.text = '';
        }

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
                // Set background image
                this.iconElement.css('background-image', path);
                this.iconElement.show();
            }
            else {
                this.iconElement.hide();
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
                // Set text
                this.textElement.text(text);
                this.textElement.show();
            }
            else {
                this.textElement.hide();
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
     * Stack panel.
     */
    export class Stack extends Container {

        //----
        // DOM
        //----

        protected getTemplate(): JQuery {
            var template = $('<div class="stack"><div class="content"></div></div>');
            return template;
        }

        protected getContainerElement(): JQuery {
            return this.domElement.find('.content');
        }


        //------------------
        // GETTERS / SETTERS
        //------------------

        protected setDefaults() {
            this.flow = Flow.vertical;
            this.contentAlignment = ContentAlignment.start;
            this.itemsAlignment = ItemsAlignment.stretch;
            this.scrollBar = ScrollBar.both;
        }

        /**
         * Gets or sets content flow.
         */
        get flow() {
            return this._flow;
        }
        set flow(flow: Flow) {
            this._flow = flow;

            // DOM
            switch (flow) {
                case Flow.horizontal:
                    this.removeFlowClasses();
                    this.domElement.addClass('flow-x');
                    break;
                case Flow.vertical:
                    this.removeFlowClasses();
                    this.domElement.addClass('flow-y');
                    break;
                default:
                    throw new Error('Unknown flow value: ' + flow);
            }
        }
        protected _flow: Flow;
        protected removeFlowClasses() {
            this.domElement.removeClass('flow-x flow-y');
        }

        /**
         * Gets or sets content alignment.
         */
        get contentAlignment() {
            return this._contentAlignment;
        }
        set contentAlignment(align: ContentAlignment) {
            this._contentAlignment = align;

            // DOM
            switch (align) {
                case ContentAlignment.start:
                    this.removeContentAlignmentClasses();
                    this.domElement.addClass('content-align-start');
                    break;
                case ContentAlignment.center:
                    this.removeContentAlignmentClasses();
                    this.domElement.addClass('content-align-center');
                    break;
                case ContentAlignment.end:
                    this.removeContentAlignmentClasses();
                    this.domElement.addClass('content-align-end');
                    break;
                default:
                    throw new Error('Unknown content alignment value: ' + align);
            }
        }
        protected _contentAlignment: ContentAlignment;
        protected removeContentAlignmentClasses() {
            this.domElement.removeClass('content-align-start content-align-center content-align-end');
        }

        /**
         * Gets or sets items alignment.
         */
        get itemsAlignment() {
            return this._itemsAlignment;
        }
        set itemsAlignment(align: ItemsAlignment) {
            this._itemsAlignment = align;

            // DOM
            switch (align) {
                case ItemsAlignment.start:
                    this.removeItemsAlignmentClasses();
                    this.domElement.addClass('items-align-start');
                    break;
                case ItemsAlignment.center:
                    this.removeItemsAlignmentClasses();
                    this.domElement.addClass('items-align-center');
                    break;
                case ItemsAlignment.end:
                    this.removeItemsAlignmentClasses();
                    this.domElement.addClass('items-align-end');
                    break;
                case ItemsAlignment.stretch:
                    this.removeItemsAlignmentClasses();
                    this.domElement.addClass('items-align-stretch');
                    break;
                default:
                    throw new Error('Unknown items alignment value: ' + align);
            }
        }
        protected _itemsAlignment: ItemsAlignment;
        protected removeItemsAlignmentClasses() {
            this.domElement.removeClass('items-align-start items-align-center items-align-end items-align-stretch');
        }

        /**
         * Gets or sets container's scroll bar options.
         */
        get scrollBar() {
            return this._scrollBar;
        }
        set scrollBar(scroll: ScrollBar) {
            this._scrollBar = scroll;

            // DOM
            switch (scroll) {
                case ScrollBar.none:
                    this.removeScrollBarClasses();
                    this.domElement.addClass('scrollbar-none');
                    break;
                case ScrollBar.horizontal:
                    this.removeScrollBarClasses();
                    this.domElement.addClass('scrollbar-x');
                    break;
                case ScrollBar.vertical:
                    this.removeScrollBarClasses();
                    this.domElement.addClass('scrollbar-y');
                    break;
                case ScrollBar.both:
                    this.removeScrollBarClasses();
                    this.domElement.addClass('scrollbar-both');
                    break;
                default:
                    throw new Error('Unknown scroll bar value: ' + scroll);
            }
        }
        protected _scrollBar: ScrollBar;
        protected removeScrollBarClasses() {
            this.domElement.removeClass('scrollbar-none scrollbar-x scrollbar-y scrollbar-both');
        }


        //------------------
        // ATTRIBUTE MAPPING
        //------------------

        protected getAttributeMap() {
            return xp.extendObject(super.getAttributeMap(), {
                'flow': {
                    'horizontal': () => this.flow = Flow.horizontal,
                    'vertical': () => this.flow = Flow.vertical
                },
                'content-align': {
                    'start': () => this.contentAlignment = ContentAlignment.start,
                    'center': () => this.contentAlignment = ContentAlignment.center,
                    'end': () => this.contentAlignment = ContentAlignment.end
                },
                'items-align': {
                    'start': () => this.itemsAlignment = ItemsAlignment.start,
                    'center': () => this.itemsAlignment = ItemsAlignment.center,
                    'end': () => this.itemsAlignment = ItemsAlignment.end,
                    'stretch': () => this.itemsAlignment = ItemsAlignment.stretch
                },
                'scroll': {
                    'none': () => this.scrollBar = ScrollBar.none,
                    'horizontal': () => this.scrollBar = ScrollBar.horizontal,
                    'vertical': () => this.scrollBar = ScrollBar.vertical,
                    'both': () => this.scrollBar = ScrollBar.both
                }
            });
        }

    }
    Tags['stack'] = Stack;


    //export class ScrollPanel extends Container {

    //}


    /**
     * View.
     */
    export class View extends Stack {

        //----
        // DOM
        //----

        protected getTemplate(): JQuery {
            //return $('<div class="view stack"></div>');
            var template = $('<div class="view stack"><div class="content"></div></div>');
            return template;
        }


        protected processXml(xmlElement: JQuery) {
            // Load from external file, if 'href' attribute specified.
            var url: string = xmlElement.get(0).getAttribute('href');
            if (url) {
                xmlElement = xp.loadMarkupSync(url);
            }

            super.processXml(xmlElement);
        }
    }
    Tags['view'] = View;


    /**
     * Window.
     */
    export class Window extends Stack {

        //----
        // DOM
        //----

        protected getTemplate(): JQuery {
            var template = $('<body></body>') // Bug when defining class in html on body
                .addClass('window')
                .addClass('stack')
                .append('<div class="content"></div>');
            return template;
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
     * Content alignment values.
     */
    export enum ContentAlignment {
        start,
        center,
        end
    }

    /**
    * Items alignment values.
    */
    export enum ItemsAlignment {
        start,
        center,
        end,
        stretch
    }

    /**
     * Content flow orientation.
     */
    export enum Flow {
        horizontal,
        vertical
    }

    /**
     * Scroll bar options.
     */
    export enum ScrollBar {
        none,
        horizontal,
        vertical,
        both
    }
} 