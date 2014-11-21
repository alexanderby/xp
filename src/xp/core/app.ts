module xp {
    // TODO: Replace jQuery.

    /**
     * Application base.
     */
    export class Application {

        protected windowHref: string;

        constructor(config?: AppConfig) {

            //
            // Handle config

            if (config && config.windowHref) {
                this.windowHref = config.windowHref;
            }
            else {
                // Set default window path if not present.
                this.windowHref = 'view/window.xml';
            }
        }


        start() {
            this.parseMarkup();
        }


        window: Ui.Window;


        protected parseMarkup() {
            var windowXml: JQuery;

            // Load window
            $.ajax({
                url: this.windowHref,
                dataType: 'text',
                async: false,
                error: (req, text, err) => {
                    throw err;
                },
                success: (response: string) => {
                    // Remove namespace
                    response = response.replace(/<([a-zA-Z0-9 ]+)(?:xml)ns=\".*\"(.*)>/g, "<$1$2>");

                    // Get window element
                    windowXml = $($.parseXML(response)).find('window');
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

            // Load views / templates

            // Create window
            this.window = new xp.Ui.Window(windowXml);

            // Replace body
            $('body').replaceWith(this.window.domElement);
        }
    }

    /**
     * Base application config.
     */
    export interface AppConfig {
        windowHref?: string;
    }
} 