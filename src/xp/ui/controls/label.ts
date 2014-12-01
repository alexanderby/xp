module xp.Ui {
    export class Label extends Element {

        //----
        // DOM
        //----

        protected getTemplate(): JQuery {
            var template = $('<span class="label"><span class="text"></span></span>');
            this.textElement = template.find('.text');
            return template;
            //return $('<span class="label"><span class="text"></span></span>');
        }

        protected textElement: JQuery;


        //------------------
        // GETTERS / SETTERS
        //------------------

        /**
         * Gets or sets button's text.
         */
        get text() {
            return this._text;
        }
        set text(text) {
            this._text = text;

            // DOM
            this.textElement.text(text);
        }
        protected _text: string;


        //------------------
        // ATTRIBUTE MAPPING
        //------------------

        /**
        * Defines the way of setting control's properties through the XML attributes.
        */
        protected getAttributeMap(): AttributeMap {
            return xp.extendObject(super.getAttributeMap(), {
                'text': {
                    '*': (value) => this.text = value
                },
            });
        }
    }
    Tags['label'] = Label;
} 