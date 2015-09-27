module xp {
    export interface TextBoxMarkup<T extends TextBox> extends ElementMarkup<T> {
        onTextChange?: (e: TextChangeArgs) => void;

        text?: string;
        value?: number|string;
        notifyOnKeyDown?: boolean|string;
        type?: string;
        readonly?: boolean|string;
        placeholder?: string;
        min?: number;
        max?: number;
        step?: number;
    }

    /**
     * Text input.
     */
    export class TextBox extends Element {
        text: string;
        value: number|string;
        notifyOnKeyDown: boolean;
        type: string;
        readonly: boolean;
        placeholder: string;
        min: number;
        max: number;
        step: number;

        constructor(markup?: TextBoxMarkup<TextBox>) {
            super(markup);
        }

        //----
        // DOM
        //----

        protected getTemplate(): HTMLElement {
            var template = Dom.create('<input class="TextBox" type="text" />');
            //template.attr('tabindex', TabIndex++);
            return template;
        }

        domElement: HTMLInputElement|HTMLTextAreaElement;


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
            var onInput = (e: DOMEvent) => {
                var args = <TextChangeArgs>xp.createEventArgs(this, e);
                args.oldText = oldText;
                var newText = this.value.toString();
                args.newText = newText
                this.onTextChange.invoke(args);
                this.onInput('text', this.value);
                this.onInput('value', this.value);
                oldText = newText;
            };

            // On text input
            this.domElement.addEventListener('change',(e) => {
                onInput(e);
            });
            this.domElement.addEventListener('input',(e) => {
                if (this.notifyOnKeyDown) {
                    onInput(e);
                }
            });

            var isIE = !!navigator.userAgent.match(/Trident\/7\./);
            this.domElement.addEventListener('keypress',(e) => {
                if (e.keyCode === 13) {
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
            this.type = 'string';
            this.readonly = false;
            this.placeholder = '';
        }

        protected defineProperties() {
            super.defineProperties();
            this.defineProperty('text', {
                getter: () => this.domElement.value,
                setter: (text: string) => {
                    if (text === void 0 || text === null) {
                        text = '';
                    }
                    this.domElement.value = text;
                },
                observable: true
            });
            this.defineProperty('value', {
                getter: () => {
                    switch (this.type) {
                        case 'string':
                            return this.text;
                        case 'number':
                            return parseFloat(this.text) || 0;
                        default:
                            throw new Error('TextBox type value is not implemented.');
                    }
                },
                setter: (value: string|number) => {
                    var t = typeof value;
                    if (t === 'number' || t === 'boolean') {
                        value = value.toString();
                    }
                    if (value === void 0 || value === null) {
                        value = '';
                    }
                    this.text = <string>value;
                },
                observable: true
            });
            this.defineProperty('type', {
                setter: (value: string) => {
                    switch (value) {
                        case 'string':
                            this.domElement.type = 'text';
                            break;
                        case 'number':
                            this.domElement.type = 'number';
                            break;
                        default:
                            throw new Error('TextBoxType value is not implemented.');
                    }
                },
                acceptedValues: ['string', 'number']
            });
            this.defineProperty('min', {
                setter: (value: number) => this.domElement.setAttribute('min', value.toString())
            });
            this.defineProperty('max', {
                setter: (value: number) => this.domElement.setAttribute('max', value.toString())
            });
            this.defineProperty('step', {
                setter: (value: number) => this.domElement.setAttribute('step', value.toString())
            });
            this.defineProperty('readonly', {
                setter: (readonly: boolean) => {
                    if (!readonly) {
                        this.domElement.readOnly = false;
                    }
                    else {
                        this.domElement.readOnly = true;
                    }
                }
            });
            this.defineProperty('placeholder', {
                getter: () => this.domElement.placeholder,
                setter: (placeholder: string) => {
                    if (placeholder) {
                        this.domElement.placeholder = placeholder;
                    }
                    else {
                        this.domElement.placeholder = '';
                    }
                }
            });
        }
    }


    export interface TextChangeArgs extends EventArgs {
        oldText: string;
        newText: string;
    }
} 