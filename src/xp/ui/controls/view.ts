module xp.UI {

    /**
     * View.
     */
    export class View extends Stack {

        //----
        // DOM
        //----

        protected getTemplate(): JQuery {
            //return $('<div class="view stack"></div>');
            var template = $('<div class="view stack"><div class="content"></div></div>');
            return template;
        }


        getMarkupInitializer(markup: JQuery): UIInitializer<View> {

            // Load from external file, if 'href' attribute specified.
            var url: string = markup.get(0).getAttribute('href');
            var attributes = markup.get(0).attributes;
            if (url) {
                // Load markup from file
                markup = xp.loadMarkupSync(url);

                // Merge attributes
                var rootElement = $(markup.get(0));
                $.each(attributes, (i, attr: Attr) => {
                    if (attr.name !== 'href') {
                        rootElement.attr(attr.name, attr.value);
                    }
                });
            }

            return super.getMarkupInitializer(markup);
        }
    }
    Tags['View'] = View;
} 