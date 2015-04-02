module xp.UI {
    /**
     * Base stack panel.
     */
    export /*abstract*/ class Stack extends Container {

        //-----------
        // PROPERTIES
        //-----------

        protected setDefaults() {
            super.setDefaults();
            this.itemsIndent = ItemsIndent.None;
            this.scrollBar = ScrollBar.Both;
            this.wrapping = Wrapping.NoWrap;
        }

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
                    this.domElement.classList.add('itemsIndent-05');
                    break;
                case ItemsIndent._1em:
                    this.removeItemsIndentClasses();
                    this.domElement.classList.add('itemsIndent-1');
                    break;
                case ItemsIndent._2em:
                    this.removeItemsIndentClasses();
                    this.domElement.classList.add('itemsIndent-2');
                    break;
                case ItemsIndent._4em:
                    this.removeItemsIndentClasses();
                    this.domElement.classList.add('itemsIndent-4');
                    break;
                default:
                    throw new Error('Unknown items indent value: ' + indent);
            }
        }
        private _itemsIndent: ItemsIndent;
        private removeItemsIndentClasses() {
            this.domElement.classList.remove('itemsIndent-05');
            this.domElement.classList.remove('itemsIndent-1');
            this.domElement.classList.remove('itemsIndent-2');
            this.domElement.classList.remove('itemsIndent-4');
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
                    this.domElement.classList.add('scrollBar-None');
                    break;
                case ScrollBar.Horizontal:
                    this.removeScrollBarClasses();
                    this.domElement.classList.add('scrollBar-Horizontal');
                    break;
                case ScrollBar.Vertical:
                    this.removeScrollBarClasses();
                    this.domElement.classList.add('scrollBar-Vertical');
                    break;
                case ScrollBar.Both:
                    this.removeScrollBarClasses();
                    this.domElement.classList.add('scrollBar-Both');
                    break;
                default:
                    throw new Error('Unknown scroll bar value: ' + scroll);
            }
        }
        private _scrollBar: ScrollBar;
        private removeScrollBarClasses() {
            this.domElement.classList.remove('scrollBar-None');
            this.domElement.classList.remove('scrollBar-Horizontal');
            this.domElement.classList.remove('scrollBar-Vertical');
            this.domElement.classList.remove('scrollBar-Both');
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
                    this.domElement.classList.add('wrapping-NoWrap');
                    break;
                case Wrapping.Wrap:
                    this.removeWrappingClasses();
                    this.domElement.classList.add('wrapping-Wrap');
                    break;
                default:
                    throw new Error('Unknown wrapping value: ' + wrap);
            }
        }
        private _wrapping: Wrapping;
        private removeWrappingClasses() {
            this.domElement.classList.remove('wrapping-NoWrap');
            this.domElement.classList.remove('wrapping-Wrap');
        }
    }


    //------
    // ENUMS
    //------

    /**
    * Items indent values.
    */
    export enum ItemsIndent {
        None,
        _0_5em,
        _1em,
        _2em,
        _4em
    }

    /**
     * Scroll bar options.
     */
    export enum ScrollBar {
        None,
        Horizontal,
        Vertical,
        Both
    }

    /**
     * Content wrapping.
     */
    export enum Wrapping {
        NoWrap,
        Wrap
    }


    //---------------
    // MARKUP PARSING
    //---------------

    export class StackMarkupParser<T extends Stack> extends ContainerMarkupParser<Stack>{

        protected getAttributeMap(): AttributeMap<Stack> {
            return extendAttributeMap(super.getAttributeMap(), {
                'itemsIndent': {
                    'None': () => (el: Stack) => el.itemsIndent = ItemsIndent.None,
                    '0.5em': () => (el: Stack) => el.itemsIndent = ItemsIndent._0_5em,
                    '1em': () => (el: Stack) => el.itemsIndent = ItemsIndent._1em,
                    '2em': () => (el: Stack) => el.itemsIndent = ItemsIndent._2em,
                    '4em': () => (el: Stack) => el.itemsIndent = ItemsIndent._4em
                },
                'scrollBar': {
                    'None': () => (el: Stack) => el.scrollBar = ScrollBar.None,
                    'Horizontal': () => (el: Stack) => el.scrollBar = ScrollBar.Horizontal,
                    'Vertical': () => (el: Stack) => el.scrollBar = ScrollBar.Vertical,
                    'Both': () => (el: Stack) => el.scrollBar = ScrollBar.Both
                },
                'wrapping': {
                    'NoWrap': () => (el: Stack) => el.wrapping = Wrapping.NoWrap,
                    'Wrap': () => (el: Stack) => el.wrapping = Wrapping.Wrap
                }
            });
        }
    }
} 