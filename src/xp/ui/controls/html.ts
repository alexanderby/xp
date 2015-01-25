﻿module xp.UI {
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
                el.setHtml(dom);

                initAttributes(el);
            };
        }
    }
    Processors['Html'] = new HtmlMarkupProcessor();
}