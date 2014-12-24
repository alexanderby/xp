module xp {
    // TODO: Replace jQuery.

    /**
     * Application base.
     */
    export class Application {

        protected windowUrl: string;

        constructor(config?: AppConfig) {

            //
            // Handle config

            if (config && config.windowUrl) {
                this.windowUrl = config.windowUrl;
            }
            else {
                // Set default window path if not present.
                this.windowUrl = 'view/window.xml';
            }
        }


        /**
         * Starts the application.
         */
        start() {
            this.parseMarkup();
        }


        /**
         * Application's window.
         */
        window: UI.Window;


        /**
         * Parses markup from file.
         */
        protected parseMarkup() {
            var windowXml: JQuery;

            // Load window
            windowXml = xp.loadMarkupSync(this.windowUrl);

            // Create window
            this.window = <xp.UI.Window>new xp.UI.Tags['window'](windowXml));

            // Replace body
            $('body').replaceWith(this.window.domElement);
        }
    }

    /**
     * Base application config.
     */
    export interface AppConfig {
        windowUrl: string;
    }


    // TODO: Async?
    /**
     * Synchronously loads and parses markup from file.
     * @param href URL of markup file.
     * @return XML node.
     */
    export function loadMarkupSync(url: string): JQuery {
        var xml: JQuery;

        $.ajax({
            url: url,
            dataType: 'text',
            async: false,
            error: (req, text, err) => {
                throw err;
            },
            success: (response: string) => {
                // Remove namespace
                response = response.replace(/<([a-zA-Z0-9 ]+)(?:xml)ns=\".*?\"(.*)>/g, "<$1$2>");

                // Get root element
                xml = $($.parseXML(response)).children().first();
            }
        });
        //var req = new XMLHttpRequest();
        //req.responseType = 'text/xml';
        //req.open('GET', 'view/window.xml');
        //req.onreadystatechange = (e) => {
        //    if (req.readyState === XMLHttpRequest.DONE && req.status === 200) {
        //        var xml = <XMLDocument>req.responseXML.documentElement;
        //        console.log(xml.childNodes.length);
        //    }
        //};
        //req.send(null);

        return xml;
    }
} 