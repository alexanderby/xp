module xp {
    export interface RadioButtonMarkup<T extends RadioButton> extends CheckBoxMarkup<T> {
        group?: string;
        item?: any|string;
        selectedItem?: any|string;
    }

    /**
     * Radio button.
     */
    export class RadioButton extends CheckBox {
        group: string;
        item: any;
        selectedItem: any;

        constructor(markup: RadioButtonMarkup<RadioButton>) {
            super(markup);
        }

        //----
        // DOM
        //----

        protected getTemplate(): HTMLElement {
            return Dom.create(`
                <label class="RadioButton">
                    <input type="radio"/>
                    <span class="check"></span>
                    <label class="text"></label>
                </label>`, {
                    'input': (el) => this.checkElement = el,
                    '.text': (el) => this.textElement = el
                });
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

        protected defineProperties() {
            super.defineProperties();
            this.defineProperty('group', {
                getter: () => this.checkElement.name,
                setter: (value) => this.checkElement.name = value
            });
            this.defineProperty('item', {
                setter: (item) => {
                    if (this.checked != (item == this.selectedItem)) {
                        this.checked = item == this.selectedItem;
                    }
                },
                observable: true
            });
            this.defineProperty('selectedItem', {
                setter: (item) => {
                    if (this.checked != (item == this.item)) {
                        this.checked = item == this.item;
                    }
                },
                observable: true
            });
        }

        ///**
        // * Gets or sets value indicating if radio button may behave like a check box.
        // */
        //uncheckable: boolean;
    }
} 