﻿module xp.UI {
    /**
     * Radio button.
     */
    export class RadioButton extends CheckBox {

        //----
        // DOM
        //----

        protected getTemplate(): HTMLElement {
            var template = Dom.create('<label class="RadioButton"><input type="radio"/><span class="check"></span><label class="text"></label></label>');
            this.checkElement = <HTMLInputElement>Dom.select('input', template);
            this.textElement = Dom.select('label', template);
            return template;
        }


        //-------
        // EVENTS
        //-------

        protected initEvents() {
            super.initEvents();

            this.onCheckChange.addHandler((args) => {
                if (args.checked) {
                    this.onInput('selectedItem', this.item);
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
            this.checkElement.name = group;
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


    //---------------
    // MARKUP PARSING
    //---------------

    export class RadioButtonMarkupParser extends CheckBoxMarkupParser {
        protected getAttributeMap(): AttributeMap<RadioButton> {
            return extendAttributeMap(super.getAttributeMap(), {
                'group': {
                    '*': (value) => (el: RadioButton) => el.group = value
                },
                //'uncheckable': {
                //    'true': () => (el: RadioButton) => el.uncheckable = true,
                //    'false': () => (el: RadioButton) => el.uncheckable = false
                //},
                'item': {
                    '*': (value) => (el: RadioButton) => el.item = value // Allow string value?
                },
                'selectedItem': {
                    // Binding only //'*': (value) => (el: RadioButton) => el.selectedItem = value // Allow string value?
                }
            });
        }
    }

    MarkupParseInfo['RadioButton'] = {
        ctor: RadioButton,
        parser: new RadioButtonMarkupParser()
    };
} 