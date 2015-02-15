module xp.UI {

    /**
     * View.
     */
    export class View extends VBox {

        constructor() {
            super();

            // Load markup if URL specified (not "href" attribute).
            var tag = xp.getClassName(this);
            var mp = MarkupParseInfo[tag];
            if (mp.markupInit) {
                // Already loaded? Init.
                mp.markupInit(this);
            }
            else if (mp.markupUrl) {
                // Load markup and init
                var markup = loadMarkupSync(mp.markupUrl);
                var init = mp.parser.getInitializer($(markup[0]));
                mp.markupInit = init;
                init(this);
            }
        }

        //----
        // DOM
        //----

        protected getTemplate(): JQuery {
            //return $('<div class="view stack"></div>');
            var template = $('<div class="View VBox"><div class="content"></div></div>');
            return template;
        }



    }


    //---------------
    // MARKUP PARSING
    //---------------

    export class ViewMarkupParser<T extends View> extends VBoxMarkupParser<View>{

        getInitializer(markup: JQuery): UIInitializer<View> {

            // Load from external file, if 'href' attribute specified.
            var href: string = markup.get(0).getAttribute('href');
            var attributes = markup.get(0).attributes;
            markup.get(0).removeAttribute('href');

            if (href) {
                // Load markup from file
                markup = xp.loadMarkupSync(href);

                // Merge attributes
                var rootElement = $(markup.get(0));
                $.each(attributes,(i, attr: Attr) => {
                    if (attr.name !== 'href') {
                        rootElement.attr(attr.name, attr.value);
                    }
                });
            }

            return super.getInitializer(markup);
        }
    }

    MarkupParseInfo['View'] = {
        ctor: View,
        parser: new ViewMarkupParser()
    };
} 