module xp {
    export interface HtmlMarkup extends ElementMarkup {
        html?: string;
        url?: string;
    }

    /**
     * HTML content.
     */
    export class Html extends Element {
        html: string;
        url: string;

        constructor(markup: HtmlMarkup) {
            super(markup);
        }

        protected getTemplate() {
            return document.createElement('div');
        }

        applyMarkup(markup: HtmlMarkup) {

            //
            // Apply HTML and URL first

            var m = <HtmlMarkup>{};
            for (var prop in markup) {
                m[prop] = markup[prop];
            }

            if ((m.html && m.url)
                || !(m.html || m.url)) {
                throw new Error('One property, "html" or "url", must be specified.');
            }

            if (m.html) {
                this.html = m.html;
                delete m.html;
            }
            if (m.url) {
                this.url = m.url;
                delete m.url;
            }

            super.applyMarkup(m);
        }

        protected defineProperties() {
            super.defineProperties();
            var wasUrlSet = false;
            var wasHtmlSet = false;
            var setHtmlFromUrl = false;
            this.defineProperty('html', {
                getter: () => this.domElement.outerHTML,
                setter: (html: string) => {
                    if (!setHtmlFromUrl && wasHtmlSet) {
                        throw new Error('Unable to set HTML twice.');
                    }
                    var element = xp.Dom.create(html);
                    if (element.nodeType !== 1) {
                        throw new Error('Html control must have one root element.');
                    }

                    if (this.domElement.parentNode) {
                        this.domElement.parentNode.replaceChild(element, this.domElement);
                    }
                    this.domElement = element;
                    wasHtmlSet = true;

                    // Re-init events.
                    // TODO: Unsubscribe from prev enents.
                    this.initEvents();

                    // TODO: Apply bindings.
                }
            });
            this.defineProperty('url', {
                setter: (url: string) => {
                    if (wasUrlSet) {
                        throw new Error('Unable to set URL twice.');
                    }
                    var xhr = new XMLHttpRequest();
                    xhr.open('get', url);
                    xhr.onreadystatechange = () => {
                        if (xhr.readyState === 4) {
                            wasUrlSet = true;
                            setHtmlFromUrl = true;
                            this.html = xhr.responseText;
                            setHtmlFromUrl = false;
                        }
                    }
                    xhr.send(null);
                }
            });
        }
    }
}