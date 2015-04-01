module xp.UI {
    /**
     * HTML content.
     */
    export class Html extends Element {

        /**
         * Sets HTML content.
         * @param html HTML content.
         */
        setHtml(html: HTMLElement) {
            if (html.nodeType !== 1) {
                throw new Error('Html control must have one root element.');
            }

            if (this.domElement.parentNode) {
                this.domElement.parentNode.replaceChild(html, this.domElement);
            }
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

        getInitializer(markup: gElement): UIInitializer<Html> {

            // Load from external file, if 'href' attribute specified.
            var url: string = markup.getAttribute('href');
            var attributes = markup.attributes;
            markup.removeAttribute('href');
            var initAttributes = this.getAttributesInitializer(markup);

            if (url) {
                return (el) => {
                    // Load markup from file
                    xp.UI.loadMarkup(url,(r) => {
                        var m = <HTMLElement>r;

                        if (m.nodeType !== 1) {
                            throw new Error('Html control must have one root element.');
                        }

                        // Seems to be namespace bug
                        var temp = document.createElement('div');
                        temp.appendChild(m);
                        var dom = Dom.create(temp.innerHTML);
                        el.setHtml(dom);

                        initAttributes(el);
                    });
                };
            }
            else {
                if (markup.childElementCount !== 1) {
                    throw new Error('Html control must have one root element.');
                }

                return (el) => {
                    // Seems to be namespace bug
                    var dom = Dom.create(new XMLSerializer().serializeToString(markup.firstElementChild));
                    el.setHtml(dom);

                    initAttributes(el);
                };
            }
        }
    }

    MarkupParseInfo['Html'] = {
        ctor: Html,
        parser: new HtmlMarkupParser()
    };
}