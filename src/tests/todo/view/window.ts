module Todo {
    interface TodoItem {
        name: string;
        isDone: boolean;
    }

    var squareIcon = '\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><path fill="white" d="M0,0 h16 v16 h-16 z"/></svg>\'';

    export class Window extends xp.Window {

        constructor(app: App) {
            super({ title: 'Test App', itemsAlign: 'center', padding: '0.5em', itemsIndent: '2em' }, [
                new xp.HBox({ width: '40em', itemsIndent: '2em', scrollBar: 'both' }, [
                    // MAIN TODO
                    new xp.VBox({ itemsIndent: '1em', flex: 'stretch', width: '50%' }, [
                        new xp.Label({ text: 'TODO APP', style: 'title' }),
                        new xp.HBox({ itemsIndent: '0.5em' }, [
                            new xp.Label({ text: 'Input:' }),
                            new xp.TextBox({
                                name: 'textbox', placeholder: 'What to do?', onTextChange: (e) => this.onTextInput(e)
                            })
                        ]),
                        new xp.List({
                            name: 'list', items: '{todos}', itemId: 't', height: '12em', itemsIndent: '0.5em',
                            itemCreator: () => new xp.HBox({
                                visible: '({filter}==="All" || ({t.isDone}&&{filter}==="Done") || (!{t.isDone}&&{filter}==="Undone"))'
                            }, [
                                    new xp.Label({ text: '({todos}.indexOf({t}) + 1)', margin: '0 1em 0 0' }),
                                    new xp.CheckBox({
                                        checked: '{t.isDone}', text: '{t.name}', onCheckChange: (e) => this.onDoneToggle(e)
                                    }),
                                    new xp.Placeholder(),
                                    new xp.Button({
                                        text: 'Delete', icon: squareIcon, onClick: (e) => this.onDeleteClick(e)
                                    })
                                ])
                        }),
                        new xp.HBox({}, [
                            new xp.Label({ text: '({undone.length} + " items left")' }),
                            new xp.Placeholder(),
                            new xp.Button({ text: 'Clear done', onClick: (e) => this.onClearDoneClick(e) })
                        ]),
                        new xp.HBox({}, [
                            new xp.Label({ text: 'view', margin: '0 0.5em 0 0' }),
                            new xp.ToggleButton({ text: 'All', item: 'All', selectedItem: '{filter}', flex: 'stretch', icon: squareIcon }),
                            new xp.ToggleButton({ text: 'Done', item: 'Done', selectedItem: '{filter}', flex: 'stretch' }),
                            new xp.ToggleButton({ text: 'Undone', item: 'Undone', selectedItem: '{filter}', flex: 'stretch' })
                        ])
                    ]),
                    // RESULTS
                    new xp.VBox({ name: 'view1', flex: 'stretch', width: '50%' }, [
                        new xp.HBox({ flex: 'stretch' }, [
                            new xp.VBox({ width: '50%' }, [
                                new xp.Label({ text: 'UNDONE', style: 'title' }),
                                new xp.List({
                                    items: '{undone}', flex: 'stretch',
                                    itemCreator: () => new xp.Label({ text: '{item.name}' })
                                })
                            ]),
                            new xp.VBox({ width: '50%' }, [
                                new xp.Label({ text: 'DONE', style: 'title' }),
                                new xp.List({
                                    items: '{done}', flex: 'stretch',
                                    itemCreator: () => new xp.Label({ text: '{item.name}' })
                                })
                            ])
                        ])
                    ])
                ]),
                // LINE
                new xp.Html({
                    width: '40em', height: '0.0625em', html: `
                    <div style="background-color:#aaa;"></div>
                `}),
                // EXPERIMENTS
                new xp.VBox({ width: '10em' }, [
                    new xp.Label({ text: 'Item 0', style: 'title' }),
                    new xp.TextBox({ text: '{todos[0].name}', name: 'tb0', notifyOnKeyDown: true }),
                    new xp.CheckBox({ text: 'Check', checked: '{todos[0].isDone}', name: 'cb0' })
                ]),
                new xp.VBox({ width: '10em' }, [
                    new xp.Label({ text: 'Selected', style: 'title' }),
                    new xp.TextBox({ text: '{selected.name}', name: 'tb_selected', notifyOnKeyDown: true }),
                    new xp.List({
                        items: '{todos}',
                        itemCreator: () => new xp.RadioButton({
                            item: '{item}', text: '{item.name}', selectedItem: '{selected}',
                            initializer: (el) => el.bind((v: string) => el.domElement.setAttribute('title', v), 'item.name')
                        })
                    }),
                    new xp.List({
                        items: '{todos}',
                        itemCreator: () => new xp.ToggleButton({
                            item: '{item}', text: '{item.name}', selectedItem: '{selected}'
                        })
                    }),
                    new xp.Html({
                        width: '100%', html: `
                        <div style="background-color:#aaa;">
                             <span style="color:red;">Hello</span>
                             <span style="color:green;">World!</span>
                        </div>
                    `}),
                    new xp.Html({ width: '100%', url: 'view/div.html' }),
                    new xp.TextArea({ text: 'Text area' }),
                    new xp.TextBox({ type: 'number', min: 0, max: 1, step: 0.1 })
                ])
            ]);

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
                xp.ContextMenu.show(e.pageX, e.pageY, [{
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
        
        private onDeleteClick(args: xp.MouseEventArgs) {
            var index = this.data.todos.indexOf(args.element.scope['t']); // Hmm...
            if (index >= 0) {
                this.removeItem(index);
            }
        }

        private onClearDoneClick(args: xp.MouseEventArgs) {
            for (var i = this.data.todos.length - 1; i >= 0; i--) {
                if (this.data.todos[i].isDone) {
                    this.removeItem(i);
                }
            }
        }

        private onTextInput(args: xp.TextChangeArgs) {
            if (args.newText) {
                this.addItem(args.newText);
                this.textbox.text = '';
            }
        }

        private refreshFiltered() {
            this.data.undone = this.data.todos.filter((t) => !t.isDone);
            this.data.done = this.data.todos.filter((t) => t.isDone);
        }

        private onDoneToggle(args: xp.CheckChangeArgs) {
            this.refreshFiltered();
        }

        private textbox: xp.TextBox;
        private list: xp.List;
        private button_ClearCompleted: xp.Button;

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
    Window['isView'] = true;
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