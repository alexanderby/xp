﻿module xp.UI {
    /**
     * Simple button.
     */
    export class Button extends Element {

        //----
        // DOM
        //----

        protected getTemplate(): JQuery {
            var template = $('<button class="button" type="button"><span class="icon"></span><span class="text"></span></button>');
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
        private _iconPath: string;

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
    }
    Controls['Button'] = Button;


    //------------------
    // MARKUP PROCESSING
    //------------------

    export class ButtonMarkupProcessor extends ElementMarkupProcessor<Button>{

        getAttributeMap(): AttributeMap<Button> {
            return extendAttributeMap(super.getAttributeMap(), {
                'icon': {
                    '*': (value) => (el: Button) => el.icon = value
                },
                'text': {
                    '*': (value) => (el: Button) => el.text = value
                }
            });
        }
    }
    Processors['Button'] = new ButtonMarkupProcessor();
} 