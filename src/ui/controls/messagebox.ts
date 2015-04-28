module xp.ui {
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
            super(null, {
                padding: '1em 1.5em',
                width: '32em',
                margin: '-15% 0 0 0'
            });

            // TODO: Separate style file?
            
            // Title element
            if (title !== void 0) {
                var titleEl = new Label({
                    text: title,
                    style: 'title',
                    margin: '0 0 1rem 0'
                });
                //titleEl.domElement.css('font-size', '1.5em');
                titleEl.appendTo(this);
            }

            // Message element
            if (message !== void 0) {
                var messageEl = new Label({
                    margin: '0 0 2em 0',
                    text: message,
                    style: 'message'
                });
                messageEl.appendTo(this);
            }

            // Create buttons
            actions = actions || {
                'OK': () => { }
            };
            var hbox = new HBox({
                contentAlign: 'right'
            });
            for (var key in actions) {
                ((key) => {
                    var button = new Button({
                        text: key,
                        minWidth: '4em',
                        initializer: (el) => el.onClick.addHandler(() => {
                            actions[key]();
                            this.close();
                        })
                    });
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