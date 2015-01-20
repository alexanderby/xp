module xp.UI {
    // TODO: No sense in <View> with href now? Use custom control.

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
            if (url) {
                markup = xp.loadMarkupSync(url);
            }

            return super.getMarkupInitializer(markup);
        }
    }
    Tags['View'] = View;
} 