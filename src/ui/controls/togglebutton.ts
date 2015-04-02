module xp.UI {
    export class ToggleButton extends RadioButton {

        //----
        // DOM
        //----

        protected getTemplate(): HTMLElement {
            var template = Dom.create('<label class="ToggleButton"><input type="radio"/><span class="icon"></span><span class="text"></span></label>');
            this.checkElement = <HTMLInputElement>Dom.select('input', template);
            this.iconElement = Dom.select('.icon', template);
            this.textElement = Dom.select('.text', template);
            return template;
        }

        protected iconElement: HTMLElement;
        protected textElement: HTMLElement;


        //-----------
        // PROPERTIES
        //-----------

        protected setDefaults() {
            super.setDefaults();
            this.icon = null;
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
            if (checked) {
                this.domElement.classList.add('checked');
            }
            else {
                this.domElement.classList.remove('checked');
            }
        }

        /**
         * Gets or sets the icon image url.
         * Empty value may be set if icon will be set through style.
         */
        get icon() {
            return this._iconPath;
        }
        set icon(path: string) {
            this._iconPath = path;

            // DOM
            if (path !== void 0 && path !== null) {
                if (path !== '' && path !== '*' && path !== '/') {
                    // Set background image
                    this.iconElement.style.backgroundImage = xp.formatString('url({0})', path);
                }
                this.iconElement.classList.remove('hidden');
            }
            else {
                this.iconElement.classList.add('hidden');
            }
        }
        private _iconPath: string;

    }


    //---------------
    // MARKUP PARSING
    //---------------

    export class ToggleButtonMarkupProcessor extends RadioButtonMarkupParser {

        protected getAttributeMap(): AttributeMap<ToggleButton> {
            return extendAttributeMap(super.getAttributeMap(), {
                'icon': {
                    '*': (value) => (el: Button) => el.icon = value
                }
            });
        }
    }

    MarkupParseInfo['ToggleButton'] = {
        ctor: ToggleButton,
        parser: new ToggleButtonMarkupProcessor
    };
}