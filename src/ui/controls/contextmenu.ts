module xp {
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

        protected getTemplate(): HTMLElement {
            return Dom.create('<div class="ContextMenu VBox"></div>');
        }

        protected createMenuItem(data: ContextMenuItemData) {
            var menuItem = new ContextMenuItem(data, this);
            menuItem.appendTo(this);
        }
        
        /**
         * Is invoked when context menu is closed.
         * Argument is action data or null.
         */
        onClosed: xp.Event<ContextMenuItemData>;

        /**
         * Closes the context menu.
         */
        close(actionItem?: ContextMenuItemData) {
            this.onClosed.invoke(actionItem || null);
            this.remove();
        }

        protected initEvents() {
            super.initEvents();
            this.onClosed = new xp.Event();
            this.onRemoved.addHandler(() => this.onClosed.removeAllHandlers());
        }

        /**
         * Displays the context menu at a point.
         * @param x X.
         * @param y Y.
         */
        show(x: number, y: number);
        /**
         * Displays the context menu.
         * @param target Target element to stick context menu to.
         * @param direction Direction, "horizontal" or "vertical".
         */
        show(target: DOMElement, direction: string);
        show(xOrTarget, yOrDirection) {
            // Subscribe for outer events for cancel
            var cancel = (e: DOMEvent) => {
                window.removeEventListener('click', cancel);
                window.removeEventListener('mousedown', cancel);
                window.removeEventListener('touchstart', cancel);
                window.removeEventListener('keydown', onKey);
                this.close();
            };
            var onKey = (e: KeyboardEvent) => {
                if (e.keyCode === 27) {
                    cancel(e);
                }
            };
            setTimeout(() => {
                window.addEventListener('click', cancel);
                window.addEventListener('mousedown', cancel);
                window.addEventListener('touchstart', cancel);
                window.addEventListener('keydown', onKey);
            }, 0);

            var target: DOMElement = xOrTarget instanceof (<any>window).Element ? xOrTarget : null;
            if (target) {
                var direction = <string>yOrDirection;
                var tRect = target.getBoundingClientRect();
                if (direction === 'vertical') {
                    var x = tRect.left;
                    var y = tRect.bottom;
                } else if (direction === 'horizontal') {
                    var x = tRect.right;
                    var y = tRect.top;
                } else {
                    throw new Error('Unexpected direction.')
                }
            } else {
                var x = <number>xOrTarget;
                var y = <number>yOrDirection;
            }

            // Set coordinate
            this.domElement.style.left = x + 'px';
            this.domElement.style.top = y + 'px';

            // Append to Window
            Window.instance.__showContextMenu__(this);

            // Move if overflows
            var menuBox = this.domElement.getBoundingClientRect();
            var winBox = document.documentElement.getBoundingClientRect();
            if (menuBox.right > winBox.right) {
                if (target) {
                    if (direction === 'vertical') {
                        x -= menuBox.width - tRect.width;
                    } else {
                        x -= menuBox.width + tRect.width;
                    }
                } else {
                    x -= menuBox.width;
                }
                this.domElement.style.left = x + 'px';
            }
            if (menuBox.bottom > winBox.bottom) {
                if (target) {
                    if (direction === 'vertical') {
                        y -= menuBox.height + tRect.height;
                    } else {
                        y -= menuBox.height - tRect.height;
                    }
                } else {
                    y -= menuBox.height;
                }
                this.domElement.style.top = y + 'px';
            }
        }

        /**
         * Displays a context menu at a given point.
         * @param x X.
         * @param y Y.
         * @param data Menu-items' data.
         * @param onClosed Will be invoked when menu is closed.
         */
        static show(x: number, y: number, data: ContextMenuItemData[], onClosed?: (actionData?: ContextMenuItemData) => void): ContextMenu;
        /**
         * Displays the context menu.
         * @param target Target element to stick context menu to.
         * @param direction Direction, "horizontal" or "vertical".
         * @param data Menu-items' data.
         * @param onClosed Will be invoked when menu is closed.
         */
        static show(target: DOMElement, direction: string, data: ContextMenuItemData[], onClosed?: (actionData?: ContextMenuItemData) => void): ContextMenu;
        static show(xOrTarget, yOrDirection, data: ContextMenuItemData[], onClosed?: (actionData?: ContextMenuItemData) => void) {
            var menu = new ContextMenu(data);
            if (onClosed) {
                menu.onClosed.addHandler(onClosed);
            }
            menu.show(xOrTarget, yOrDirection);
            return menu;
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
                if (data.icon[0] === '.') {
                    this.iconElement.classList.add(data.icon.slice(1));
                }
                else {
                    this.iconElement.style.backgroundImage = xp.formatString('url({0})', data.icon);
                }
            }
            if (data.key) {
                this.keyElement.textContent = data.key;
            }
            if (data.disabled) {
                this.enabled = false;
            }
            this.textElement.textContent = data.text;
            this.domElement.addEventListener('touchstart', (e) => e.stopPropagation());
            this.domElement.addEventListener('click', (e) => e.stopPropagation());
            this.onMouseDown.addHandler((e) => {
                e.domEvent.stopPropagation();
                data.action();
                this.menu.close(data);
            }, this);
        }

        //----
        // DOM
        //----

        protected getTemplate(): HTMLElement {
            return Dom.create(`
                <span class="ContextMenuItem" role="button">
                    <span class="wrapper">
                        <span class="icon"></span>
                        <span class="text"></span>
                        <span class="key"></span>
                    </span>
                </button>`, {
                    '.icon': (el) => this.iconElement = el,
                    '.text': (el) => this.textElement = el,
                    '.key': (el) => this.keyElement = el
                });
        }

        protected iconElement: HTMLElement;
        protected textElement: HTMLElement;
        protected keyElement: HTMLElement;
    }

    export interface ContextMenuItemData {
        text: string;
        action: () => void;
        key?: string;
        icon?: string;
        disabled?: boolean;
        id?: string | number;
    }
}