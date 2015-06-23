module xp {
    export interface WindowMarkup<T extends Window> extends VBoxMarkup<T> {
        title?: string;
    }

    /**
     * Window.
     */
    export class Window extends VBox {
        title: string;

        constructor(markup?: WindowMarkup<Window>, children?: Element[]) {
            super(markup, children);
        }

        /**
         * Instance of Window.
         */
        static instance: Window;

        //----
        // DOM
        //----

        protected getTemplate(): HTMLElement {
            // TODO: When to render?
            // Replace body or append to it?

            var template = document.body;
            template.classList.add('Window')
            template.classList.add('VBox');
            this.__setRenderedState__(true);

            //// Remove current content
            //while (template.firstElementChild) {
            //    template.removeChild(template.firstElementChild);
            //}

            return template;
        }

        protected initElement() {
            super.initElement();

            if (Window.instance)
                throw new Error('There is already another Window.');
            Window.instance = this;
        }


        //-------
        // EVENTS
        //-------


        //-----------
        // PROPERTIES
        //-----------

        protected setDefaults() {
            super.setDefaults();
            this.title = 'XP Application';
        }

        protected defineProperties() {
            super.defineProperties();
            this.defineProperty('title', {
                getter: () => document.title,
                setter: (title) => document.title = title,
                observable: true
            });
        }


        //-----------------------
        // MODAL DIALOGS HANDLING
        //-----------------------

        protected tint: ModalTint;
        protected modal: Element;

        /**
         * Shows modal dialog.
         * It may be any element but it is recommended to use a modal.
         */
        showModal(modal: Element) {
            if (this.tint || this.modal)
                throw new Error('Another modal is displayed.');

            // Create tint
            this.tint = new ModalTint();
            this.tint.appendTo(this);

            // Place modal
            this.modal = modal;
            modal.appendTo(this.tint);
        }

        /**
         * Closes a current modal dialog.
         */
        closeModal() {
            this.modal.remove();
            this.tint.remove();
            this.modal = null;
            this.tint = null;
        }
    }
} 