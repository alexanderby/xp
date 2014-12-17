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
                    this.onInput('text', this.domElement.val());
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
         * If enabled, listeners will be notified of changes on every input key is down.
         */
        notifyOnKeyDown;


        //------------------
        // ATTRIBUTE MAPPING
        //------------------

        protected getAttributeMap(): AttributeMap {
            return xp.extendObject(super.getAttributeMap(), {
                'text': {
                    '*': (value) => this.text = value
                },
                'notify-on-keydown': {
                    'true': () => this.notifyOnKeyDown = true,
                    'false': () => this.notifyOnKeyDown = false
                }
            });
        }
    }
    Tags['textbox'] = TextBox;


    export interface TextChangeArgs {
        oldValue: string;
        newValue: string;
    }

} 