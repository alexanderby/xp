module xp.UI {
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
         * @param onClose If returns 'true', the dialog will be closed.
         * Otherwise the dialog will not be closed.
         */
        constructor(onClose?: () => boolean) {
            super();
            this.onClose = onClose || function () { return true; };
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
            var result = this.onClose();
            if (result)
                Window.instance.closeModal();
        }


        //----
        // DOM
        //----

        protected getTemplate() {
            return $('<div class="Modal VBox"></div>');
        }
    }

    /**
     * Modal dialog tint.
     */
    export class ModalTint extends Container {
        protected getTemplate() {
            return $('<div class="ModalTint"></div>');
        }

        // TODO: Closeable tint?
        //protected initEvents() {
        //    super.initEvents();
        //    var onClick = 
        //    this.on
        //}
    }
} 