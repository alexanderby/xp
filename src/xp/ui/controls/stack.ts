﻿module xp.UI {
    /**
     * (OBSOLETE) Stack panel.
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
            this.scrollBar = ScrollBar.Both;
            this.wrapping = Wrapping.NoWrap;
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
        private _flow: Flow;
        private removeFlowClasses() {
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
        private _contentAlignment: ContentAlignment;
        private removeContentAlignmentClasses() {
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
        private _itemsAlignment: ItemsAlignment;
        private removeItemsAlignmentClasses() {
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
                case ItemsIndent.None:
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
        private _itemsIndent: ItemsIndent;
        private removeItemsIndentClasses() {
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
                case ScrollBar.None:
                    this.removeScrollBarClasses();
                    this.domElement.addClass('scrollbar-none');
                    break;
                case ScrollBar.Horizontal:
                    this.removeScrollBarClasses();
                    this.domElement.addClass('scrollbar-x');
                    break;
                case ScrollBar.Vertical:
                    this.removeScrollBarClasses();
                    this.domElement.addClass('scrollbar-y');
                    break;
                case ScrollBar.Both:
                    this.removeScrollBarClasses();
                    this.domElement.addClass('scrollbar-both');
                    break;
                default:
                    throw new Error('Unknown scroll bar value: ' + scroll);
            }
        }
        private _scrollBar: ScrollBar;
        private removeScrollBarClasses() {
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
                case Wrapping.NoWrap:
                    this.removeWrappingClasses();
                    this.domElement.addClass('wrapping-nowrap');
                    break;
                case Wrapping.Wrap:
                    this.removeWrappingClasses();
                    this.domElement.addClass('wrapping-wrap');
                    break;
                default:
                    throw new Error('Unknown wrapping value: ' + wrap);
            }
        }
        private _wrapping: Wrapping;
        private removeWrappingClasses() {
            this.domElement.removeClass('wrapping-nowrap wrapping-wrap');
        }
    }
    Controls['Stack'] = Stack;


    //------
    // ENUMS
    //------

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
        None,
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


    //------------------
    // MARKUP PROCESSING
    //------------------

    export class StackMarkupProcessor<T extends Stack> extends ContainerMarkupProcessor<Stack>{

        protected getAttributeMap(): AttributeMap<Stack> {
            return extendAttributeMap(super.getAttributeMap(), {
                'flow': {
                    'horizontal': () => (el: Stack) => el.flow = Flow.horizontal,
                    'vertical': () => (el: Stack) => el.flow = Flow.vertical
                },
                'contentAlign': {
                    'start': () => (el: Stack) => el.contentAlignment = ContentAlignment.start,
                    'center': () => (el: Stack) => el.contentAlignment = ContentAlignment.center,
                    'end': () => (el: Stack) => el.contentAlignment = ContentAlignment.end
                },
                'itemsAlign': {
                    'start': () => (el: Stack) => el.itemsAlignment = ItemsAlignment.start,
                    'center': () => (el: Stack) => el.itemsAlignment = ItemsAlignment.center,
                    'end': () => (el: Stack) => el.itemsAlignment = ItemsAlignment.end,
                    'stretch': () => (el: Stack) => el.itemsAlignment = ItemsAlignment.stretch
                },
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
    Processors['Stack'] = new StackMarkupProcessor();
} 