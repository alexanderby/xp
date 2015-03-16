﻿module xp.UI {
    /**
     * Context menu.
     */
    export class ContextMenu extends VBox {

        /**
         * Creates a context menu.
         * @param data Menu-items' data.
         */
        constructor(data: ContextMenuItemData[]) {
            super();
            data.forEach((d) => this.createMenuItem(d));
        }

        //----
        // DOM
        //----

        protected getTemplate(): JQuery {
            return $('<div class="ContextMenu VBox"></div>');
        }

        protected createMenuItem(data: ContextMenuItemData) {
            var menuItem = new ContextMenuItem(data, this);
            menuItem.appendTo(this);
        }

        /**
         * Displays the context menu.
         * @param x X.
         * @param y Y.
         */
        show(x: number, y: number) {
            // Subscribe for outer events for cancel
            var cancel = (e: gEvent) => {
                this.remove();
                window.removeEventListener('mousedown', cancel);
                window.removeEventListener('keydown', onKey);
            };
            var onKey = (e: KeyboardEvent) => {
                if (e.keyCode === 27) {
                    cancel(e);
                }
            };
            window.addEventListener('mousedown', cancel);
            window.addEventListener('keydown', onKey);

            // Set coordinate
            this.domElement.css({ left: x, top: y });

            // Append to Window
            Window.instance.append(this);

            // Move if overflows
            var menuBox = this.domElement.get(0).getBoundingClientRect();
            var winBox = document.documentElement.getBoundingClientRect();
            if (menuBox.right > winBox.right) {
                this.domElement.css('left',(x - menuBox.width) + 'px');
            }
            if (menuBox.bottom > winBox.bottom) {
                this.domElement.css('top',(y - menuBox.height) + 'px');
            }
        }

        /**
         * Displays a context menu at a given point.
         * @param x X.
         * @param y Y.
         * @param data Menu-items' data.
         */
        static show(x: number, y: number, data: ContextMenuItemData[]) {
            var menu = new ContextMenu(data);
            menu.show(x, y);
        }
    }


    //----------
    // Menu item
    //----------

    class ContextMenuItem extends Element {
        protected menu: ContextMenu;

        constructor(data: ContextMenuItemData, menu: ContextMenu) {
            super();
            this.menu = menu;
            this.initItemData(data);
        }

        protected initItemData(data: ContextMenuItemData) {
            if (data.icon) {
                this.iconElement.css('background-image', xp.formatString('url({0})', data.icon));
            }
            if (data.key) {
                this.keyElement.text(data.key);
            }
            if (data.disabled) {
                this.enabled = false;
            }
            this.textElement.text(data.text);
            this.onMouseDown.addHandler((e) => {
                e.stopPropagation();
                this.menu.remove();
                data.action();
            }, this);
        }

        //----
        // DOM
        //----

        protected getTemplate(): JQuery {
            var template = $('<span class="ContextMenuItem" role="button"><span class="wrapper"><span class="icon"></span><span class="text"></span><span class="key"></span></span></button>');
            this.iconElement = template.find('.icon');
            this.textElement = template.find('.text');
            this.keyElement = template.find('.key');
            return template;
        }

        protected iconElement: JQuery;
        protected textElement: JQuery;
        protected keyElement: JQuery;
    }

    export interface ContextMenuItemData {
        text: string;
        action: () => void;
        key?: string;
        icon?: string;
        disabled?: boolean;
    }
}