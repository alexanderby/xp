module xp.Ui {
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

        /**
         * Fires when element's text is changed.
         */
        onTextChanged: Event<TextChangeArgs>;

        protected initEvents() {
            super.initEvents();
            this.onTextChanged = new Event<TextChangeArgs>();

            // On text input
            this.domElement.on('change', (e) => {
                this.onInput('text', this.domElement.val());
            });
            this.domElement.on('input', (e) => {
                if (this.notifyOnKeyDown) {
                    var value;
                    switch (this.type) {
                        case TextBoxType.string:
                            value = this.domElement.val();
                            break;
                        case TextBoxType.number:
                            value = parseFloat(this.domElement.val());
                            break;
                    }
                    this.onInput('text', value);
                }
            });

            // Remove focus on 'Enter' key press
            this.domElement.on('keypress', (e) => {
                if (e.keyCode === 13) {
                    (<any>document.activeElement).blur();
                }
            });
        }


        //-----------
        // PROPERTIES
        //-----------

        /**
         * Gets or sets button's text.
         */
        get text() {
            return this._text;
        }
        set text(text) {
            this.onTextChanged.invoke({
                oldValue: this._text,
                newValue: this._text = text
            });

            // DOM
            this.domElement.val(text);
        }
        protected _text: string;

        /**
         * Gets or sets textbox type.
         */
        get type() {
            return this._type;
        }
        set type(type) {
            this._type = type;
        }
        protected _type: TextBoxType;

        /**
         * If enabled, listeners will be notified of changes on every input key is down.
         */
        notifyOnKeyDown;


        //------------------
        // MARKUP PROCESSING
        //------------------

        protected getAttributeMap(): AttributeMap {
            return xp.extendObject(super.getAttributeMap(), {
                'text': {
                    '*': (value) => this.text = value
                },
                'notify-on-keydown': {
                    'true': () => this.notifyOnKeyDown = true,
                    'false': () => this.notifyOnKeyDown = false
                },
                'type': {
                    'string': () => this.type = TextBoxType.string,
                    'number': () => this.type = TextBoxType.number
                }
            });
        }
    }
    Tags['textbox'] = TextBox;


    export interface TextChangeArgs {
        oldValue: string;
        newValue: string;
    }

    export enum TextBoxType {
        string,
        number
    }

} 