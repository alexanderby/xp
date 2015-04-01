module xp.UI {
    /**
     * Loads and parses all markup.
     * @param onLoad Is invoked when loading finished.
     */
    export function init(onLoad: () => void) {
        //
        // Load all markup and create initializers

        var infos: MarkupItemParseInfo<Element>[] = [];
        for (var tag in MarkupParseInfo) {
            if (MarkupParseInfo[tag].markupUrl) {
                infos.push(MarkupParseInfo[tag]);
            }
        }
        if (infos.length > 0) {
            var i = 0;
            var next = (markup: gElement) => {
                // Init markup
                var markupInit = infos[i].parser.getInitializer(markup);
                var inits = Initializers.get(infos[i].ctor);
                if (!inits) {
                    inits = [];
                    Initializers.set(infos[i].ctor, inits);
                }
                inits.push(markupInit);

                // Set named children 
                // TODO: Maybe just call by user in constructor? 
                // Previously was set for Views until View was reached.
                var names = Array.prototype.map.call(markup.querySelectorAll('[name]'),(el) => el.getAttribute('name'));
                inits.push((el) => {
                    if (el instanceof Container) {
                        names.forEach((n) => {
                            el[n] = el.find('#' + n);
                        });
                    }
                });

                i++;
                if (i < infos.length) {
                    // Load next markup file
                    loadMarkup(infos[i].markupUrl, next);
                }
                else {
                    // Call back
                    onLoad();
                }
            };
            loadMarkup(infos[i].markupUrl, next);
        }
        else {
            // Call back
            onLoad();
        }
    }

    /**
     * Loads markup.
     * @param url URL.
     * @param onLoad Function called when markup loading finished.
     * @param [async=true] Specifies whether or not load markup asynchronously.
     */
    export function loadMarkup(url: string, onLoad: (result: gElement) => void, async = true): void {
        var req = new XMLHttpRequest();
        //req.responseType = 'text/xml';
        req.responseType = 'text/xml';
        req.open('GET', url, async);
        req.onreadystatechange = (e) => {
            if (req.readyState === XMLHttpRequest.DONE && req.status === 200) {
                // Remove namespace
                var response = req.responseText.replace(/<([a-zA-Z0-9 ]+)(?:xml)ns=\".*?\"(.*)>/g, "<$1$2>");

                // Parse
                var parser = new DOMParser();
                var doc = parser.parseFromString(response, 'text/xml');

                // Get root element
                var root = <gElement>doc.firstChild;

                // Call back
                onLoad(root);
            }
        };
        req.send(null);
    }

    /**
     * Stores elements' initializers.
     */
    export var Initializers = new Dictionary<Constructor<Element>, UIInitializer<Element>[]>();
} 