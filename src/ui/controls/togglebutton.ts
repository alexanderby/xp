module xp {
    export interface ToggleButtonMarkup<T extends ToggleButton> extends RadioButtonMarkup<T> {
        icon?: string;
    }

    export class ToggleButton extends RadioButton {
        icon: string;

        constructor(markup?: ToggleButtonMarkup<ToggleButton>) {
            super(markup);
        }

        //----
        // DOM
        //----

        protected getTemplate(): HTMLElement {
            return Dom.create(`
                <label class="ToggleButton">
                    <input type="radio"/>
                    <span class="icon"></span>
                    <span class="text"></span>
                </label>`, {
                    'input': (el) => this.checkElement = el,
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
        }

        protected defineProperties() {
            super.defineProperties();
            this.defineProperty('checked', {
                getter: () => this.checkElement.checked,
                setter: (checked) => {
                    this.checkElement.checked = checked;
                    if (checked) {
                        this.domElement.classList.add('checked');
                    }
                    else {
                        this.domElement.classList.remove('checked');
                    }
                },
                observable: true
            });
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
                                this.iconElement.style.backgroundImage = `url(${pathOrClass})`;
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
        }
    }
}