module xp.Ui {
    /**
     * Window.
     */
    export class Window extends Stack {

        //----
        // DOM
        //----

        protected getTemplate(): JQuery {
            var template = $('<body></body>') // Bug when defining class in html on body
                .addClass('window')
                .addClass('stack')
                .append('<div class="content"></div>');
            return template;
        }


        //-------
        // EVENTS
        //-------


        //-----------
        // PROPERTIES
        //-----------

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
        protected _title: string;


        //------------------
        // MARKUP PROCESSING
        //------------------

        protected getAttributeMap(): AttributeMap {
            return xp.extendObject(super.getAttributeMap(), {
                'title': {
                    '*': (value) => this.title = value
                }
            });
        }
    }
    Tags['window'] = Window;
} 