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
        constructor(message?: string, title?: string, actions?: { [text: string]: () => void }) {
            super();

            // TODO: Separate style and markup file?

            this.padding = '1em 1.5em';
            this.width = '32em';
            this.margin = '-15% 0 0 0';

            // Title element
            if (title !== void 0) {
                var titleEl = new Label();
                titleEl.text = title;
                titleEl.style = 'title';
                titleEl.margin = '0 0 1rem 0';
                //titleEl.domElement.css('font-size', '1.5em');
                titleEl.appendTo(this);
            }

            // Message element
            if (message !== void 0) {
                var messageEl = new Label();
                messageEl.margin = '0 0 2em 0';
                messageEl.text = message;
                messageEl.style = 'message';
                messageEl.appendTo(this);
            }

            // Create buttons
            actions = actions || {
                'OK': () => { }
            };
            var hbox = new HBox();
            hbox.contentAlignment = HContentAlignment.Right;
            for (var key in actions) {
                ((key) => {
                    var button = new Button();
                    button.text = key;
                    button.minWidth = '4em';
                    button.onClick.addHandler(() => {
                        actions[key]();
                        this.close();
                    }, this);
                    button.appendTo(hbox);
                })(key);
            }
            hbox.appendTo(this);
        }

        /**
         * Displays a message box.
         * @param message Message.
         * @param title Title.
         */
        static show(message?: string, title?: string, actions?: { [text: string]: () => void }) {
            var box = new MessageBox(message, title, actions);
            box.show();
        }
    }
} 