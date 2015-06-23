module xp {

    export interface ContainerMarkup<T extends Container> extends ElementMarkup<T> {
        padding?: string;
    }

    /**
     * UI container.
     */
    export /*abstract*/ class Container extends Element {
        padding: string;

        constructor(markup?: ContainerMarkup<Container>, children?: Element[]) {
            super(markup);
            children && children.forEach((c) => this.append(c));

            // Set named children
            if (true/*Object.getPrototypeOf(this).constructor.isView*/) {
                //
                // TODO: Prevent name collision and unnecessary named children properties set.
                // Maybe use TypeScript 1.5 metadata.
                //
                // Maybe no need in setting names cause variables can be set from markup: { init: (tb) => this.textBox = tb }
                this.cascadeBy((el) => {
                    if (el !== this && el.name) {
                        if (el.name in this) {
                            throw new Error(xp.formatString('Unable to set named child "{0}". Container\'s property is already defined.', el.name));
                        }
                        this[el.name] = el;
                    }
                });
            }
        }

        /**
         * Initializes UI container.
         */
        protected initElement() {
            this.children = [];
            super.initElement();
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

        protected defineProperties() {
            super.defineProperties();
            this.defineProperty('padding', {
                setter: (value) => this.domElement.style.padding = value,
                getter: () => this.domElement.style.padding
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
                element.__setParent__(this);
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
            child.__setParent__(null);

            // DOM
            Dom.remove(child.domElement);
        }

        /**
         * Cascades through all child elements invoking a function.
         * Stops when function returns 'truthy' value.
         * @param fn Function to execute on each element.
         * @param checkRoot Specifies whether to process root element.
         * @returns Element which lead to returning 'truthy' value.
         */
        cascadeBy(fn: (el: Element) => any, checkRoot = false): Element {
            if (checkRoot && !!fn(this) === true) {
                return this;
            }
            else {
                for (var i = 0; i < this.children.length; i++) {
                    if (!!fn(this.children[i]) === true) {
                        return this.children[i];
                    }
                    else {
                        if (this.children[i] instanceof Container) {
                            var result = (<Container>this.children[i]).cascadeBy(fn, false);
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
         * Searches for the first matched.
         * @param predicate Predicate.
         */
        find(predicate: (el: Element) => boolean): Element {
            return this.cascadeBy((el) => predicate(el));
        }

        /**
         * Searches for all element with given name, key or selector.
         * @param predicate Predicate.
         */
        findAll(predicate: (el: Element) => boolean): Element[] {
            var results: Element[] = [];
            this.cascadeBy((el) => {
                if (predicate(el)) {
                    results.push(el);
                }
            });
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
} 