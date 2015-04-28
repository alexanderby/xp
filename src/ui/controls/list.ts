module xp.ui {
    export interface ListMarkup extends VBoxMarkup {
        items?: any[];
        itemId?: string;
        itemCreator?: () => Element
    }

    /**
     * List container.
     */
    export class List extends VBox {
        items: any[];
        itemId: string;
        itemCreator: () => Element;

        constructor(markup?: ListMarkup) {
            super(markup);
        }

        //----
        // DOM
        //----

        protected getTemplate(): HTMLElement {
            return Dom.create('<div class="List VBox"></div>');
        }


        //-----------
        // PROPERTIES
        //-----------

        protected setDefaults() {
            super.setDefaults();
            this.itemId = 'item';
        }

        protected defineProperties() {
            super.defineProperties();
            this.defineProperty('items', {
                setter: (items: any[]) => {
                    // Remove current children
                    this.removeReplacementHandlers();
                    this.removeChildren();
                    this.itemsRegistar.unsubscribeAll();

                    if (items && this.itemCreator) {
                        // Create new children
                        items.forEach((item, i) => {
                            this.addItem(i, item);
                        });

                        // Subscribe for changes
                        if (isCollectionNotifier(items)) {
                            var collection = <CollectionNotifier<any>><any>items;
                            this.itemsRegistar.subscribe(collection.onCollectionChanged,(args) => {
                                switch (args.action) {
                                    case CollectionChangeAction.Attach:
                                    case CollectionChangeAction.Create:
                                        this.addItem(args.newIndex, args.newItem);
                                        break;

                                    case CollectionChangeAction.Detach:
                                    case CollectionChangeAction.Delete:
                                        // Remove replacement handler
                                        var found = this.itemReplacementHandlers.filter((h) => h.item === args.oldItem)[0];
                                        found.holder.onPropertyChanged.removeHandler(found.handler);
                                        this.itemReplacementHandlers.splice(this.itemReplacementHandlers.indexOf(found), 1);

                                        this.children[args.oldIndex].remove();
                                        break;

                                    case CollectionChangeAction.Replace:
                                        if (!this.itemReplacementToken) {
                                            this.children[args.newIndex].scope[this.itemId] = args.newItem;
                                        }
                                        break;

                                    case CollectionChangeAction.Move:
                                        this.insert(this.children[args.oldIndex], args.newIndex);
                                        break;

                                    default:
                                        throw new Error('Not implemented.');
                                }
                            }, this);
                        }
                        if (isNotifier(items)) {
                            var itemsLengthChangeHandler = (prop: string) => {
                                //if (prop === 'length') {
                                //    // Hide or show control
                                //    if (this.items.length > 0) {
                                //        this.domElement.show();
                                //    }
                                //    else {
                                //        this.domElement.hide();
                                //    }
                                //}
                            };
                            this.itemsRegistar.subscribe((<Notifier><any>items).onPropertyChanged, itemsLengthChangeHandler, this);
                            // Handle length for the first time
                            itemsLengthChangeHandler('length');
                        }
                    }
                }
            });
            this.defineProperty('itemCreator', {
                // Re-create items
                setter: () => this.items = this.items
            });
        }


        //-------
        // EVENTS
        //-------

        protected initEvents() {
            super.initEvents();
            this.itemsRegistar = new EventRegistrar();
        }


        //----------
        // RELATIONS
        //----------

        private itemsRegistar: EventRegistrar;

        protected addItem(index: number, item) {
            // Create child
            var child = this.itemCreator();
            child.name = xp.createUuid();
            child.useParentScope = false;

            // Append child
            this.insert(child, index);

            // Set child's scope
            child.scope = this.createItemScopeFrom(item);
        }

        private createItemScopeFrom(item: any): xp.Scope {
            //
            // Create item scope

            var obj = {};
            obj[this.itemId] = item;
            var scope = new xp.Scope(xp.observable(obj), this.scope);

            //
            // Handle item replacement inside item-element scope

            var hr: ItemReplacementInfo = {
                item: item,
                handler: (prop) => {
                    if (prop === this.itemId) {
                        var index = this.items.indexOf(hr.item);
                        if (index < 0) {
                            throw new Error('Item does not belong to List items.');
                        }
                        this.itemReplacementToken = true;
                        this.items[index] = hr.holder[prop];
                        this.itemReplacementToken = false;

                        hr.item = hr.holder[prop];
                    }
                },
                holder: scope
            };

            hr.holder.onPropertyChanged.addHandler(hr.handler, this);

            this.itemReplacementHandlers.push(hr);

            return scope;
        }

        private itemReplacementToken = false;
        private itemReplacementHandlers: ItemReplacementInfo[] = [];

        /**
         * Removes element.
         */
        remove() {
            // Remove replacement handlers
            this.removeReplacementHandlers();

            // Remove itself
            super.remove();
        }

        protected removeReplacementHandlers() {
            this.itemReplacementHandlers.forEach((hr) => {
                hr.holder.onPropertyChanged.removeHandler(hr.handler);
            });
            this.itemReplacementHandlers = [];
        }
    }


    interface ItemReplacementInfo {
        item: any;
        holder: xp.Notifier;
        handler: (propName: string) => void;
    }
}