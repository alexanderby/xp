module xp {
    export interface ModalMarkup extends VBoxMarkup {
        /**
         * If returns 'true', the dialog will be closed.
         * Otherwise the dialog will not be closed.
         */
        onClose?: () => boolean;
    }

    /**
     * Modal dialog base.
     */
    export /*abstract*/ class Modal extends VBox {

        /**
         * If returns 'true', the dialog will be closed.
         * Otherwise the dialog will not be closed.
         */
        onClose: () => boolean;

        /**
         * Creates a modal dialog.
         */
        constructor(markup?: ModalMarkup, children?: Element[]) {
            super(markup, children);
        }

        /**
         * Displays the modal dialog.
         */
        show() {
            Window.instance.showModal(this);
        }

        /**
         * Closes the dialog.
         */
        close() {
            var result = this.onClose ?
                this.onClose()
                : true;
            if (result)
                Window.instance.closeModal();
        }


        //----
        // DOM
        //----

        protected getTemplate() {
            return Dom.create('<div class="Modal VBox"></div>');
        }
    }

    /**
     * Modal dialog tint.
     */
    export class ModalTint extends Container {
        protected getTemplate() {
            return Dom.create('<div class="ModalTint"></div>');
        }

        // TODO: Closeable tint?
        //protected initEvents() {
        //    super.initEvents();
        //    var onClick = 
        //    this.on
        //}
    }
} 