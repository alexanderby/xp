module xp {
    // TODO: Replace jQuery.

    /**
     * Application base.
     */
    export class Application {

        /**
         * Creates application.
         * param config Application config.
         */
        constructor(protected config: AppConfig) { }


        /**
         * Starts the application.
         */
        start() {
            if (RunningApp)
                throw new Error('Application is already running.');

            var markup = xp.loadMarkupSync(this.config.startupUrl);
            this.window = <xp.UI.Window>xp.UI.createElement(markup);
            this.window.renderTo('body');

            RunningApp = this;
        }


        /**
         * Application's window.
         */
        window: UI.Window;
    }

    /**
     * Base application config.
     */
    export interface AppConfig {
        startupUrl: string;
    }

    /**
     * Defines a constructor of type T instance.
     */
    export interface Constructor<T> {
        new (...args: any[]): T;
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
                console.warn('Unable to load markup from "' + url + '".');
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

    /**
     * Accesses the running app.
     */
    export var RunningApp: Application;
} 