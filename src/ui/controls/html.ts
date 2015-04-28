module xp.ui {
    export interface HtmlMarkup {
        html?: string;
        url?: string;
    }

    /**
     * HTML content.
     */
    export class Html extends Element {
        html: string;
        url: string;

        protected defineProperties() {
            super.defineProperties();
            this.defineProperty('html', {
                getter: () => this.domElement.outerHTML,
                setter: (html: string) => {
                    var element = xp.Dom.create(html);
                    if (element.nodeType !== 1) {
                        throw new Error('Html control must have one root element.');
                    }

                    if (this.domElement.parentNode) {
                        this.domElement.parentNode.replaceChild(element, this.domElement);
                    }
                    this.domElement = element;

                    // Re-init events.
                    // TODO: Unsubscribe from prev enents.
                    this.initEvents();

                    // TODO: Reset properties (width, name etc).
                    // TODO: Apply bindings.
                }
            });
            this.defineProperty('url', {
                setter: (url: string) => {
                    var xhr = new XMLHttpRequest();
                    xhr.open('get', url);
                    xhr.onreadystatechange = () => {
                        if (xhr.readyState === 4) {
                            this.html = xhr.responseText;
                        }
                    }
                    xhr.send(null);
                }
            });
        }
    }
}