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
                var output = $('<output>').append($.parseHTML(response));
                var allTemplates = output.find('template');
                if (!allTemplates || allTemplates.length === 0) {
                    throw new Error('No templates found at "' + url + '".');
                }
                if (templateId) {
                    template = output.find('template#' + templateId);
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

        template = $(document.importNode((<any>template.get(0)).content, true));
        console.log(template);

        return template;
    }
} 