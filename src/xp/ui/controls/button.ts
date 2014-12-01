module xp.Ui {
    /**
     * Simple button.
     */
    export class Button extends Element {

        //----
        // DOM
        //----

        protected getTemplate(): JQuery {
            var template = $('<span class="button"><span class="icon"></span><span class="text"></span></span>');
            this.iconElement = template.find('.icon');
            this.textElement = template.find('.text');
            return template;
        }

        protected iconElement: JQuery;
        protected textElement: JQuery;


        //------------------
        // GETTERS / SETTERS
        //------------------

        protected setDefaults() {
            this.icon = '';
            this.text = '';
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
        protected _iconPath: string;

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
        protected _text: string;


        //------------------
        // ATTRIBUTE MAPPING
        //------------------

        /**
        * Defines the way of setting control's properties through the XML attributes.
        */
        protected getAttributeMap(): AttributeMap {
            return xp.extendObject(super.getAttributeMap(), {
                'icon': {
                    '*': (value) => this.icon = value
                },
                'text': {
                    '*': (value) => this.text = value
                },
            });
        }
    }
    Tags['button'] = Button;
} 