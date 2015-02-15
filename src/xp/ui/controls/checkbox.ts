module xp.UI {
    /**
     * Check box input.
     */
    export class CheckBox extends Element {

        //----
        // DOM
        //----

        protected getTemplate(): JQuery {
            var template = $('<label class="CheckBox"><input type="checkbox"/><span class="check"></span><label class="text"></label></label>');
            this.checkElement = template.find('input');
            this.textElement = template.find('label');
            return template;
        }

        protected checkElement: JQuery;
        protected textElement: JQuery;


        //-------
        // EVENTS
        //-------

        /**
         * Fires when check box value is changed.
         */
        onCheckChange: Event<CheckChangeArgs>;

        protected initEvents() {
            super.initEvents();
            this.onCheckChange = new Event<CheckChangeArgs>();
            this.onRemoved.addHandler(() => this.onCheckChange.removeAllHandlers(), this);

            // On check change input
            this.domElement.on('change', (e) => {
                if (!this.readonly) {
                    this.onInput('checked', this.value);

                    var args = <CheckChangeArgs>UI.createEventArgs(this, e);
                    args.checked = this.value;
                    this.onCheckChange.invoke(args);
                }
                else {
                    // Fix for not working "readonly" attribute
                    this.checkElement.prop('checked', !this.value);
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
            return !!this.checkElement.prop('checked');
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
            this.checkElement.prop('checked', checked);
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
                this.textElement.text(text);
                this.textElement.show();
            }
            else {
                this.textElement.hide();
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
                this.domElement.attr('readonly', 'readonly');
                this.checkElement.attr('readonly', 'readonly');
            }
            else {
                this.checkElement.removeAttr('readonly');
            }
        }
        private _readonly: boolean;
    }

    export interface CheckChangeArgs extends UI.UIEventArgs {
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