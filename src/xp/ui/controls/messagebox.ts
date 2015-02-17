module xp.UI {
    /**
     * Simple dialog that displays a message.
     */
    export class MessageBox extends Modal {

        /**
         * Creates a message box.
         * @param message Message.
         * @param title Title.
         */
        constructor(message?: string, title?: string) {
            super();

            // TODO: Separate style?

            var content = new VBox();
            content.padding = '1em';
            content.width = '32em';

            if (title !== void 0) {
                var titleEl = new Label();
                titleEl.text = title;
                titleEl.style = 'title';
                titleEl.margin = '0 0 1rem 0';
                titleEl.domElement.css('font-size', '1.5em');
                titleEl.appendTo(content);
            }

            if (message !== void 0) {
                var messageEl = new Label();
                messageEl.margin = '0 0 2em 0';
                messageEl.text = message;
                messageEl.style = 'message';
                messageEl.appendTo(content);
            }

            var hbox = new HBox();
            hbox.contentAlignment = HContentAlignment.Right;
            var okButton = new Button();
            okButton.text = 'OK';
            okButton.width = '4em';
            okButton.onClick.addHandler(() => this.close(), this);
            okButton.appendTo(hbox);
            hbox.appendTo(content);

            content.appendTo(this);
        }

        /**
         * Displays a message box.
         * @param message Message.
         * @param title Title.
         */
        static show(message?: string, title?: string) {
            var box = new MessageBox(message, title);
            box.show();
        }
    }
} 