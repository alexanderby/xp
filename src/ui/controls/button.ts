module xp {

    export interface ButtonMarkup extends ElementMarkup {
        icon?: string;
        text?: string;
    }

    /**
     * Simple button.
     */
    export class Button extends Element {
        icon: string;
        text: string;

        constructor(markup?: ButtonMarkup) {
            super(markup);
        }

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
            super.setDefaults();
            this.icon = null;
            this.text = '';
        }

        protected defineProperties() {
            super.defineProperties();
            this.defineProperty('icon', {
                setter: (path: string) => {
                    if (typeof path === 'string') {
                        path = path.trim();
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
        }
    }
} 