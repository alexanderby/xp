﻿module xp.Ui {
    /**
     * Text input.
     */
    export class TextBox extends Element {

        //----
        // DOM
        //----

        protected getTemplate(): JQuery {
            return $('<input class="textbox" type="text"></input>');
        }


        //-------
        // EVENTS
        //-------

        onTextChanged = new Event<{ oldValue: string; newValue: string }>();

        protected initEvents() {
            super.initEvents();

            // On text input
            this.domElement.on('change', (e) => {
                this.onInput('text', this.domElement.val());
            });
        }


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
            this.domElement.val(text);
        }
        protected _text: string;


        //------------------
        // ATTRIBUTE MAPPING
        //------------------

        protected getAttributeMap(): AttributeMap {
            return xp.extendObject(super.getAttributeMap(), {
                'text': {
                    '*': (value) => this.text = value
                },
            });
        }
    }
    Tags['textbox'] = TextBox;
} 