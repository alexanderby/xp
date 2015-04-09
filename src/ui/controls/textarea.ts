module xp.UI {
    /**
     * Text input.
     */
    export class TextArea extends TextBox {

        //----
        // DOM
        //----

        protected getTemplate(): HTMLElement {
            var template = Dom.create('<textarea class="TextArea TextBox" spellcheck="false"></textarea>');
            //template.attr('tabindex', TabIndex++);
            return template;
        }

        domElement: HTMLTextAreaElement;
        // Seems to unable to retrieve value
        //protected getDomElementValue(): string {
        //    return this.domElement.textContent;
        //}
        //protected setDomElementValue(value: string) {
        //    this.domElement.textContent = value;
        //}
    }


    //---------------
    // MARKUP PARSING
    //---------------

    export class TextAreaMarkupParser extends TextBoxMarkupParser {
        protected getAttributeMap(): AttributeMap<TextArea> {
            return extendAttributeMap(super.getAttributeMap(), {
                //'text': {
                //    '*': (value) => (el: TextBox) => el.text = value
                //},
                //'notifyOnKeydown': {
                //    'true': () => (el: TextBox) => el.notifyOnKeyDown = true,
                //    'false': () => (el: TextBox) => el.notifyOnKeyDown = false
                //},
                //'type': {
                //    'string': () => (el: TextBox) => el.type = TextBoxType.string,
                //    'number': () => (el: TextBox) => el.type = TextBoxType.number
                //},
                //'readonly': {
                //    'true': () => (el: TextBox) => el.readonly = true,
                //    'false': () => (el: TextBox) => el.readonly = false
                //},
                //'placeholder': {
                //    '*': (value) => (el: TextBox) => el.placeholder = value
                //},
                //'onTextChange': {
                //    '*': (value) => (el: TextBox) => el.registerUIHandler(el.onTextChange, value)
                //}
            });
        }
    }

    MarkupParseInfo['TextArea'] = {
        ctor: TextArea,
        parser: new TextAreaMarkupParser()
    };
} 