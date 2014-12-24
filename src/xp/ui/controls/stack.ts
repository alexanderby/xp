﻿module xp.UI {
    /**
     * Stack panel.
     */
    export class Stack extends Container {

        //----
        // DOM
        //----

        protected getTemplate(): JQuery {
            var template = $('<div class="stack"><div class="content"></div></div>');
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
            this.flow = Flow.vertical;
            this.contentAlignment = ContentAlignment.start;
            this.itemsAlignment = ItemsAlignment.stretch;
            this.itemsIndent = ItemsIndent._0_5em;
            this.scrollBar = ScrollBar.both;
            this.wrapping = Wrapping.nowrap;
        }

        /**
         * Gets or sets content flow.
         */
        get flow() {
            return this._flow;
        }
        set flow(flow: Flow) {
            this._flow = flow;

            // DOM
            switch (flow) {
                case Flow.horizontal:
                    this.removeFlowClasses();
                    this.domElement.addClass('flow-x');
                    break;
                case Flow.vertical:
                    this.removeFlowClasses();
                    this.domElement.addClass('flow-y');
                    break;
                default:
                    throw new Error('Unknown flow value: ' + flow);
            }
        }
        protected _flow: Flow;
        protected removeFlowClasses() {
            this.domElement.removeClass('flow-x flow-y');
        }

        /**
         * Gets or sets content alignment.
         */
        get contentAlignment() {
            return this._contentAlignment;
        }
        set contentAlignment(align: ContentAlignment) {
            this._contentAlignment = align;

            // DOM
            switch (align) {
                case ContentAlignment.start:
                    this.removeContentAlignmentClasses();
                    this.domElement.addClass('content-align-start');
                    break;
                case ContentAlignment.center:
                    this.removeContentAlignmentClasses();
                    this.domElement.addClass('content-align-center');
                    break;
                case ContentAlignment.end:
                    this.removeContentAlignmentClasses();
                    this.domElement.addClass('content-align-end');
                    break;
                default:
                    throw new Error('Unknown content alignment value: ' + align);
            }
        }
        protected _contentAlignment: ContentAlignment;
        protected removeContentAlignmentClasses() {
            this.domElement.removeClass('content-align-start content-align-center content-align-end');
        }

        /**
         * Gets or sets items alignment.
         */
        get itemsAlignment() {
            return this._itemsAlignment;
        }
        set itemsAlignment(align: ItemsAlignment) {
            this._itemsAlignment = align;

            // DOM
            switch (align) {
                case ItemsAlignment.start:
                    this.removeItemsAlignmentClasses();
                    this.domElement.addClass('items-align-start');
                    break;
                case ItemsAlignment.center:
                    this.removeItemsAlignmentClasses();
                    this.domElement.addClass('items-align-center');
                    break;
                case ItemsAlignment.end:
                    this.removeItemsAlignmentClasses();
                    this.domElement.addClass('items-align-end');
                    break;
                case ItemsAlignment.stretch:
                    this.removeItemsAlignmentClasses();
                    this.domElement.addClass('items-align-stretch');
                    break;
                default:
                    throw new Error('Unknown items alignment value: ' + align);
            }
        }
        protected _itemsAlignment: ItemsAlignment;
        protected removeItemsAlignmentClasses() {
            this.domElement.removeClass('items-align-start items-align-center items-align-end items-align-stretch');
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
                case ItemsIndent.none:
                    this.removeItemsIndentClasses();
                    break;
                case ItemsIndent._0_5em:
                    this.removeItemsIndentClasses();
                    this.domElement.addClass('items-indent-05');
                    break;
                case ItemsIndent._1em:
                    this.removeItemsIndentClasses();
                    this.domElement.addClass('items-indent-1');
                    break;
                case ItemsIndent._2em:
                    this.removeItemsIndentClasses();
                    this.domElement.addClass('items-indent-2');
                    break;
                case ItemsIndent._4em:
                    this.removeItemsIndentClasses();
                    this.domElement.addClass('items-indent-4');
                    break;
                default:
                    throw new Error('Unknown items indent value: ' + indent);
            }
        }
        protected _itemsIndent: ItemsIndent;
        protected removeItemsIndentClasses() {
            this.domElement.removeClass('items-indent-05 items-indent-1 items-indent-2 items-indent-4');
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
                case ScrollBar.none:
                    this.removeScrollBarClasses();
                    this.domElement.addClass('scrollbar-none');
                    break;
                case ScrollBar.horizontal:
                    this.removeScrollBarClasses();
                    this.domElement.addClass('scrollbar-x');
                    break;
                case ScrollBar.vertical:
                    this.removeScrollBarClasses();
                    this.domElement.addClass('scrollbar-y');
                    break;
                case ScrollBar.both:
                    this.removeScrollBarClasses();
                    this.domElement.addClass('scrollbar-both');
                    break;
                default:
                    throw new Error('Unknown scroll bar value: ' + scroll);
            }
        }
        protected _scrollBar: ScrollBar;
        protected removeScrollBarClasses() {
            this.domElement.removeClass('scrollbar-none scrollbar-x scrollbar-y scrollbar-both');
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
                case Wrapping.nowrap:
                    this.removeWrappingClasses();
                    this.domElement.addClass('wrapping-nowrap');
                    break;
                case Wrapping.wrap:
                    this.removeWrappingClasses();
                    this.domElement.addClass('wrapping-wrap');
                    break;
                default:
                    throw new Error('Unknown wrapping value: ' + wrap);
            }
        }
        protected _wrapping: Wrapping;
        protected removeWrappingClasses() {
            this.domElement.removeClass('wrapping-nowrap wrapping-wrap');
        }


        //------------------
        // MARKUP PROCESSING
        //------------------

        protected getAttributeMap() {
            return xp.extendObject(super.getAttributeMap(), {
                'flow': {
                    'horizontal': () => this.flow = Flow.horizontal,
                    'vertical': () => this.flow = Flow.vertical
                },
                'contentAlign': {
                    'start': () => this.contentAlignment = ContentAlignment.start,
                    'center': () => this.contentAlignment = ContentAlignment.center,
                    'end': () => this.contentAlignment = ContentAlignment.end
                },
                'itemsAlign': {
                    'start': () => this.itemsAlignment = ItemsAlignment.start,
                    'center': () => this.itemsAlignment = ItemsAlignment.center,
                    'end': () => this.itemsAlignment = ItemsAlignment.end,
                    'stretch': () => this.itemsAlignment = ItemsAlignment.stretch
                },
                'itemsIndent': {
                    'none': () => this.itemsIndent = ItemsIndent.none,
                    '0.5em': () => this.itemsIndent = ItemsIndent._0_5em,
                    '1em': () => this.itemsIndent = ItemsIndent._1em,
                    '2em': () => this.itemsIndent = ItemsIndent._2em,
                    '4em': () => this.itemsIndent = ItemsIndent._4em
                },
                'scrollBar': {
                    'none': () => this.scrollBar = ScrollBar.none,
                    'horizontal': () => this.scrollBar = ScrollBar.horizontal,
                    'vertical': () => this.scrollBar = ScrollBar.vertical,
                    'both': () => this.scrollBar = ScrollBar.both
                },
                'wrapping': {
                    'nowrap': () => this.wrapping = Wrapping.nowrap,
                    'wrap': () => this.wrapping = Wrapping.wrap
                }
            });
        }
        
    }
    Tags['Stack'] = Stack;


    /**
     * Content alignment values.
     */
    export enum ContentAlignment {
        start,
        center,
        end
    }

    /**
    * Items alignment values.
    */
    export enum ItemsAlignment {
        start,
        center,
        end,
        stretch
    }

    /**
    * Items indent values.
    */
    export enum ItemsIndent {
        none,
        _0_5em,
        _1em,
        _2em,
        _4em
    }

    /**
     * Content flow orientation.
     */
    export enum Flow {
        horizontal,
        vertical
    }

    /**
     * Scroll bar options.
     */
    export enum ScrollBar {
        none,
        horizontal,
        vertical,
        both
    }

    /**
     * Content wrapping.
     */
    export enum Wrapping {
        nowrap,
        wrap
    }
} 