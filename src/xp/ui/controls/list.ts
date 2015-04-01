module xp.UI {
    /**
     * List container.
     */
    export class List extends VBox {

        //----
        // DOM
        //----

        protected getTemplate(): JQuery {
            //return $('<div class="List VBox"><div class="content"></div></div>');
            return $('<div class="List VBox"></div>');
        }


        //-----------
        // PROPERTIES
        //-----------

        protected setDefaults() {
            super.setDefaults();
            this.itemId = 'item';
        }

        /**
         * Gets or sets items collection.
         */
        get items() {
            return this._items;
        }
        set items(items) {
            this._items = items;

            // Remove current children
            this.removeReplacementHandlers();
            this.removeChildren();
            this.itemsRegistar.unsubscribeAll();

            if (items) {
                // Create new children
                items.forEach((item, i) => {
                    this.addItem(i, item);
                });

                // Subscribe for changes
                if (isCollectionNotifier(items)) {
                    var collection = <ICollectionNotifier><any>items;
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
                    this.itemsRegistar.subscribe((<INotifier><any>items).onPropertyChanged, itemsLengthChangeHandler, this);
                    // Handle length for the first time
                    itemsLengthChangeHandler('length');
                }
            }
        }
        private _items: any[];
        private itemsRegistar: EventRegistrar;

        /**
         * Gets or sets list-item identifier for item's scope.
         */
        itemId: string;


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

        /**
         * Gets or sets list item creator function.
         */
        itemCreator: () => Element;

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
        holder: xp.INotifier;
        handler: (propName: string) => void;
    }


    //---------------
    // MARKUP PARSING
    //---------------

    export class ListMarkupParser extends VBoxMarkupParser<List>{

        getInitializer(markup: JQuery): UIInitializer<List> {
            var initAttributes = this.getAttributesInitializer(markup);
            var initTemplate = this.getTemplateInitializer(markup);
            return (el) => {
                initAttributes(el);
                initTemplate(el);
            };
        }

        protected getTemplateInitializer(markup: JQuery): UIInitializer<List> {
            if (markup.children().length !== 1) {
                throw new Error('List control must have ONE item template.');
            }

            var childXmlNode = markup.children().get(0);
            var create = xp.UI.getElementCreator($(childXmlNode));

            return (el) => el.itemCreator = create;
        }

        protected getAttributeMap(): AttributeMap<List> {
            return extendAttributeMap(super.getAttributeMap(), {
                'items': {}, // Parse JSON ?
                'itemId': {
                    '*': (id) => (el: List) => el.itemId = id
                }
            });
        }
    }

    MarkupParseInfo['List'] = {
        ctor: List,
        parser: new ListMarkupParser()
    };
}