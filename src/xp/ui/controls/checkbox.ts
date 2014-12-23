module xp.Ui {
    /**
     * Check box input.
     */
    export class CheckBox extends Element {

        //----
        // DOM
        //----

        protected getTemplate(): JQuery {
            var template = $('<input class="checkbox" type="checkbox"></input>');
            //template.attr('tabindex', TabIndex++);
            return template;
        }


        //-------
        // EVENTS
        //-------

        /**
         * Fires when check box value is changed.
         */
        onCheckChanged: Event<boolean>;

        protected initEvents() {
            super.initEvents();
            this.onCheckChanged = new Event<boolean>();
            this.onRemove.addHandler(() => this.onCheckChanged.removeAllHandlers(), this);

            // On check change input
            this.domElement.on('change', (e) => {
                this.onInput('checked', this.value);
            });
        }


        //-----------
        // PROPERTIES
        //-----------

        protected setDefaults() {
            super.setDefaults();
            this.checked = false;
            this.readonly = false;
        }

        /**
         * Returns the value of the text box according to it's type.
         */
        get value(): boolean {
            return !!this.domElement.prop('checked');
        }

        /**
         * Gets or sets check state.
         */
        get checked() {
            return this._checked;
        }
        set checked(checked) {
            this._checked = checked;
            this.onCheckChanged.invoke(checked);

            // DOM
            this.domElement.prop('checked', checked);
        }
        protected _checked: boolean;

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


        //------------------
        // MARKUP PROCESSING
        //------------------

        protected getAttributeMap(): AttributeMap {
            return xp.extendObject(super.getAttributeMap(), {
                'checked': {
                    'true': () => this.checked = true,
                    'false': () => this.checked = false
                },
                'readonly': {
                    'true': () => this.readonly = true,
                    'false': () => this.readonly = false
                }
            });
        }
    }
    Tags['checkbox'] = CheckBox;
} 