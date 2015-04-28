module Todo {
    interface TodoItem {
        name: string;
        isDone: boolean;
    }

    export class Window extends xp.UI.Window {

        constructor(app: App) {
            super();

            console.info('Main dependency (app):');
            console.log(app);

            this.data = xp.observable({
                todos: [],
                selected: null,
                filter: 'All',
                undone: [],
                done: []
            });
            this.scope = new xp.Scope(this.data);

            this.textbox.focus();

            this.domElement.addEventListener('contextmenu',(e) => {
                e.preventDefault();
                xp.UI.ContextMenu.show(e.pageX, e.pageY, [{
                    text: 'Copy',
                    action: () => alert('copy')
                }, {
                        text: 'Paste',
                        action: () => alert('paste'),
                        key: 'Ctrl+V'
                    }, {
                        text: 'Delete',
                        action: () => alert('delete'),
                        disabled: true,
                        icon: '../layout/icon-16-white.svg',
                        key: 'Del'
                    }]);
            });
        }

        //---------
        // Controls
        //---------
        
        private onDeleteClick(args: xp.UI.EventArgs<MouseEvent>) {
            var index = this.data.todos.indexOf(args.element.scope['t']); // Hmm...
            if (index >= 0) {
                this.removeItem(index);
            }
        }

        private onClearDoneClick(args: xp.UI.EventArgs<MouseEvent>) {
            for (var i = this.data.todos.length - 1; i >= 0; i--) {
                if (this.data.todos[i].isDone) {
                    this.removeItem(i);
                }
            }
        }

        private onTextInput(args: xp.UI.TextChangeArgs) {
            if (args.newText) {
                this.addItem(args.newText);
                this.textbox.text = '';
            }
        }

        private refreshFiltered() {
            this.data.undone = this.data.todos.filter((t) => !t.isDone);
            this.data.done = this.data.todos.filter((t) => t.isDone);
        }

        private onDoneToggle(args: xp.UI.CheckChangeArgs) {
            this.refreshFiltered();
        }

        private textbox: xp.UI.TextBox;
        private list: xp.UI.List;
        private button_ClearCompleted: xp.UI.Button;

        //----------------
        // Data management
        //----------------

        private data: {
            todos: TodoItem[];
            undone: TodoItem[];
            done: TodoItem[];
            filter: string;
        }

        private addItem(name: string) {
            var item: TodoItem = {
                name: name,
                isDone: false
            };
            this.data.todos.push(item);
            this.refreshFiltered();
        }

        private removeItem(index: number) {
            this.data.todos.splice(index, 1);
            this.refreshFiltered();
        }
    }

    xp.UI.MarkupParseInfo['Window'] = {
        ctor: Window,
        parser: new xp.UI.WindowMarkupParser(),
        markupUrl: 'view/window.xml',
        dependencies: [App]
    };


    xp.UI.ElementMarkupParser.extendAttributeMap(xp.UI.RadioButtonMarkupParser, {
        'tooltip': {
            '*': (v) => (el) => el.domElement.setAttribute('title', v)
        }
    });
}

// TODO: Do not use XML.
//module xp.newUI {
//    interface ElementMarkup {
//        width?: string;
//        height?: string;
//    }

//    class Element extends xp.Model implements ElementMarkup {
//        width: string;
//        height: string;

//        constructor(markup?: ElementMarkup) {
//            super();
//            this.initElement();
//            if (markup) {
//                this.applyMarkup(markup);
//            }
//        }

//        protected initElement() {
//            this.defineProperties();
//        }

//        domElement: HTMLElement;
//        protected getTemplate() {
//            return '<div></div>';
//        }
//        protected defineProperties() {
//            this.defineProperty('width', {
//                setter: (v) => this.domElement.style.width = v
//            });
//            this.defineProperty('height', {
//                setter: (v) => this.domElement.style.height = v
//            });
//        }
//        protected defineProperty(name: string, options: ElementPropertyOptions) {
//            //if(options
//        }
//        applyMarkup(markup: ElementMarkup) {
//            for (var key in markup) {
//                this[key] = markup[key];
//            }
//        }
//    }

//    interface ElementPropertyOptions {
//        setter?: (v) => void;
//        acceptedValues?: any[];
//        bindable?: boolean;
//        observable?: boolean;
//    }

//    interface ButtonMarkup extends ElementMarkup {
//        text?: string;
//        icon?: string;
//    }

//    class Button extends Element implements ButtonMarkup {
//        text: string;
//        icon: string;

//        constructor(markup: ButtonMarkup) {
//            super(markup);
//        }

//        protected defineProperties() {
//            super.defineProperties();
//            this.defineProperty('text', { setter: (v) => this.domElement.textContent = v });
//            this.defineProperty('icon', { setter: (v) => this.domElement.textContent = v });
//        }
//    }

//    interface ContainerMarkup {
//        alignItems?: string;
//        alignContent?: string;
//        children?: Element[];
//    }

//    class Container extends Element implements ContainerMarkup {
//        alignItems: string;
//        alignContent: string;
//        children: Element[];

//        constructor(markup?: ContainerMarkup, children?: Element[]) {
//            super(markup);
//            if (children) {
//                Array.prototype.push.apply(this.children, children);
//            }
//        }

//        protected initElement() {
//            this.children = [];
//            this.defineProperties();
//        }
//    }


//    var box = new Container({ alignContent: 'center', alignItems: 'stretch' }, [
//        new Container({}, [
//            new Button({ text: 'Click me' }),
//            new Button({ text: 'Button 1' })
//        ])
//    ]);
//}