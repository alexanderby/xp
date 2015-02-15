module xp.UI {
    export class ToggleButton extends RadioButton {

        //----
        // DOM
        //----

        protected getTemplate(): JQuery {
            var template = $('<label class="ToggleButton"><input type="radio"/><span class="icon"></span><span class="text"></span></label>');
            this.checkElement = template.find('input');
            this.iconElement = template.find('.icon');
            this.textElement = template.find('.text');
            return template;
        }

        protected iconElement: JQuery;
        protected textElement: JQuery;


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
            this.checkElement.prop('checked', checked);
            if (checked) {
                this.domElement.addClass('checked');
            }
            else {
                this.domElement.removeClass('checked');
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
                    this.iconElement.css('background-image', xp.formatString('url({0})', path));
                }
                this.iconElement.show();
            }
            else {
                this.iconElement.hide();
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