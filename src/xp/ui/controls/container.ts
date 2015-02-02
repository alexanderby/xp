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

        /*internal*/ setRenderedState(rendered) {
            this.isRendered = rendered;
            this.children.forEach((ch) => {
                ch.setRenderedState(rendered);
            });
            if (rendered)
                this.onRendered.invoke(this);
        }


        //-----------
        // PROPERTIES
        //-----------

        /**
         * Gets or sets padding of the element (using CSS syntax).
         */
        get padding() {
            return this._padding;
        }
        set padding(padding: string) {
            this._padding = padding;

            // DOM
            this.domElement.css('padding', padding);
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
            if (element.parent) {
                element.parent.detachChild(element);
            }
            this.children.push(element);
            element.parent = this;

            // DOM
            this.getContainerElement().append(element.domElement);
            console.log(xp.formatString('Appended {0}:{1} to {2}:{3}', xp.getClassName(element), element.name || '-', xp.getClassName(this), this.name || '-'));
        }

        /**
         * Adds an element at container's beginning.
         * @param element Element to prepend.
         */
        prepend(element: Element) {
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
        insert(element: Element, index: number) {
            if (element.parent === this && this.children.indexOf(element) == index) {
                // Don't do anything.
            }
            else {
                var target = this.children[index];
                if (!target) {
                    // Append at end
                    this.append(element);
                }
                else {
                    var targetIndex = (element.parent === this && this.children.indexOf(element) < index) ?
                        index - 1
                        : index;
                    if (element.parent) {
                        element.parent.detachChild(element);
                    }
                    this.children.splice(targetIndex, 0, element);
                    element.parent = this;

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
            child.domElement.detach();
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
         * Sets named children to control's properties.
         */
        setNamedChildren() {
            this.cascadeBy((el) => {
                if (el.name) {
                    if (el.name in this && el !== this[el.name]) {
                        throw new Error(xp.formatString('{0}#{1}: The name "{2}" conflicts with container\'s property.', xp.getClassName(this), this.name || '-', el.name));
                    }
                    this[el.name] = el;
                }
                if (el instanceof View) {
                    // Stop on <View>
                    return true;
                }
                else {
                    return false;
                }
            });
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

        protected removeChildren() {
            for (var i = this.children.length - 1; i >= 0; i--) {
                this.children[i].remove();
            }
            this.children = [];
        }
    }


    //------------------
    // MARKUP PROCESSING
    //------------------

    /**
     * Containers markup processor base.
     */
    export class ContainerMarkupProcessor<T extends Container> extends ElementMarkupProcessor<Container>{
        /**
         * Returns function which initializes control
         * according to provider markup.
         * @param markup Element's markup.
         */
        getInitializer(markup: JQuery): UIInitializer<T> {
            var initAttributes = this.getAttributesInitializer(markup);
            var initContent = this.getContentInitializer(markup);
            return (el) => {
                initAttributes(el);
                initContent(el);
                el.setNamedChildren(); // Where to place?
                el.onMarkupProcessed.invoke(el);
            };
        }

        /**
         * Returns function whilch initializes control
         * according to provided children of root element.
         * @param markup Element's markup.
         */
        protected getContentInitializer(markup: JQuery): UIInitializer<T> {
            var actions: UIInitializer<Container>[] = [];

            // Create children
            $.each(markup.children(),(i, childXmlNode) => {
                // Create child
                var tagName = childXmlNode.nodeName;
                if (!xp.UI.Controls[tagName]) {
                    throw new Error('Tags dictionary has no matches for tag "' + tagName + '".');
                }

                var create = xp.UI.getElementCreator($(childXmlNode));

                actions.push((el) => {
                    var child = create();
                    el.append(child);
                });

            });

            return (el) => actions.forEach((init) => init(el));
        }

        /**
         * Returns markup attributes mapping to control's properties.
         */
        protected getAttributeMap(): AttributeMap<T> {
            return extendAttributeMap(super.getAttributeMap(), {
                'enabled': {
                    'true': () => (el: Container) => el.cascadeBy((e) => e.enabled = true),
                    'false': () => (el: Container) => el.cascadeBy((e) => e.enabled = true)
                },
                'padding': {
                    '*': (padding) => (el: Container) => el.padding = padding
                }
            });
        }
    }
} 