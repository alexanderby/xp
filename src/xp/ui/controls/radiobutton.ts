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


        //------------------
        // MARKUP PROCESSING
        //------------------

        protected getAttributeMap(): AttributeMap {
            return xp.extendObject(super.getAttributeMap(), {
                'group': {
                    '*': (value) => this.group = value
                }
            });
        }
    }
    Tags['RadioButton'] = RadioButton;
} 