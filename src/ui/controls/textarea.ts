module xp.ui {
    //export interface TextAreaMarkup extends ElementMarkup {
    //    text?: string;
    //    notifiOnKeyDown?: boolean;
    //    readonly?: boolean|string;
    //    placeholder?: string;
    //}

    /**
     * Text input.
     */
    export class TextArea extends TextBox {

        //constructor(markup: TextAreaMarkup) {
        //    super(markup);
        //}

        //----
        // DOM
        //----

        protected getTemplate(): HTMLElement {
            var template = Dom.create('<textarea class="TextArea TextBox" spellcheck="false"></textarea>');
            //template.attr('tabindex', TabIndex++);
            return template;
        }

        domElement: HTMLTextAreaElement;
    }
} 