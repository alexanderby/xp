module xp.UI {
    export class Label extends Element {

        //----
        // DOM
        //----

        protected getTemplate(): HTMLElement {
            return Dom.create('<label class="Label"></label>');
        }


        //-----------
        // PROPERTIES
        //-----------

        /**
         * Gets or sets label's text.
         */
        get text() {
            return this._text;
        }
        set text(text) {
            Log.write(Log.HeatLevel.Log, Log.Domain.UI, 'Set text: ' + text);
            this._text = text;

            // DOM
            this.domElement.textContent = text;
        }
        private _text: string;
    }


    //---------------
    // MARKUP PARSING
    //---------------

    export class LabelMarkupParser extends ElementMarkupParser<Label>{
        protected getAttributeMap(): AttributeMap<Label> {
            return extendAttributeMap(super.getAttributeMap(), {
                'text': {
                    '*': (value) => (el: Label) => el.text = value
                }
            });
        }
    }

    MarkupParseInfo['Label'] = {
        ctor: Label,
        parser: new LabelMarkupParser()
    };
} 