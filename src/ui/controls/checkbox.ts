﻿module xp {
    export interface CheckBoxMarkup<T extends CheckBox> extends ElementMarkup<T> {
        onCheckChange?: (e: CheckChangeArgs) => void;
        checked?: boolean|string;
        text?: string;
        readonly?: boolean|string;
    }

    /**
     * Check box input.
     */
    export class CheckBox extends Element {
        checked: boolean;
        text: string;
        readonly: boolean;

        constructor(markup?: CheckBoxMarkup<CheckBox>) {
            super(markup);
        }

        //----
        // DOM
        //----

        protected getTemplate(): HTMLElement {
            return Dom.create(`
                <label class="CheckBox">
                    <input type="checkbox"/>
                    <span class="check"></span>
                    <label class="text"></label>
                </label>`, {
                    'input': (el) => this.checkElement = el,
                    '.text': (el) => this.textElement = el
                });
        }

        protected checkElement: HTMLInputElement;
        protected textElement: HTMLElement;


        //-------
        // EVENTS
        //-------

        /**
         * Fires when check box value is changed.
         */
        onCheckChange: xp.Event<CheckChangeArgs>;

        protected initEvents() {
            super.initEvents();
            this.onCheckChange = new Event();
            this.onRemoved.addHandler(() => this.onCheckChange.removeAllHandlers(), this);

            // On check change input
            this.domElement.addEventListener('change',(e) => {
                if (!this.readonly) {
                    this.onInput('checked', this.checked);

                    var args = <CheckChangeArgs>createEventArgs(this, e);
                    args.checked = this.checked;
                    this.onCheckChange.invoke(args);
                }
            });
        }


        //-----------
        // PROPERTIES
        //-----------

        protected setDefaults() {
            super.setDefaults();
            this.checked = false;
            this.readonly = false;
            this.text = '';
        }

        protected defineProperties() {
            super.defineProperties();
            this.defineProperty('checked', {
                getter: () => this.checkElement.checked,
                setter: (value) => this.checkElement.checked = value,
                observable: true
            });
            this.defineProperty('text', {
                setter: (text: string) => {
                    if (!!text === true) {
                        // Set text
                        this.textElement.textContent = text;
                        this.textElement.classList.remove('hidden');
                    }
                    else {
                        this.textElement.classList.add('hidden');
                    }
                }
            });
            this.defineProperty('readonly', {
                setter: (readonly: boolean) => {
                    if (!readonly) {
                        this.checkElement.readOnly = false;
                        this.domElement.style.pointerEvents = '';
                    }
                    else {
                        this.checkElement.readOnly = true; // Doesn't work
                        this.domElement.style.pointerEvents = 'none';
                    }
                }
            });
            this.defineProperty('enabled', {
                setter: (value: string) => {
                    if (value) {
                        this.domElement.classList.remove('disabled');
                    }
                    else {
                        this.domElement.classList.add('disabled');
                    }
                    if (!this.readonly && value) {
                        this.checkElement.readOnly = false;
                        this.domElement.style.pointerEvents = '';
                    }
                    else {
                        this.checkElement.readOnly = true; // Doesn't work
                        this.domElement.style.pointerEvents = 'none';
                    }
                },
                observable: true
            });
        }
    }

    export interface CheckChangeArgs extends EventArgs {
        checked: boolean;
    }
} 