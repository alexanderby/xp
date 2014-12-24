module xp.UI {
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
            this.initEvents();
            this.initContent();
            this.setDefaults();
            if (xmlElement) {
                this.processXml(xmlElement);
            }
            this.setNamedChildren();
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
        // MARKUP PROCESSING
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
                if (!xp.UI.Tags[tagName]) {
                    throw new Error('Tags dictionary has no mathes for tag "' + tagName + '".');
                }
                var type = xp.UI.Tags[tagName];
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
         * WARNING: Must be set only by itself.
         */
        children: Element[]; // TODO: ObservableCollection?

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
            console.log(xp.formatString('Appended {0}:{1} to {2}:{3}', xp.getClassName(element), element.name || '-', xp.getClassName(this), this.name || '-'));
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
         * Searches for the first element with given name, key or selector.
         * @param selector Element's selector (e.g. "#name", ".key" "ClassName").
         */
        findElement(selector: string): Element {
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
        findElements(selector: string): Element[] {
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
        protected setNamedChildren() {
            this.cascadeBy((el) => {
                if (el.name) {
                    if (this[el.name] !== void 0) {
                        //throw new Error(xp.formatString('{0}:{1}: The name "{2}" conflicts with container\'s property.', xp.getClassName(this), this.name || '-', el.name));
                    }
                    this[el.name] = el;
                }
                return false;
            });
        }
    }
} 