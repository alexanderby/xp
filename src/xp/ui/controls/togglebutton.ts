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
            this.icon = '';
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
         * Gets or sets the icon image.
         */
        get icon() {
            return this._iconPath;
        }
        set icon(path: string) {
            this._iconPath = path;

            // DOM
            if (!!path === true) {
                // Set background image
                this.iconElement.css('background-image', xp.formatString('url({0})', path));
                this.iconElement.show();
            }
            else {
                this.iconElement.hide();
            }
        }
        private _iconPath: string;

    }
    Controls['ToggleButton'] = ToggleButton;


    //------------------
    // MARKUP PROCESSING
    //------------------

    export class ToggleButtonMarkupProcessor extends RadioButtonMarkupProcessor {

        protected getAttributeMap(): AttributeMap<ToggleButton> {
            return extendAttributeMap(super.getAttributeMap(), {
                'icon': {
                    '*': (value) => (el: Button) => el.icon = value
                }
            });
        }
    }
    Processors['ToggleButton'] = new ToggleButtonMarkupProcessor();
}