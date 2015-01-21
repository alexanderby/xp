module xp.UI {
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
        onTextChange: Event<TextChangeArgs>;

        protected initEvents() {
            super.initEvents();
            this.onTextChange = new Event<TextChangeArgs>();
            this.onRemove.addHandler(() => this.onTextChange.removeAllHandlers(), this);

            var onInput = (e: JQueryEventObject) => {
                var args = <TextChangeArgs>xp.UI.createEventArgs(this, e);
                args.oldText = this.text;
                this.onInput('text', this.value);
                args.newText = this.value.toString();
                this.onTextChange.invoke(args);
            };

            // On text input
            this.domElement.on('change', (e) => {
                onInput(e);
            });
            this.domElement.on('input', (e) => {
                if (this.notifyOnKeyDown) {
                    onInput(e);
                }
            });

            this.domElement.on('keypress', (e) => {
                if (e.keyCode === 13) {
                    onInput(e);
                    // Remove focus on 'Enter' key press
                    //(<any>document.activeElement).blur();
                }
            });
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
            var old = this._text;
            this._text = text;

            // DOM
            this.domElement.val(text);

            //if (text) text = text.toString();
            //this.onTextChanged.invoke({
            //    oldText: old,
            //    newText: text
            //});
        }
        private _text: string;

        /**
         * Gets or sets textbox type.
         */
        get type() {
            return this._type;
        }
        set type(type) {
            this._type = type;
        }
        private _type: TextBoxType;

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
        private _readonly: boolean;

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
        private _placeholder: string;

        /**
         * If enabled, listeners will be notified of changes on every input key is down.
         */
        notifyOnKeyDown;


        //------------------
        // MARKUP PROCESSING
        //------------------

        protected getAttributeMap(): AttributeMap<TextBox> {
            return extendAttributeMap(super.getAttributeMap(), {
                'text': {
                    '*': (value) => (el: TextBox) => el.text = value
                },
                'notifyOnKeydown': {
                    'true': () => (el: TextBox) => el.notifyOnKeyDown = true,
                    'false': () => (el: TextBox) => el.notifyOnKeyDown = false
                },
                'type': {
                    'string': () => (el: TextBox) => el.type = TextBoxType.string,
                    'number': () => (el: TextBox) => el.type = TextBoxType.number
                },
                'readonly': {
                    'true': () => (el: TextBox) => el.readonly = true,
                    'false': () => (el: TextBox) => el.readonly = false
                },
                'placeholder': {
                    '*': (value) => (el: TextBox) => el.placeholder = value
                },
                'onTextChange': {
                    '*': (value) => (el: TextBox) => el.registerUIHandler(el.onTextChange, value)
                }
            });
        }
    }
    Tags['TextBox'] = TextBox;


    export interface TextChangeArgs extends UIEventArgs {
        oldText: string;
        newText: string;
    }

    export enum TextBoxType {
        string,
        number
    }
} 