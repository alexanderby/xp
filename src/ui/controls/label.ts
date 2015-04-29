module xp {
    export interface LabelMarkup extends ElementMarkup {
        text?: string;
    }

    export class Label extends Element {
        text: string;

        constructor(markup?: LabelMarkup) {
            super(markup);
        }

        //----
        // DOM
        //----

        protected getTemplate(): HTMLElement {
            return Dom.create('<label class="Label"></label>');
        }

        
        //-----------
        // PROPERTIES
        //-----------

        protected defineProperties() {
            super.defineProperties();
            this.defineProperty('text', {
                setter: (text: string) => {
                    this.domElement.textContent = text;
                },
                observable: true
            });
        }
    }
} 