module xp.UI {
    /**
     * HTML content.
     */
    export class Html extends Element {

        /**
         * Sets HTML content.
         * @param html HTML content.
         */
        setHtml(html: JQuery) {
            if (html.length !== 1) {
                throw new Error('Html control must have one root element.');
            }

            this.domElement.replaceWith(html);
            this.domElement = html;


            // Re-init events.
            // TODO: Unsubscribe from prev enents.
            this.initEvents();

            // TODO: Reset properties (width, name etc).

            // TODO: Apply bindings.

            //var bindingRegex = /^\{(.*)\}$/;
            //var binded = html.filter(function () {
            //    return bindingRegex.test($(this).text());
            //});
        }
    }


    //---------------
    // MARKUP PARSING
    //---------------

    export class HtmlMarkupParser extends ElementMarkupParser<Html>{

        getInitializer(markup: JQuery): UIInitializer<Html> {

            // Load from external file, if 'href' attribute specified.
            var url: string = markup.get(0).getAttribute('href');
            var attributes = markup.get(0).attributes;
            markup.get(0).removeAttribute('href');
            var initAttributes = this.getAttributesInitializer(markup);

            if (url) {
                return (el) => {
                    // Load markup from file
                    xp.UI.loadMarkup(url,(r) => {
                        markup = r;

                        if (markup.length !== 1) {
                            throw new Error('Html control must have one root element.');
                        }

                        // Seems to be namespace bug
                        //var dom = $(markup.prop('outerHTML')); // Bug in IE
                        var dom = $($('<div>').append(markup).prop('innerHTML'));
                        el.setHtml(dom);

                        initAttributes(el);
                    });
                };
            }
            else {
                markup = markup.children();

                if (markup.length !== 1) {
                    throw new Error('Html control must have one root element.');
                }

                return (el) => {
                    // Seems to be namespace bug
                    //var dom = $(markup.prop('outerHTML')); // Bug in IE
                    var dom = $($('<div>').append(markup).prop('innerHTML'));
                    el.setHtml(dom);

                    initAttributes(el);
                };
            }


            return (el) => {
                // Seems to be namespace bug
                //var dom = $(markup.prop('outerHTML')); // Bug in IE
                var dom = $($('<div>').append(markup).prop('innerHTML'));
                el.setHtml(dom);

                initAttributes(el);
            };
        }
    }

    MarkupParseInfo['Html'] = {
        ctor: Html,
        parser: new HtmlMarkupParser()
    };
}