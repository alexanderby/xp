module xp.UI {
    /**
     * Window.
     */
    export class Window extends VBox {

        /**
         * Instance of Window.
         */
        static instance: Window;

        //----
        // DOM
        //----

        protected getTemplate(): JQuery {
            var template = $('body')
                .addClass('Window')
                .addClass('VBox');
            return template;
        }

        protected initElement() {
            super.initElement();

            if (Window.instance)
                throw new Error('There is already another Window.');
            Window.instance = this;

            this.setRenderedState(true);
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

        /**
         * Gets or sets app title.
         */
        get title() {
            return this._title;
        }
        set title(title: string) {
            this._title = title;
            document.title = title;
        }
        private _title: string;


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


    //---------------
    // MARKUP PARSING
    //---------------

    export class WindowMarkupParser<T extends Window> extends VBoxMarkupParser<Window>{

        protected getAttributeMap(): AttributeMap<Window> {
            return extendAttributeMap(super.getAttributeMap(), {
                'title': {
                    '*': (value) => (el: Window) => el.title = value
                }
            });
        }
    }

    MarkupParseInfo['Window'] = {
        ctor: Window,
        parser: new WindowMarkupParser()
    };
} 