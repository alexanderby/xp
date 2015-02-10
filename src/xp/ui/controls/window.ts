module xp.UI {
    /**
     * Window.
     */
    export class Window extends VBox {

        //----
        // DOM
        //----

        protected getTemplate(): JQuery {
            var template = $('<body></body>') // Bug when defining class in html on body
                .addClass('Window')
                .addClass('VBox')
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
        private _title: string;
    }
    Controls['Window'] = Window;


    //------------------
    // MARKUP PROCESSING
    //------------------

    export class WindowMarkupProcessor<T extends Window> extends VBoxMarkupProcessor<Window>{

        protected getAttributeMap(): AttributeMap<Window> {
            return extendAttributeMap(super.getAttributeMap(), {
                'title': {
                    '*': (value) => (el: Window) => el.title = value
                }
            });
        }
    }
    Processors['Window'] = new WindowMarkupProcessor();
} 