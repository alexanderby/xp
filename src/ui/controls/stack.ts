module xp.ui {
    export interface StackMarkup extends ContainerMarkup {
        itemsIndent?: string;
        scrollBar?: string;
        wrapping?: string;
    }

    /**
     * Base stack panel.
     */
    export /*abstract*/ class Stack extends Container {
        itemsIndent: string;
        scrollBar: string;
        wrapping: string;

        //-----------
        // PROPERTIES
        //-----------

        protected setDefaults() {
            super.setDefaults();
            this.itemsIndent = 'none';
            this.scrollBar = 'both';
            this.wrapping = 'nowrap';
        }

        protected defineProperties() {
            super.defineProperties();
            this.defineProperty('itemsIndent', {
                setter: (indent: string) => {
                    this.domElement.classList.remove('itemsIndent-05');
                    this.domElement.classList.remove('itemsIndent-1');
                    this.domElement.classList.remove('itemsIndent-2');
                    this.domElement.classList.remove('itemsIndent-4');

                    switch (indent) {
                        case 'none':
                            break;
                        case '0.5em':
                            this.domElement.classList.add('itemsIndent-05');
                            break;
                        case '1em':
                            this.domElement.classList.add('itemsIndent-1');
                            break;
                        case '2em':
                            this.domElement.classList.add('itemsIndent-2');
                            break;
                        case '4em':
                            this.domElement.classList.add('itemsIndent-4');
                            break;
                        default:
                            throw new Error('Unknown items indent value: ' + indent);
                    }
                },
                acceptedValues: ['none', '0.5em', '1em', '2em', '4em']
            });
            this.defineProperty('scrollBar', {
                setter: (scroll) => {
                    this.domElement.classList.remove('scrollBar-None');
                    this.domElement.classList.remove('scrollBar-Horizontal');
                    this.domElement.classList.remove('scrollBar-Vertical');
                    this.domElement.classList.remove('scrollBar-Both');
                    switch (scroll) {
                        case 'none':
                            this.domElement.classList.add('scrollBar-None');
                            break;
                        case 'horizontal':
                            this.domElement.classList.add('scrollBar-Horizontal');
                            break;
                        case 'vertical':
                            this.domElement.classList.add('scrollBar-Vertical');
                            break;
                        case 'both':
                            this.domElement.classList.add('scrollBar-Both');
                            break;
                        default:
                            throw new Error('Unknown scroll bar value: ' + scroll);
                    }
                },
                acceptedValues: ['none', 'horizontal', 'vertical', 'both']
            });
            this.defineProperty('wrapping', {
                setter: (wrap: string) => {
                    this.domElement.classList.remove('wrapping-NoWrap');
                    this.domElement.classList.remove('wrapping-Wrap');
                    switch (wrap) {
                        case 'nowrap':
                            this.domElement.classList.add('wrapping-NoWrap');
                            break;
                        case 'wrap':
                            this.domElement.classList.add('wrapping-Wrap');
                            break;
                        default:
                            throw new Error('Unknown wrapping value: ' + wrap);
                    }
                },
                acceptedValues: ['nowrap', 'wrap']
            });
        }
    }
} 