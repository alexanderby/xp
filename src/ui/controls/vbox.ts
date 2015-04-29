module xp {

    export interface VBoxMarkup extends StackMarkup {
        contentAlign?: string;
        itemsAlign?: string;
    }

    /**
     * Vertical stack panel.
     */
    export class VBox extends Stack {
        contentAlign: string;
        itemsAlign: string;

        constructor(markup?: VBoxMarkup, children?: Element[]) {
            super(markup, children);
        }

        //----
        // DOM
        //----

        protected getTemplate(): HTMLElement {
            var template = Dom.create('<div class="VBox"></div>');
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
            this.contentAlign = 'top';
            this.itemsAlign = 'stretch';
        }

        protected defineProperties() {
            super.defineProperties();
            this.defineProperty('contentAlign', {
                setter: (align: string) => {
                    this.domElement.classList.remove('contentAlign-Top');
                    this.domElement.classList.remove('contentAlign-Middle');
                    this.domElement.classList.remove('contentAlign-Bottom');
                    switch (align) {
                        case 'top':
                            this.domElement.classList.add('contentAlign-Top');
                            break;
                        case 'middle':
                            this.domElement.classList.add('contentAlign-Middle');
                            break;
                        case 'bottom':
                            this.domElement.classList.add('contentAlign-Bottom');
                            break;
                        default:
                            throw new Error('Unknown content alignment value: ' + align);
                    }
                },
                acceptedValues: ['top', 'middle', 'bottom']
            });
            this.defineProperty('itemsAlign', {
                setter: (align: string) => {
                    this.domElement.classList.remove('itemsAlign-Left');
                    this.domElement.classList.remove('itemsAlign-Center');
                    this.domElement.classList.remove('itemsAlign-Right');
                    this.domElement.classList.remove('itemsAlign-Stretch');
                    switch (align) {
                        case 'left':
                            this.domElement.classList.add('itemsAlign-Left');
                            break;
                        case 'center':
                            this.domElement.classList.add('itemsAlign-Center');
                            break;
                        case 'right':
                            this.domElement.classList.add('itemsAlign-Right');
                            break;
                        case 'stretch':
                            this.domElement.classList.add('itemsAlign-Stretch');
                            break;
                        default:
                            throw new Error('Unknown items alignment value: ' + align);
                    }
                },
                acceptedValues: ['left', 'center', 'right', 'stretch']
            });
        }
    }
}