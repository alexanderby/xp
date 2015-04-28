module xp.ui {
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
}