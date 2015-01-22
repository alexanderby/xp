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
                alert('checkchange: ' + args.checked + '; selected: ' + this.selectedItem);
                if (args.checked) {
                    console.info('Radiobutton: init selected item change');
                    this.onInput('selectedItem', this.item);
                }
            }, this);

            this.onMouseUp.addHandler((args) => { // WARNING: Click fires twice!
                alert('mouseup');
                if (!this.readonly && this.checked === true) {
                    alert('uncheck');
                    // Uncheck
                    this.onInput('checked', false);
                    alert('inputed checked');
                    this.onInput('selectedItem', {});
                    alert('inputed selectedItem');
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
        private _group: string;

        /**
         * Gets or sets data item that is related to this control.
         * If item equals the context, than this control will be checked.
         */
        get item() {
            return this._item;
        }
        set item(item) {
            this._item = item;
            if (this.checked != (item === this.selectedItem))
                this.checked = item === this.selectedItem;
        }
        private _item: any;

        /**
         * Gets or sets selected item.
         * If item equals to the related item, than this control will be checked.
         */
        get selectedItem() {
            return this._selectedItem;
        }
        set selectedItem(item) {
            this._selectedItem = item;
            if (this.checked != (item === this.item))
                this.checked = item === this.item;
        }
        private _selectedItem: any;

        ///**
        // * Gets or sets value indicating if radio button may behave like a check box.
        // */
        //uncheckable: boolean;
    }
    Controls['RadioButton'] = RadioButton;


    //------------------
    // MARKUP PROCESSING
    //------------------

    export class RadioButtonMarkupProcessor extends CheckBoxMarkupProcessor {
        protected getAttributeMap(): AttributeMap<RadioButton> {
            return extendAttributeMap(super.getAttributeMap(), {
                'group': {
                    '*': (value) => (el: RadioButton) => el.group = value
                },
                //'uncheckable': {
                //    'true': () => (el: RadioButton) => el.uncheckable = true,
                //    'false': () => (el: RadioButton) => el.uncheckable = false
                //},
                'item': {}, // Binding only
                'selectedItem': {} // Binding only
            });
        }
    }
    Processors['RadioButton'] = new RadioButtonMarkupProcessor();
} 