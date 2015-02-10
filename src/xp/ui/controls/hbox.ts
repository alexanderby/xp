module xp.UI {
    /**
     * Horizontal stack panel.
     */
    export class HBox extends Container {

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
            this.itemsIndent = ItemsIndent._0_5em;
            this.scrollBar = ScrollBar.Both;
            this.wrapping = Wrapping.NoWrap;
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

        // TODO: Base class for HBox and VBox for holding common properties?

        /**
         * Gets or sets indent between children.
         */
        get itemsIndent() {
            return this._itemsIndent;
        }
        set itemsIndent(indent: ItemsIndent) {
            this._itemsIndent = indent;

            // DOM
            switch (indent) {
                case ItemsIndent.None:
                    this.removeItemsIndentClasses();
                    break;
                case ItemsIndent._0_5em:
                    this.removeItemsIndentClasses();
                    this.domElement.addClass('itemsIndent-05');
                    break;
                case ItemsIndent._1em:
                    this.removeItemsIndentClasses();
                    this.domElement.addClass('itemsIndent-1');
                    break;
                case ItemsIndent._2em:
                    this.removeItemsIndentClasses();
                    this.domElement.addClass('itemsIndent-2');
                    break;
                case ItemsIndent._4em:
                    this.removeItemsIndentClasses();
                    this.domElement.addClass('itemsIndent-4');
                    break;
                default:
                    throw new Error('Unknown items indent value: ' + indent);
            }
        }
        private _itemsIndent: ItemsIndent;
        private removeItemsIndentClasses() {
            this.domElement.removeClass('itemsIndent-05 itemsIndent-1 itemsIndent-2 itemsIndent-4');
        }

        /**
         * Gets or sets container's scroll bar options.
         */
        get scrollBar() {
            return this._scrollBar;
        }
        set scrollBar(scroll: ScrollBar) {
            this._scrollBar = scroll;

            // DOM
            switch (scroll) {
                case ScrollBar.None:
                    this.removeScrollBarClasses();
                    this.domElement.addClass('scrollBar-None');
                    break;
                case ScrollBar.Horizontal:
                    this.removeScrollBarClasses();
                    this.domElement.addClass('scrollBar-Horizontal');
                    break;
                case ScrollBar.Vertical:
                    this.removeScrollBarClasses();
                    this.domElement.addClass('scrollBar-Vertical');
                    break;
                case ScrollBar.Both:
                    this.removeScrollBarClasses();
                    this.domElement.addClass('scrollBar-Both');
                    break;
                default:
                    throw new Error('Unknown scroll bar value: ' + scroll);
            }
        }
        private _scrollBar: ScrollBar;
        private removeScrollBarClasses() {
            this.domElement.removeClass('scrollBar-None scrollBar-Horizontal scrollBar-Vertical scrollBar-Both');
        }

        /**
         * Gets or sets content wrapping.
         */
        get wrapping() {
            return this._wrapping;
        }
        set wrapping(wrap: Wrapping) {
            this._wrapping = wrap;

            // DOM
            switch (wrap) {
                case Wrapping.NoWrap:
                    this.removeWrappingClasses();
                    this.domElement.addClass('wrapping-NoWrap');
                    break;
                case Wrapping.Wrap:
                    this.removeWrappingClasses();
                    this.domElement.addClass('wrapping-Wrap');
                    break;
                default:
                    throw new Error('Unknown wrapping value: ' + wrap);
            }
        }
        private _wrapping: Wrapping;
        private removeWrappingClasses() {
            this.domElement.removeClass('wrapping-NoWrap wrapping-Wrap');
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

    export class HBoxMarkupProcessor<T extends HBox> extends ContainerMarkupProcessor<HBox>{

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
                },
                'itemsIndent': {
                    'None': () => (el: HBox) => el.itemsIndent = ItemsIndent.None,
                    '0.5em': () => (el: HBox) => el.itemsIndent = ItemsIndent._0_5em,
                    '1em': () => (el: HBox) => el.itemsIndent = ItemsIndent._1em,
                    '2em': () => (el: HBox) => el.itemsIndent = ItemsIndent._2em,
                    '4em': () => (el: HBox) => el.itemsIndent = ItemsIndent._4em
                },
                'scrollBar': {
                    'None': () => (el: HBox) => el.scrollBar = ScrollBar.None,
                    'Horizontal': () => (el: HBox) => el.scrollBar = ScrollBar.Horizontal,
                    'Vertical': () => (el: HBox) => el.scrollBar = ScrollBar.Vertical,
                    'Both': () => (el: HBox) => el.scrollBar = ScrollBar.Both
                },
                'wrapping': {
                    'NoWrap': () => (el: HBox) => el.wrapping = Wrapping.NoWrap,
                    'Wrap': () => (el: HBox) => el.wrapping = Wrapping.Wrap
                }
            });
        }
    }
    Processors['HBox'] = new HBoxMarkupProcessor();
}