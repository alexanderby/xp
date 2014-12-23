module xp.Ui {
    /**
     * Text input.
     */
    export class TextBox extends Element {

        //----
        // DOM
        //----

        protected getTemplate(): JQuery {
            var template = $('<input class="textbox" type="text"></input>');
            //template.attr('tabindex', TabIndex++);
            return template;
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
            this.onRemove.addHandler(() => this.onTextChanged.removeAllHandlers(), this);

            // On text input
            this.domElement.on('change', (e) => {
                this.onInput('text', this.value);
            });
            this.domElement.on('input', (e) => {
                if (this.notifyOnKeyDown) {
                    this.onInput('text', this.value);
                }
            });

            //// Remove focus on 'Enter' key press
            //this.domElement.on('keypress', (e) => {
            //    if (e.keyCode === 13) {
            //        (<any>document.activeElement).blur();
            //    }
            //});
        }

        //protected isValid(value) {
        //    switch (this.type) {
        //        case TextBoxType.string:
        //            return true;
        //        case TextBoxType.number:
        //            return !!(<string>value.toString()).match(/^\d+\.{0,1}\d*?$/);
        //        default:
        //            throw new Error('TextBoxType value is not implemented.');
        //    }
        //}


        //-----------
        // PROPERTIES
        //-----------

        protected setDefaults() {
            super.setDefaults();
            this.type = TextBoxType.string;
            this.readonly = false;
            this.placeholder = '';
        }

        /**
         * Returns the value of the text box according to it's type.
         */
        get value(): any {
            switch (this.type) {
                case TextBoxType.string:
                    return this.domElement.val();
                case TextBoxType.number:
                    return parseFloat(this.domElement.val()) || 0;
                default:
                    throw new Error('TextBoxType value is not implemented.');
            }
        }

        /**
         * Gets or sets text.
         */
        get text() {
            return this._text;
        }
        set text(text) {
            //if (text) text = text.toString();
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
         * Gets or sets value, indicating whether text box is readonly.
         */
        get readonly() {
            return this._readonly;
        }
        set readonly(readonly) {
            this._readonly = readonly;

            // DOM
            if (readonly) {
                this.domElement.attr('readonly', 'true');
            }
            else {
                this.domElement.removeAttr('readonly');
            }
        }
        protected _readonly: boolean;

        /**
         * Gets or sets text placeholder.
         */
        get placeholder() {
            return this._placeholder;
        }
        set placeholder(placeholder) {
            this._placeholder = placeholder;

            // DOM
            if (placeholder) {
                this.domElement.attr('placeholder', placeholder);
            }
            else {
                this.domElement.removeAttr('placeholder');
            }
        }
        protected _placeholder: string;

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
                },
                'readonly': {
                    'true': () => this.readonly = true,
                    'false': () => this.readonly = false
                },
                'placeholder': {
                    '*': (value) => this.placeholder = value
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