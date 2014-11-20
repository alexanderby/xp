module xp {
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
            // Load window
            $.ajax({
                url: this.windowHref,
                dataType: 'text',
                async: false,
                error: (req, text, err) => {
                    alert(text);
                },
                success: (response) => {
                    var window = $($.parseXML(response)).find('window');
                    alert(window.children().length);
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

            // Load views

            // Replace body
        }
    }

    export interface AppConfig {
        windowHref?: string;
    }
} 