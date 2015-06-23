module xp {

    export interface ButtonMarkup<T extends Button> extends ElementMarkup<T> {
        icon?: string;
        text?: string;
    }

    /**
     * Simple button.
     */
    export class Button extends Element {
        icon: string;
        text: string;

        constructor(markup?: ButtonMarkup<Button>) {
            super(markup);
        }

        //----
        // DOM
        //----

        protected getTemplate(): HTMLElement {
            return Dom.create(`
                <button class="Button" type="button">
                    <span class="wrapper">
                        <span class="icon"></span>
                        <span class="text"></span>
                    </span>
                </button>`, {
                    '.icon': (el) => this.iconElement = el,
                    '.text': (el) => this.textElement = el
                });
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
            var prevIcon: string;
            this.defineProperty('icon', {
                // NOTE: If starts with ".", then class will be added.
                // Otherwise background image URL will be set.
                // If "*", then icon element will hold space, but no image will be set.
                setter: (pathOrClass: string) => {
                    if (typeof pathOrClass === 'string' && pathOrClass !== '') {
                        // Remove prev icon
                        if (prevIcon) {
                            if (prevIcon[0] === '.') {
                                this.iconElement.classList.remove(prevIcon.slice(1));
                            }
                            else {
                                this.iconElement.style.backgroundImage = '';
                            }
                        }

                        // Set new icon
                        pathOrClass = pathOrClass.trim();
                        if (pathOrClass !== '*') {
                            if (pathOrClass[0] === '.') {
                                this.iconElement.classList.add(pathOrClass.slice(1));
                            }
                            else {
                                this.iconElement.style.backgroundImage = xp.formatString('url({0})', pathOrClass);
                            }
                            prevIcon = pathOrClass;
                        }
                        this.iconElement.classList.remove('hidden');
                    }
                    else {
                        // Hide icon element
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