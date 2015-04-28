module xp.ui {
    export interface TextBoxMarkup extends ElementMarkup {
        onTextChange?: (e: EventArgs) => void;

        text?: string;
        notifiOnKeyDown?: boolean|string;
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
        notifiOnKeyDown: boolean;
        type: string;
        readonly: boolean;
        placeholder: string;
        min: number;
        max: number;
        step: number;

        constructor(markup?: TextBoxMarkup) {
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
            var onInput = (e: domEvent) => {
                this.onInput('text', this.value);
                var args = <TextChangeArgs>xp.ui.createEventArgs(this, e);
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
            this.type = 'string';
            this.readonly = false;
            this.placeholder = '';
        }

        protected defineProperties() {
            super.defineProperties();
            this.defineProperty('text', {
                getter: () => this.domElement.value,
                setter: (text: string) => this.domElement.value = text,
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
                getter: () => this.domElement.readOnly,
                setter: (readonly: boolean) => {
                    if (!readonly && this.enabled) {
                        this.domElement.readOnly = false;
                    }
                    else {
                        this.domElement.readOnly = true;
                    }
                }
            });
            this.defineProperty('enabled', {
                setter: (value: boolean) => {
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
                },
                observable: true
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

        /**
         * Returns the value of the text box according to it's type.
         */
        get value(): any {
            switch (this.type) {
                case 'string':
                    return this.text;
                case 'number':
                    return parseFloat(this.text) || 0;
                default:
                    throw new Error('TextBox type value is not implemented.');
            }
        }
        set value(value) {
            this.text = value.toString();
        }

        /**
         * If enabled, listeners will be notified of changes when every input key is down.
         */
        notifyOnKeyDown;
    }


    export interface TextChangeArgs extends EventArgs {
        oldText: string;
        newText: string;
    }
} 