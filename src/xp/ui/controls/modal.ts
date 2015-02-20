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
            Window.instance.append(this);
        }

        /**
         * Closes the dialog.
         */
        close() {
            var result = this.onClose();
            if (result)
                this.remove();
        }


        //----
        // DOM
        //----

        protected getTemplate() {
            return $('<div class="Modal"></div>');
        }
    }
} 