﻿module xp.UI {
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
    Tags['Label'] = Label;
} 