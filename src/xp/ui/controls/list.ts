module xp.Ui {
    /**
     * List container.
     */
    export class List extends Stack {

        //----
        // DOM
        //----

        protected getTemplate(): JQuery {
            return $('<div class="view stack"><div class="content"></div></div>');
        }

        //------------------
        // MARKUP PROCESSING
        //------------------

        protected getAttributeMap(): AttributeMap {
            return xp.extendObject(super.getAttributeMap(), {
                'items': {
                    '*': (value) => this.items = value
                }
            });
        }


        protected processXml(xmlElement: JQuery) {
            this.applyAttributes(xmlElement);

            //
            // Create template

            if (xmlElement.children().length !== 1) {
                throw new Error('List control must have ONE item template.');
            }

            var childXmlNode = xmlElement.children().get(0);
            this.itemTemplateXml = childXmlNode;
            //var tagName = childXmlNode.nodeName.toLowerCase();
            //if (!xp.Ui.Tags[tagName]) {
            //    throw new Error('Tags dictionary has no mathes for tag "' + tagName + '".');
            //}
            //var type = xp.Ui.Tags[tagName];
            //this.itemTemplate = new type($(childXmlNode));
        }


        //-----------
        // PROPERTIES
        //-----------

        /**
         * Gets or sets items collection.
         */
        get items() {
            return this._items;
        }
        set items(items) {
            this._items = items;

            // Remove current children
            this.children.forEach((c) => {
                c.remove();
            });
            this.itemsRegistar.unsubscribeAll();

            if (items) {
                // Create new children
                items.forEach((item, i) => {
                    this.addItem(i, item);
                });

                // Subscribe for changes
                if (Binding.isCollectionNotifier(items)) {
                    var collection = <Binding.ICollectionNotifier><any>items;
                    this.itemsRegistar.subscribe(collection.onCollectionChanged, (args) => {
                        switch (args.action) {
                            case Binding.CollectionChangeAction.add:
                                this.addItem(args.newIndex, args.newItem);
                                break;
                            case Binding.CollectionChangeAction.remove:
                                this.children[args.oldIndex].remove();
                                break;
                            case Binding.CollectionChangeAction.set:
                                this.childContextChangeToken = true;
                                this.children[args.newIndex].context = args.newItem;
                                this.childContextChangeToken = false;
                                break;
                            case Binding.CollectionChangeAction.reset:
                                this.items = items;
                                break;
                            default:
                                throw new Error('Not implemented.');
                        }
                    }, this);
                }
            }
        }
        protected _items: any[];
        protected itemsRegistar: EventRegistar;
        protected childContextChangeToken = false; // Prevents cycling when set context

        protected initEvents() {
            super.initEvents();
            this.itemsRegistar = new EventRegistar();
        }


        //----------
        // RELATIONS
        //----------

        ///**
        // * Gets or sets list item template.
        // */
        //itemTemplate: Element;

        protected itemTemplateXml: HTMLElement;

        protected addItem(index: number, item) {
            // Create child
            var tagName = this.itemTemplateXml.nodeName.toLowerCase();
            if (!xp.Ui.Tags[tagName]) {
                throw new Error('Tags dictionary has no mathes for tag "' + tagName + '".');
            }
            var type = xp.Ui.Tags[tagName];
            var child = new type($(this.itemTemplateXml));
            child.name = xp.createUuid();
            child.useParentContext = false;

            // Append child
            this.insertElement(child, index);

            // Bind child by index
            this.childContextChangeToken = true;
            child.context = item;
            this.childContextChangeToken = false;

            // Subscribe for replacement
            // TODO: Unsubscribe?
            child.onContextChanged.addHandler((ctx) => {
                if (!this.childContextChangeToken) {
                    var i = this.children.indexOf(child);
                    this.items[i] = ctx;
                }
            }, this);
        }
    }
    Tags['list'] = List;
}