module xp.ui {

    export interface HBoxMarkup extends StackMarkup {
        contentAlign?: string;
        itemsAlign?: string;
    }

    /**
     * Horizontal stack panel.
     */
    export class HBox extends Stack {
        contentAlign: string;
        itemsAlign: string;

        constructor(markup?: HBoxMarkup, children?: Element[]) {
            super(markup, children);
        }

        //----
        // DOM
        //----

        protected getTemplate(): HTMLElement {
            var template = Dom.create('<div class="HBox"></div>');
            return template;
        }

        //protected getContainerElement(): HTMLElement {
        //    return this.domElement;
        //}


        //-----------
        // PROPERTIES
        //-----------

        protected setDefaults() {
            super.setDefaults();
            this.contentAlign = 'left';
            this.itemsAlign = 'stretch';
        }

        protected defineProperties() {
            super.defineProperties();
            this.defineProperty('contentAlign', {
                setter: (align: string) => {
                    this.domElement.classList.remove('contentAlign-Left');
                    this.domElement.classList.remove('contentAlign-Center');
                    this.domElement.classList.remove('contentAlign-Right');
                    switch (align) {
                        case 'left':
                            this.domElement.classList.add('contentAlign-Left');
                            break;
                        case 'center':
                            this.domElement.classList.add('contentAlign-Center');
                            break;
                        case 'right':
                            this.domElement.classList.add('contentAlign-Right');
                            break;
                        default:
                            throw new Error('Unknown content alignment value: ' + align);
                    }
                },
                acceptedValues: ['left', 'center', 'right']
            });
            this.defineProperty('itemsAlign', {
                setter: (align: string) => {
                    this.domElement.classList.remove('itemsAlign-Top');
                    this.domElement.classList.remove('itemsAlign-Middle');
                    this.domElement.classList.remove('itemsAlign-Bottom');
                    this.domElement.classList.remove('itemsAlign-Stretch');
                    switch (align) {
                        case 'top':
                            this.domElement.classList.add('itemsAlign-Top');
                            break;
                        case 'middle':
                            this.domElement.classList.add('itemsAlign-Middle');
                            break;
                        case 'bottom':
                            this.domElement.classList.add('itemsAlign-Bottom');
                            break;
                        case 'stretch':
                            this.domElement.classList.add('itemsAlign-Stretch');
                            break;
                        default:
                            throw new Error('Unknown items alignment value: ' + align);
                    }
                },
                acceptedValues: ['top', 'middle', 'bottom', 'stretch']
            });
        }
    }
}