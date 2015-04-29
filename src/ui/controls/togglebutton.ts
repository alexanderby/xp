module xp {
    export interface ToggleButtonMarkup extends RadioButtonMarkup {
        icon?: string;
    }

    export class ToggleButton extends RadioButton {
        icon: string;

        constructor(markup: ToggleButtonMarkup) {
            super(markup);
        }

        //----
        // DOM
        //----

        protected getTemplate(): HTMLElement {
            var template = Dom.create(`
                <label class="ToggleButton">
                    <input type="radio"/>
                    <span class="icon"></span>
                    <span class="text"></span>
                </label>`);
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
        }
    }
}