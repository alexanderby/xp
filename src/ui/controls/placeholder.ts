﻿module xp.UI {
    /**
     * Dummy placeholder.
     */
    export class Placeholder extends Element {

        protected getTemplate(): HTMLElement {
            return Dom.create('<span class="Placeholder">&nbsp;</span>');
        }

        setDefaults() {
            super.setDefaults();
            this.width = '100%';
            this.height = '100%';
        }

    }

    //---------------
    // MARKUP PARSING
    //---------------

    MarkupParseInfo['Placeholder'] = {
        ctor: Placeholder,
        parser: new ElementMarkupParser<Placeholder>()
    };
}