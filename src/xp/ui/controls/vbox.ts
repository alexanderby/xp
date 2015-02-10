module xp.UI {
    /**
     * Vertical stack panel.
     */
    export class VBox extends Stack {

        //----
        // DOM
        //----

        protected getTemplate(): JQuery {
            var template = $('<div class="VBox"><div class="content"></div></div>');
            return template;
        }

        protected getContainerElement(): JQuery {
            //return this.domElement.closest('.content'); // Bug with <body>

            // Get only nearest '.content'.
            return $(this.domElement.find('.content').get(0));
        }


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
                    this.domElement.addClass('contentAlign-Top');
                    break;
                case VContentAlignment.Middle:
                    this.removeContentAlignmentClasses();
                    this.domElement.addClass('contentAlign-Middle');
                    break;
                case VContentAlignment.Bottom:
                    this.removeContentAlignmentClasses();
                    this.domElement.addClass('contentAlign-Bottom');
                    break;
                default:
                    throw new Error('Unknown content alignment value: ' + align);
            }
        }
        private _contentAlignment: VContentAlignment;
        private removeContentAlignmentClasses() {
            this.domElement.removeClass('contentAlign-Top contentAlign-Middle contentAlign-Bottom');
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
                    this.domElement.addClass('itemsAlign-Left');
                    break;
                case VItemsAlignment.Center:
                    this.removeItemsAlignmentClasses();
                    this.domElement.addClass('itemsAlign-Center');
                    break;
                case VItemsAlignment.Right:
                    this.removeItemsAlignmentClasses();
                    this.domElement.addClass('itemsAlign-Right');
                    break;
                case VItemsAlignment.Stretch:
                    this.removeItemsAlignmentClasses();
                    this.domElement.addClass('itemsAlign-Stretch');
                    break;
                default:
                    throw new Error('Unknown items alignment value: ' + align);
            }
        }
        private _itemsAlignment: VItemsAlignment;
        private removeItemsAlignmentClasses() {
            this.domElement.removeClass('itemsAlign-Left itemsAlign-Center itemsAlign-Right itemsAlign-Stretch');
        }
    }
    Controls['VBox'] = VBox;


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


    //------------------
    // MARKUP PROCESSING
    //------------------

    export class VBoxMarkupProcessor<T extends VBox> extends StackMarkupProcessor<VBox>{

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
    Processors['VBox'] = new VBoxMarkupProcessor();
}