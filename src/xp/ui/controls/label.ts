module xp.UI {
    export class Label extends Element {

        //----
        // DOM
        //----

        protected getTemplate(): JQuery {
            //var template = $('<span class="label"><span class="text"></span></span>');
            //this.textElement = template.find('.text');
            //return template;
            return $('<label class="label"></label>');
        }

        protected textElement: JQuery;


        //-----------
        // PROPERTIES
        //-----------

        /**
         * Gets or sets label's text.
         */
        get text() {
            return this._text;
        }
        set text(text) {
            console.log('Set text: ' + text);
            this._text = text;

            // DOM
            //this.textElement.text(text);
            this.domElement.text(text);
        }
        private _text: string;


        //------------------
        // MARKUP PROCESSING
        //------------------

        protected getAttributeMap(): AttributeMap<Label> {
            return extendAttributeMap(super.getAttributeMap(), {
                'text': {
                    '*': (value) => (el: Label) => el.text = value
                }
            });
        }
    }
    Tags['Label'] = Label;
} 