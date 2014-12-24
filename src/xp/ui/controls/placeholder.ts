module xp.Ui {
    /**
     * Dummy placeholder.
     */
    export class Placeholder extends Element {

        protected getTemplate(): JQuery {
            return $('<span class="placeholder">&nbsp;</span>');
        }

        setDefaults() {
            super.setDefaults();
            this.width = '100%';
            this.height = '100%';
        }

    }
    Tags['placeholder'] = Placeholder;
}