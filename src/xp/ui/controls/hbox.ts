module xp.UI {
    /**
     * Horizontal stack panel.
     */
    export class HBox extends Stack {

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
            this.contentAlignment = HContentAlignment.Left;
            this.itemsAlignment = HItemsAlignment.Stretch;
        }

        /**
         * Gets or sets content alignment.
         */
        get contentAlignment() {
            return this._contentAlignment;
        }
        set contentAlignment(align: HContentAlignment) {
            this._contentAlignment = align;

            // DOM
            switch (align) {
                case HContentAlignment.Left:
                    this.removeContentAlignmentClasses();
                    this.domElement.classList.add('contentAlign-Left');
                    break;
                case HContentAlignment.Center:
                    this.removeContentAlignmentClasses();
                    this.domElement.classList.add('contentAlign-Center');
                    break;
                case HContentAlignment.Right:
                    this.removeContentAlignmentClasses();
                    this.domElement.classList.add('contentAlign-Right');
                    break;
                default:
                    throw new Error('Unknown content alignment value: ' + align);
            }
        }
        private _contentAlignment: HContentAlignment;
        private removeContentAlignmentClasses() {
            this.domElement.classList.remove('contentAlign-Left');
            this.domElement.classList.remove('contentAlign-Center');
            this.domElement.classList.remove('contentAlign-Right');
        }

        /**
         * Gets or sets items alignment.
         */
        get itemsAlignment() {
            return this._itemsAlignment;
        }
        set itemsAlignment(align: HItemsAlignment) {
            this._itemsAlignment = align;

            // DOM
            switch (align) {
                case HItemsAlignment.Top:
                    this.removeItemsAlignmentClasses();
                    this.domElement.classList.add('itemsAlign-Top');
                    break;
                case HItemsAlignment.Middle:
                    this.removeItemsAlignmentClasses();
                    this.domElement.classList.add('itemsAlign-Middle');
                    break;
                case HItemsAlignment.Bottom:
                    this.removeItemsAlignmentClasses();
                    this.domElement.classList.add('itemsAlign-Bottom');
                    break;
                case HItemsAlignment.Stretch:
                    this.removeItemsAlignmentClasses();
                    this.domElement.classList.add('itemsAlign-Stretch');
                    break;
                default:
                    throw new Error('Unknown items alignment value: ' + align);
            }
        }
        private _itemsAlignment: HItemsAlignment;
        private removeItemsAlignmentClasses() {
            this.domElement.classList.remove('itemsAlign-Top');
            this.domElement.classList.remove('itemsAlign-Middle');
            this.domElement.classList.remove('itemsAlign-Bottom');
            this.domElement.classList.remove('itemsAlign-Stretch');
        }
    }


    //------
    // ENUMS
    //------

    /**
     * Horizontal content alignment values.
     */
    export enum HContentAlignment {
        Left,
        Center,
        Right
    }

    /**
    * Horizontal items alignment values.
    */
    export enum HItemsAlignment {
        Top,
        Middle,
        Bottom,
        Stretch
    }


    //---------------
    // MARKUP PARSING
    //---------------

    export class HBoxMarkupParser<T extends HBox> extends StackMarkupParser<HBox>{

        protected getAttributeMap(): AttributeMap<HBox> {
            return extendAttributeMap(super.getAttributeMap(), {
                'contentAlign': {
                    'Left': () => (el: HBox) => el.contentAlignment = HContentAlignment.Left,
                    'Center': () => (el: HBox) => el.contentAlignment = HContentAlignment.Center,
                    'Right': () => (el: HBox) => el.contentAlignment = HContentAlignment.Right
                },
                'itemsAlign': {
                    'Top': () => (el: HBox) => el.itemsAlignment = HItemsAlignment.Top,
                    'Middle': () => (el: HBox) => el.itemsAlignment = HItemsAlignment.Middle,
                    'Bottom': () => (el: HBox) => el.itemsAlignment = HItemsAlignment.Bottom,
                    'Stretch': () => (el: HBox) => el.itemsAlignment = HItemsAlignment.Stretch
                }
            });
        }
    }

    MarkupParseInfo['HBox'] = {
        ctor: HBox,
        parser: new HBoxMarkupParser()
    };
}