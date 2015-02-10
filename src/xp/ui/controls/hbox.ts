module xp.UI {
    /**
     * Horizontal stack panel.
     */
    export class HBox extends Stack {

        //----
        // DOM
        //----

        protected getTemplate(): JQuery {
            var template = $('<div class="HBox"><div class="content"></div></div>');
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
            this.contentAlignment = HContentAlignment.Left;
            this.itemsAlignment = HItemsAlignment.Stretch;
            this.width = '100%';
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
                    this.domElement.addClass('contentAlign-Left');
                    break;
                case HContentAlignment.Center:
                    this.removeContentAlignmentClasses();
                    this.domElement.addClass('contentAlign-Center');
                    break;
                case HContentAlignment.Right:
                    this.removeContentAlignmentClasses();
                    this.domElement.addClass('contentAlign-Right');
                    break;
                default:
                    throw new Error('Unknown content alignment value: ' + align);
            }
        }
        private _contentAlignment: HContentAlignment;
        private removeContentAlignmentClasses() {
            this.domElement.removeClass('contentAlign-Left contentAlign-Center contentAlign-Right');
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
                    this.domElement.addClass('itemsAlign-Top');
                    break;
                case HItemsAlignment.Middle:
                    this.removeItemsAlignmentClasses();
                    this.domElement.addClass('itemsAlign-Middle');
                    break;
                case HItemsAlignment.Bottom:
                    this.removeItemsAlignmentClasses();
                    this.domElement.addClass('itemsAlign-Bottom');
                    break;
                case HItemsAlignment.Stretch:
                    this.removeItemsAlignmentClasses();
                    this.domElement.addClass('itemsAlign-Stretch');
                    break;
                default:
                    throw new Error('Unknown items alignment value: ' + align);
            }
        }
        private _itemsAlignment: HItemsAlignment;
        private removeItemsAlignmentClasses() {
            this.domElement.removeClass('itemsAlign-Top itemsAlign-Middle itemsAlign-Bottom itemsAlign-Stretch');
        }
    }
    Controls['HBox'] = HBox;


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


    //------------------
    // MARKUP PROCESSING
    //------------------

    export class HBoxMarkupProcessor<T extends HBox> extends StackMarkupProcessor<HBox>{

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
    Processors['HBox'] = new HBoxMarkupProcessor();
}