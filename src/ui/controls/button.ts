module xp.UI {
    /**
     * Simple button.
     */
    export class Button extends Element {

        //----
        // DOM
        //----

        protected getTemplate(): HTMLElement {
            var template = Dom.create(`
                <button class="Button" type="button">
                    <span class="wrapper">
                        <span class="icon"></span>
                        <span class="text"></span>
                    </span>
                </button>`);
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
            this.icon = null;
            this.text = '';
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
                this.textElement.textContent = text;
                this.textElement.classList.remove('hidden');
            }
            else {
                this.textElement.classList.add('hidden');
            }
        }
        private _text: string;
    }


    //---------------
    // MARKUP PARSING
    //---------------

    export class ButtonMarkupParser extends ElementMarkupParser<Button>{

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

    MarkupParseInfo['Button'] = {
        ctor: Button,
        parser: new ButtonMarkupParser()
    };
} 