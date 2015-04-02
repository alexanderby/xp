module xp.UI {
    /**
     * Vertical stack panel.
     */
    export class VBox extends Stack {

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
            this.contentAlignment = VContentAlignment.Top;
            this.itemsAlignment = VItemsAlignment.Stretch;
        }

        /**
         * Gets or sets content alignment.
         */
        get contentAlignment() {
            return this._contentAlignment;
        }
        set contentAlignment(align: VContentAlignment) {
            this._contentAlignment = align;

            // DOM
            switch (align) {
                case VContentAlignment.Top:
                    this.removeContentAlignmentClasses();
                    this.domElement.classList.add('contentAlign-Top');
                    break;
                case VContentAlignment.Middle:
                    this.removeContentAlignmentClasses();
                    this.domElement.classList.add('contentAlign-Middle');
                    break;
                case VContentAlignment.Bottom:
                    this.removeContentAlignmentClasses();
                    this.domElement.classList.add('contentAlign-Bottom');
                    break;
                default:
                    throw new Error('Unknown content alignment value: ' + align);
            }
        }
        private _contentAlignment: VContentAlignment;
        private removeContentAlignmentClasses() {
            this.domElement.classList.remove('contentAlign-Top');
            this.domElement.classList.remove('contentAlign-Middle');
            this.domElement.classList.remove('contentAlign-Bottom');
        }

        /**
         * Gets or sets items alignment.
         */
        get itemsAlignment() {
            return this._itemsAlignment;
        }
        set itemsAlignment(align: VItemsAlignment) {
            this._itemsAlignment = align;

            // DOM
            switch (align) {
                case VItemsAlignment.Left:
                    this.removeItemsAlignmentClasses();
                    this.domElement.classList.add('itemsAlign-Left');
                    break;
                case VItemsAlignment.Center:
                    this.removeItemsAlignmentClasses();
                    this.domElement.classList.add('itemsAlign-Center');
                    break;
                case VItemsAlignment.Right:
                    this.removeItemsAlignmentClasses();
                    this.domElement.classList.add('itemsAlign-Right');
                    break;
                case VItemsAlignment.Stretch:
                    this.removeItemsAlignmentClasses();
                    this.domElement.classList.add('itemsAlign-Stretch');
                    break;
                default:
                    throw new Error('Unknown items alignment value: ' + align);
            }
        }
        private _itemsAlignment: VItemsAlignment;
        private removeItemsAlignmentClasses() {
            this.domElement.classList.remove('itemsAlign-Left');
            this.domElement.classList.remove('itemsAlign-Center');
            this.domElement.classList.remove('itemsAlign-Right');
            this.domElement.classList.remove('itemsAlign-Stretch');
        }
    }


    //------
    // ENUMS
    //------

    /**
     * Vertical content alignment values.
     */
    export enum VContentAlignment {
        Top,
        Middle,
        Bottom
    }

    /**
    * Vertical items alignment values.
    */
    export enum VItemsAlignment {
        Left,
        Center,
        Right,
        Stretch
    }


    //---------------
    // MARKUP PARSING
    //---------------

    export class VBoxMarkupParser<T extends VBox> extends StackMarkupParser<VBox>{

        protected getAttributeMap(): AttributeMap<VBox> {
            return extendAttributeMap(super.getAttributeMap(), {
                'contentAlign': {
                    'Top': () => (el: VBox) => el.contentAlignment = VContentAlignment.Top,
                    'Middle': () => (el: VBox) => el.contentAlignment = VContentAlignment.Middle,
                    'Bottom': () => (el: VBox) => el.contentAlignment = VContentAlignment.Bottom
                },
                'itemsAlign': {
                    'Left': () => (el: VBox) => el.itemsAlignment = VItemsAlignment.Left,
                    'Center': () => (el: VBox) => el.itemsAlignment = VItemsAlignment.Center,
                    'Right': () => (el: VBox) => el.itemsAlignment = VItemsAlignment.Right,
                    'Stretch': () => (el: VBox) => el.itemsAlignment = VItemsAlignment.Stretch
                }
            });
        }
    }

    MarkupParseInfo['VBox'] = {
        ctor: VBox,
        parser: new VBoxMarkupParser()
    };
}