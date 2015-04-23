module xp.UI {
    /**
     * Text input.
     */
    export class TextBox extends Element {

        //----
        // DOM
        //----

        protected getTemplate(): HTMLElement {
            var template = Dom.create('<input class="TextBox" type="text" />');
            //template.attr('tabindex', TabIndex++);
            return template;
        }

        domElement: HTMLInputElement|HTMLTextAreaElement;
        protected getDomElementValue(): string {
            return this.domElement.value;
        }
        protected setDomElementValue(value: string) {
            this.domElement.value = value;
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
            this.onRemoved.addHandler(() => this.onTextChange.removeAllHandlers(), this);

            var oldText = '';
            var onInput = (e: gEvent) => {
                this.onInput('text', this.value);
                var args = <TextChangeArgs>xp.UI.createEventArgs(this, e);
                args.oldText = oldText;
                var newText = this.value.toString();
                args.newText = newText
                this.onTextChange.invoke(args);
                oldText = newText;
            };

            // On text input
            this.domElement.addEventListener('change',(e) => {
                if (this.enabled) {
                    onInput(e);
                }
                else {
                    this.text = oldText;
                }
            });
            this.domElement.addEventListener('input',(e) => {
                if (this.enabled) {
                    if (this.notifyOnKeyDown) {
                        onInput(e);
                    }
                }
                else {
                    this.text = oldText;
                }
            });

            var isIE = !!navigator.userAgent.match(/Trident\/7\./);
            this.domElement.addEventListener('keypress',(e) => {
                if (this.enabled && e.keyCode === 13) {
                    if (isIE) {
                        onInput(e);
                    }
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
                    return this.getDomElementValue();
                case TextBoxType.number:
                    return parseFloat(this.getDomElementValue()) || 0;
                default:
                    throw new Error('TextBoxType value is not implemented.');
            }
        }
        set value(value) {
            this.setDomElementValue(value.toString());
        }

        /**
         * Gets or sets text.
         */
        get text() {
            return this._text;
        }
        set text(text) {
            if (text === void 0 || text === null) {
                text = '';
            }
            var old = this._text;
            this._text = text;

            // DOM
            this.setDomElementValue(text);

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
            switch (type) {
                case TextBoxType.string:
                    this.domElement.type = 'text'; break;
                case TextBoxType.number:
                    this.domElement.type = 'number'; break;
                default:
                    throw new Error('TextBoxType value is not implemented.');
            }
        }
        private _type: TextBoxType;

        /**
         * Gets or sets minimal numeric value.
         */
        get min() {
            return this._min;
        }
        set min(value) {
            this._min = value;
            this.domElement.setAttribute('min', value.toString());
        }
        private _min: number;
        /**
         * Gets or sets maximal numeric value.
         */
        get max() {
            return this._max;
        }
        set max(value) {
            this._max = value;
            this.domElement.setAttribute('max', value.toString());
        }
        private _max: number;
        /**
         * Gets or sets maximal numeric value.
         */
        get step() {
            return this._step;
        }
        set step(value) {
            this._step = value;
            this.domElement.setAttribute('step', value.toString());
        }
        private _step: number;

        /**
         * Gets or sets value, indicating whether text box is readonly.
         */
        get readonly() {
            return this._readonly;
        }
        set readonly(readonly) {
            this._readonly = readonly;

            // DOM
            if (!readonly && this.enabled) {
                this.domElement.readOnly = false;
            }
            else {
                this.domElement.readOnly = true;
            }
        }
        private _readonly: boolean;

        /**
         * Gets or sets value indicating control being enabled or disabled.
         */
        get enabled() {
            return !this.domElement.classList.contains('disabled');
        }
        set enabled(value) {
            if (value) {
                this.domElement.classList.remove('disabled');
            }
            else {
                this.domElement.classList.add('disabled');
            }
            if (!this.readonly && value) {
                this.domElement.readOnly = false;
            }
            else {
                this.domElement.readOnly = true;
            }
        }

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
                this.domElement.placeholder = placeholder;
            }
            else {
                this.domElement.placeholder = '';
            }
        }
        private _placeholder: string;



        /**
         * If enabled, listeners will be notified of changes on every input key is down.
         */
        notifyOnKeyDown;


    }


    export interface TextChangeArgs extends EventArgs<gEvent> {
        oldText: string;
        newText: string;
    }

    export enum TextBoxType {
        string,
        number
    }


    //---------------
    // MARKUP PARSING
    //---------------

    export class TextBoxMarkupParser extends ElementMarkupParser<TextBox>{
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
                },
                'min': {
                    '*': (value) => (el: TextBox) => el.min = parseFloat(value)
                },
                'max': {
                    '*': (value) => (el: TextBox) => el.max = parseFloat(value)
                },
                'step': {
                    '*': (value) => (el: TextBox) => el.step = parseFloat(value)
                },
            });
        }
    }

    MarkupParseInfo['TextBox'] = {
        ctor: TextBox,
        parser: new TextBoxMarkupParser()
    };
} 