﻿module xp.UI {
    /**
     * List container.
     */
    export class List extends Stack {

        //----
        // DOM
        //----

        protected getTemplate(): JQuery {
            return $('<div class="list stack"><div class="content"></div></div>');
        }

        //------------------
        // MARKUP PROCESSING
        //------------------

        protected getAttributeMap(): AttributeMap {
            return xp.extendObject(super.getAttributeMap(), {
                'items': {}, // Parse JSON ?
                'itemId': {
                    '*': (id) => this.itemId = id
                }
            });
        }


        protected processMarkup(xmlElement: JQuery) {
            this.applyAttributes(xmlElement);

            //
            // Create template

            if (xmlElement.children().length !== 1) {
                throw new Error('List control must have ONE item template.');
            }

            var childXmlNode = xmlElement.children().get(0);
            this.itemTemplateXml = childXmlNode;

            // TODO: Ability to set template from code.

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
                                // Remove replacement handler
                                var found = this.itemReplacementHandlers.filter((h) => h.item === args.oldItem)[0];
                                found.holder.onPropertyChanged.removeHandler(found.handler);
                                this.itemReplacementHandlers.splice(this.itemReplacementHandlers.indexOf(found), 1);

                                this.children[args.oldIndex].remove();
                                break;
                            case Binding.CollectionChangeAction.set:
                                (<xp.Binding.Scope>this.children[args.newIndex].scope).set(this.itemId, args.newItem);
                                break;
                            case Binding.CollectionChangeAction.reset:
                                this.items = items;
                                break;
                            default:
                                throw new Error('Not implemented.');
                        }
                    }, this);
                }
                if (Binding.isNotifier(items)) {
                    var itemsLengthChangeHandler = (prop: string) => {
                        if (prop === 'length') {
                            if (this.items.length > 0) {
                                this.domElement.show();
                            }
                            else {
                                this.domElement.hide();
                            }
                        }
                    };
                    this.itemsRegistar.subscribe((<Binding.INotifier><any>items).onPropertyChanged, itemsLengthChangeHandler, this);
                    // Handle length for the first time
                    itemsLengthChangeHandler('length');
                }
            }
        }
        protected _items: any[];
        protected itemsRegistar: EventRegistar;

        /**
         * Gets or sets list-item identifier for item's scope.
         */
        itemId: string;


        //-------
        // EVENTS
        //-------

        protected initEvents() {
            super.initEvents();
            this.itemsRegistar = new EventRegistar();
        }


        //----------
        // RELATIONS
        //----------

        // TODO: Ability to set template from code (apply
        // markup not in constructor, but separately by
        // returning and applying initializer).

        ///**
        // * Gets or sets list item template.
        // */
        //itemTemplate: Element;

        protected itemTemplateXml: HTMLElement;

        protected addItem(index: number, item) {
            // Create child
            var tagName = this.itemTemplateXml.nodeName;
            if (!xp.UI.Tags[tagName]) {
                throw new Error('Tags dictionary has no matches for tag "' + tagName + '".');
            }
            var type = xp.UI.Tags[tagName];
            var child = new type($(this.itemTemplateXml));
            child.name = xp.createUuid();
            child.useParentScope = false;

            // Append child
            this.insertElement(child, index);

            // Set child's scope
            child.scope = this.createItemScopeFrom(item);
        }

        protected createItemScopeFrom(item: any): xp.Binding.Scope {
            // Create item scope
            var obj = {};
            obj[this.itemId] = item;
            var scope = new xp.Binding.Scope(obj, this.scope);

            // Handle item replacement inside other scope
            var holder = <xp.Binding.INotifier>scope.get('');
            var handler = (prop) => {
                if (prop === this.itemId) {
                    var index = this.items.indexOf(item);
                    this.items[index] = holder[prop];
                }
            };
            holder.onPropertyChanged.addHandler(handler, this);

            this.itemReplacementHandlers.push({
                item: item,
                holder: holder,
                handler: handler
            });

            return scope;
        }

        protected itemReplacementHandlers: ItemHandlerUnion[] = [];
    }
    Tags['List'] = List;


    interface ItemHandlerUnion {
        item: any;
        holder: xp.Binding.INotifier;
        handler: (propName: string) => void;
    }
}