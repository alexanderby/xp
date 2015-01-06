module xp.UI {
    /**
     * Radio button.
     */
    export class RadioButton extends CheckBox {

        //----
        // DOM
        //----

        protected getTemplate(): JQuery {
            var template = $('<label class="radiobutton"><input type="radio"/><span class="check"></span><label class="text"></label></label>');
            this.checkElement = template.find('input');
            this.textElement = template.find('label');
            return template;
        }


        //-------
        // EVENTS
        //-------

        protected initEvents() {
            super.initEvents();
            this.onCheckChange.addHandler((args) => {
                if (args.checked) {
                    this.onInput('selectedItem', this.context);
                }
            }, this);
        }


        //-----------
        // PROPERTIES
        //-----------

        /**
         * Gets or sets button's text.
         */
        get group() {
            return this._group;
        }
        set group(group) {
            this._group = group;

            // DOM
            this.checkElement.attr('name', group);
        }
        protected _group: string;

        /**
         * Gets or sets selected item.
         * If item equals the context, than this control will be checked.
         */
        get selectedItem() {
            return this._selectedItem;
        }
        set selectedItem(item) {
            this.selectedItem = item;
            if (item === this.context) {
                this.checked = true;
            }
        }
        private _selectedItem: any;


        //------------------
        // MARKUP PROCESSING
        //------------------

        protected getAttributeMap(): AttributeMap {
            return xp.extendObject(super.getAttributeMap(), {
                'group': {
                    '*': (value) => this.group = value
                },
                'selectedItem': {} // Binding only
            });
        }
    }
    Tags['RadioButton'] = RadioButton;
} 