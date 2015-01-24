module xp.UI {
    /**
     * HTML content.
     */
    export class Html extends Element {

    }
    Controls['Html'] = Html;


    //------------------
    // MARKUP PROCESSING
    //------------------

    export class HtmlMarkupProcessor extends ElementMarkupProcessor<Html>{

        getInitializer(markup: JQuery): UIInitializer<Html> {

            // Load from external file, if 'href' attribute specified.
            var url: string = markup.get(0).getAttribute('href');
            var attributes = markup.get(0).attributes;
            markup.get(0).removeAttribute('href');
            var initAttributes = this.getAttributesInitializer(markup);

            if (url) {
                // Load markup from file
                markup = xp.loadMarkupSync(url);
            }
            else {
                markup = markup.children();
            }

            if (markup.length !== 1) {
                throw new Error('Html control must have one root element.');
            }

            return (el) => {
                // Seems to be namespace bug
                var dom = $(markup.prop('outerHTML'));
                el.domElement.replaceWith(dom);
                el.domElement = dom;

                // HACK: Re-init events.
                el['initEvents']();

                // Attributes?
                initAttributes(el);

                // Apply bindings
                //var i = 0;
                var bindingRegex = /^\{(.*)\}$/;
                var binded = dom.filter(function () {
                    return bindingRegex.test($(this).text());
                });

            };
        }
    }
    Processors['Html'] = new HtmlMarkupProcessor();
}