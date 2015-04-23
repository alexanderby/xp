module xp.UI {
    /**
     * UI container.
     */
    export /*abstract*/ class Container extends Element {

        /**
         * Initializes UI container.
         */
        protected initElement() {
            this.domElement = this.getTemplate();
            this.initEvents();
            this.initContent();
            this.setDefaults();
            this.applyInitializers();
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
        protected getContainerElement(): HTMLElement {
            return this.domElement;
        }

        /*internal*/ __setRenderedState__(rendered) {
            this.__isRendered__ = rendered;
            this.children && this.children.forEach((ch) => {
                ch.__setRenderedState__(rendered);
            });
            if (rendered && this.onRendered)
                this.onRendered.invoke(this);
        }


        //-----------
        // PROPERTIES
        //-----------

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
            this.children.forEach((c) => {
                if (value) {
                    c.scope = c.scope;
                }
                else {
                    c.enabled = false;
                }
            });
        }

        /**
         * Gets or sets padding of the element (using CSS syntax).
         */
        get padding() {
            return this._padding;
        }
        set padding(padding: string) {
            this._padding = padding;

            // DOM
            this.domElement.style.padding = padding;
        }
        private _padding: string;


        //----------
        // RELATIONS
        //----------

        /**
         * Children.
         * WARNING: Must be set only by itself.
         */
        children: Element[]; // TODO: ObservableCollection?

        /**
         * Adds an element at container's end.
         * @param element Element to append.
         */
        append(element: Element) {
            this.insert(element, this.children.length);
        }

        /**
         * Adds an element at container's beginning.
         * @param element Element to prepend.
         */
        prepend(element: Element) {
            this.insert(element, 0);
        }

        /**
         * Inserts element at index.
         * @param element Element to prepend.
         * @param index Index to insert at.
         */
        insert(element: Element, index: number) {

            if (element.parent === this && this.children.indexOf(element) == index) {
                // Don't do anything.
                return;
            }

            if (index > this.children.length) {
                throw new Error('Index was out or range.');
            }

            var container = this.getContainerElement();

            if (element.parent === this) {
                var from = this.children.indexOf(element);

                // DOM
                var target = from < index ? index + 1 : index;
                if (target === this.children.length) {
                    container.appendChild(element.domElement);
                }
                else {
                    container.insertBefore(element.domElement, container.children.item(target));
                }

                this.children.move(from, index);
            }
            else {
                if (element.parent)
                    element.parent.detachChild(element);

                // DOM
                if (index === this.children.length) {
                    container.appendChild(element.domElement);
                }
                else {
                    container.insertBefore(element.domElement, container.children.item(index));
                }

                this.children.splice(index, 0, element);
                element.parent = this;
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
            Dom.remove(child.domElement);
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
         * Searches for the first element with given name, key or selector.
         * @param selector Element's selector (e.g. "#name", ".key" "ClassName").
         */
        find(selector: string): Element {
            if (selector[0] === '#') {
                var name = selector.substring(1);
                return this.cascadeBy((e) => e.name === name);
            }
            else if (selector[0] === '.') {
                var key = selector.substring(1);
                return this.cascadeBy((e) => e.key === key);
            }
            else {
                var className = selector.toLowerCase();
                return this.cascadeBy((e) => xp.getClassName(e).toLowerCase() === className);
            }
        }

        /**
         * Searches for all element with given name, key or selector.
         * @param selector Elements' selector (e.g. "#name", ".key" "ClassName").
         */
        findAll(selector: string): Element[] {
            var results: Element[] = [];
            if (selector[0] === '#') {
                var name = selector.substring(1);
                this.cascadeBy((e) => {
                    if (e.name === name) {
                        results.push(e);
                    }
                });
            }
            else if (selector[0] === '.') {
                var key = selector.substring(1);
                this.cascadeBy((e) => {
                    if (e.key === key) {
                        results.push(e);
                    }
                });
            }
            else {
                var className = selector.toLowerCase();
                this.cascadeBy((e) => {
                    if (xp.getClassName(e).toLowerCase() === className) {
                        results.push(e);
                    }
                });
            }
            return results;
        }

        /**
         * Removes element.
         */
        remove() {
            // Remove children
            this.removeChildren();

            // Remove itself
            super.remove();
        }

        /**
         * Removes container's chlldren.
         */
        removeChildren() {
            for (var i = this.children.length - 1; i >= 0; i--) {
                this.children[i].remove();
            }
            this.children = [];
        }
    }


    //---------------
    // MARKUP PARSING
    //---------------

    /**
     * Containers markup parser base.
     */
    export class ContainerMarkupParser<T extends Container> extends ElementMarkupParser<Container>{
        /**
         * Returns function which initializes control
         * according to provider markup.
         * @param markup Element's markup.
         */
        getInitializer(markup: gElement): UIInitializer<T> {
            var initAttributes = this.getAttributesInitializer(markup);
            var initContent = this.getContentInitializer(markup);
            return (el) => {
                initAttributes(el);
                initContent(el);
            };
        }

        /**
         * Returns function whilch initializes control
         * according to provided children of root element.
         * @param markup Element's markup.
         */
        protected getContentInitializer(markup: gElement): UIInitializer<T> {
            var actions: UIInitializer<Container>[] = [];

            // Create children
            Array.prototype.forEach.call(markup.childNodes,(childXmlNode: gElement) => {
                if (childXmlNode.nodeType === 1) {
                    // Create child
                    var tagName = childXmlNode.nodeName;
                    if (!xp.UI.MarkupParseInfo[tagName]) {
                        throw new Error('Tags dictionary has no matches for tag "' + tagName + '".');
                    }

                    var create = xp.UI.getElementCreator(childXmlNode);

                    actions.push((el) => {
                        var child = create();
                        el.append(child);
                    });
                }
            });

            return (el) => actions.forEach((init) => init(el));
        }

        /**
         * Returns markup attributes mapping to control's properties.
         */
        protected getAttributeMap(): AttributeMap<T> {
            return extendAttributeMap(super.getAttributeMap(), {
                //'enabled': {
                //    'true': () => (el: Container) => el.cascadeBy((e) => e.enabled = true),
                //    'false': () => (el: Container) => el.cascadeBy((e) => e.enabled = true)
                //},
                'padding': {
                    '*': (padding) => (el: Container) => el.padding = padding
                }
            });
        }
    }
} 