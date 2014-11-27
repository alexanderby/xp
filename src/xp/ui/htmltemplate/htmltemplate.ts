module xp.Ui {
    // TODO: Async?
    /**
     * Synchronously loads and parses HTML from file.
     * @param href URL of markup file.
     * @param templateId If specified, template with given ID is returned. In other case first template is returned.
     * @return HTML template.
     */
    export function loadHtmlTemplateSync(url: string, templateId?: string): JQuery {
        var template: JQuery;

        $.ajax({
            url: url,
            dataType: 'text',
            async: false,
            error: (req, text, err) => {
                throw err;
            },
            success: (response: string) => {
                // Get template
                var html = $.parseHTML(response);
                html.forEach((node:Node) => {
                    if(node.
                });
                var allTemplates = $($.parseHTML(response)).find('template');
                if (templateId) {
                    template = allTemplates.find('#' + templateId);
                }
                else {
                    template = allTemplates.first();
                }
            }
        });

        //var doc = $('<div>')
        //doc.load(url);
        //var allTemplates = doc.find('template');
        //if (templateId) {
        //    template = allTemplates.find('#' + templateId);
        //}
        //else {
        //    template = allTemplates.first();
        //}

        return template;
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
                response = response.replace(/<([a-zA-Z0-9 ]+)(?:xml)ns=\".*\"(.*)>/g, "<$1$2>");

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