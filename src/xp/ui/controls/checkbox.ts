module xp.UI {
    /**
     * Check box input.
     */
    export class CheckBox extends Element {

        //----
        // DOM
        //----

        protected getTemplate(): HTMLElement {
            var template = Dom.create(`
                <label class="CheckBox">
                    <input type="checkbox"/>
                    <span class="check"></span>
                    <label class="text"></label>
                </label>`);
            this.checkElement = <HTMLInputElement>Dom.select('input', template);
            this.textElement = Dom.select('label', template);
            return template;
        }

        protected checkElement: HTMLInputElement;
        protected textElement: HTMLElement;


        //-------
        // EVENTS
        //-------

        /**
         * Fires when check box value is changed.
         */
        onCheckChange: Event<CheckChangeArgs>;

        protected initEvents() {
            super.initEvents();
            this.onCheckChange = new Event();
            this.onRemoved.addHandler(() => this.onCheckChange.removeAllHandlers(), this);

            // On check change input
            this.domElement.addEventListener('change',(e) => {
                if (!this.readonly || this.enabled) {
                    this.onInput('checked', this.value);

                    var args = <CheckChangeArgs>UI.createEventArgs(this, e);
                    args.checked = this.value;
                    this.onCheckChange.invoke(args);
                }
                else {
                    // Fix for not working "readonly" attribute
                    this.checkElement.checked = !this.checkElement.checked;
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

        /**
         * Returns the value of the text box according to it's type.
         */
        get value(): boolean {
            return !!this.checkElement.checked;
        }

        /**
         * Gets or sets check state.
         */
        get checked() {
            return this._checked;
        }
        set checked(checked) {
            this._checked = checked;

            // DOM
            this.checkElement.checked = checked;
        }
        protected _checked: boolean;

        /**
         * Gets or sets button's text.
         */
        get text() {
            return this._text;
        }
        set text(text) {
            this._text = text;

            // DOM
            if (!!text === true) {
                // Set text
                this.textElement.innerText = text;
                this.textElement.classList.remove('hidden');
            }
            else {
                this.textElement.classList.add('hidden');
            }
        }
        private _text: string;

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
                this.checkElement.readOnly = true;
            }
            else {
                this.checkElement.readOnly = false
            }
        }
        private _readonly: boolean;
    }

    export interface CheckChangeArgs extends UI.EventArgs<gEvent> {
        checked: boolean;
    }


    //---------------
    // MARKUP PARSING
    //---------------

    export class CheckBoxMarkupParser extends ElementMarkupParser<CheckBox>{

        protected getAttributeMap(): AttributeMap<CheckBox> {
            return extendAttributeMap(super.getAttributeMap(), {
                'checked': {
                    'true': () => (el: CheckBox) => el.checked = true,
                    'false': () => (el: CheckBox) => el.checked = false
                },
                'text': {
                    '*': (value) => (el: CheckBox) => el.text = value
                },
                'readonly': {
                    'true': () => (el: CheckBox) => el.readonly = true,
                    'false': () => (el: CheckBox) => el.readonly = false
                },
                'onCheckChange': {
                    '*': (value) => (el: CheckBox) => el.registerUIHandler(el.onCheckChange, value)
                }
            });
        }
    }

    MarkupParseInfo['CheckBox'] = {
        ctor: CheckBox,
        parser: new CheckBoxMarkupParser()
    };
} 