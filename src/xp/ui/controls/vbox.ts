module xp.UI {
    /**
     * Vertical stack panel.
     */
    export class VBox extends Container {

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
            this.itemsAlignment = VItemsAlignment.Center;
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
                    this.domElement.addClass('itemsAlign-Top');
                    break;
                case VItemsAlignment.Center:
                    this.removeItemsAlignmentClasses();
                    this.domElement.addClass('itemsAlign-Middle');
                    break;
                case VItemsAlignment.Right:
                    this.removeItemsAlignmentClasses();
                    this.domElement.addClass('itemsAlign-Bottom');
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

    export class VBoxMarkupProcessor<T extends VBox> extends ContainerMarkupProcessor<VBox>{

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
                },
                'itemsIndent': {
                    'None': () => (el: VBox) => el.itemsIndent = ItemsIndent.None,
                    '0.5em': () => (el: VBox) => el.itemsIndent = ItemsIndent._0_5em,
                    '1em': () => (el: VBox) => el.itemsIndent = ItemsIndent._1em,
                    '2em': () => (el: VBox) => el.itemsIndent = ItemsIndent._2em,
                    '4em': () => (el: VBox) => el.itemsIndent = ItemsIndent._4em
                },
                'scrollBar': {
                    'None': () => (el: VBox) => el.scrollBar = ScrollBar.None,
                    'Horizontal': () => (el: VBox) => el.scrollBar = ScrollBar.Horizontal,
                    'Vertical': () => (el: VBox) => el.scrollBar = ScrollBar.Vertical,
                    'Both': () => (el: VBox) => el.scrollBar = ScrollBar.Both
                },
                'wrapping': {
                    'NoWrap': () => (el: VBox) => el.wrapping = Wrapping.NoWrap,
                    'Wrap': () => (el: VBox) => el.wrapping = Wrapping.Wrap
                }
            });
        }
    }
    Processors['VBox'] = new VBoxMarkupProcessor();
}