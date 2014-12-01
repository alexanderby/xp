module xp.Ui {
    /**
     * View.
     */
    export class View extends Stack {

        //----
        // DOM
        //----

        protected getTemplate(): JQuery {
            //return $('<div class="view stack"></div>');
            var template = $('<div class="view stack"><div class="content"></div></div>');
            return template;
        }


        protected processXml(xmlElement: JQuery) {
            // Load from external file, if 'href' attribute specified.
            var url: string = xmlElement.get(0).getAttribute('href');
            if (url) {
                xmlElement = xp.loadMarkupSync(url);
            }

            super.processXml(xmlElement);
        }
    }
    Tags['view'] = View;
} 