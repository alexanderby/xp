/// <reference path="../app.ts"/>
/// <reference path="../../../ui/uievent.ts"/>
/// <reference path="../../../ui/controls/element.ts"/>
/// <reference path="../../../ui/controls/container.ts"/>
/// <reference path="../../../ui/controls/stack.ts"/>
/// <reference path="../../../ui/controls/hbox.ts"/>
/// <reference path="../../../ui/controls/vbox.ts"/>
/// <reference path="../../../ui/controls/label.ts"/>
/// <reference path="../../../ui/controls/textbox.ts"/>
/// <reference path="../../../ui/controls/list.ts"/>
/// <reference path="../../../ui/controls/placeholder.ts"/>
/// <reference path="../../../ui/controls/button.ts"/>
/// <reference path="../../../ui/controls/togglebutton.ts"/>
/// <reference path="../../../ui/controls/html.ts"/>
/// <reference path="../../../ui/controls/textarea.ts"/>
/// <reference path="../../../ui/controls/checkbox.ts"/>
/// <reference path="../../../ui/controls/radiobutton.ts"/>
/// <reference path="../../../ui/controls/window.ts"/>
/// <reference path="../../../ui/controls/messagebox.ts"/>
/// <reference path="../../../ui/controls/contextmenu.ts"/>
/// <reference path="../../../data/observable.ts"/>
/// <reference path="../../../data/scope.ts"/>

module Todo {

    var squareIcon = '\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><path fill="white" d="M0,0 h16 v16 h-16 z"/></svg>\'';

    export class Window extends xp.Window {
        private app: App;

        constructor(app: App) {
            //
            // ------- Window markup ------------

            super({ title: 'Test App', itemsAlign: 'center', padding: '0.5em', itemsIndent: '2em' }, [
                new xp.HBox({ width: '40em', itemsIndent: '2em', scrollBar: 'both' }, [

                    //
                    // -------- Main TODO section -----------

                    new xp.VBox({ itemsIndent: '1em', flex: 'stretch', width: '50%' }, [
                        new xp.Label({ text: 'TODO APP', style: 'title' }),
                        new xp.HBox({ itemsIndent: '0.5em' }, [
                            new xp.Label({ text: 'Input:' }),
                            new xp.TextBox({
                                placeholder: 'What to do?', onTextChange: (e) => this.onTextInput(e),
                                init: (el) => this.textbox = el
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

                    //
                    // --------- Results section ----------

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

                //
                // ------- Line ---------

                new xp.Html({
                    width: '40em', height: '0.0625em', html: `
                    <div style="background-color:#aaa;"></div>
                `}),

                //
                // ------ Experiments -------

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
                            init: (el) => el.bind((v: string) => el.domElement.setAttribute('title', v), { path: 'item.name' })
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
                    new xp.Html({ width: '100%', url: 'ui/div.html' }),
                    new xp.TextArea({ text: 'Text area' }),
                    new xp.TextBox({ type: 'number', min: 0, max: 1, step: 0.1 })
                ])
            ]);

            //
            // -------- Set Window scope ---------

            this.app = app;

            this.data = xp.observable({
                selected: null,
                filter: 'All',
                undone: [],
                done: []
            });

            this.scope = new xp.Scope(this.data, this.app);

            //
            // -------- Focus at text box ---------

            this.textbox.focus();

            //
            // -------- Display context menu ---------

            this.domElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                xp.ContextMenu.show(e.pageX, e.pageY, [{
                    text: 'Copy',
                    action: () => xp.MessageBox.show('Trying to copy', 'MESSAGE')
                }, {
                        text: 'Paste',
                        action: () => xp.MessageBox.show('Trying to paste', 'MESSAGE'),
                        key: 'Ctrl+V'
                    }, {
                        text: 'Delete',
                        action: () => xp.MessageBox.show('Trying to delete', 'MESSAGE'),
                        disabled: true,
                        icon: squareIcon,
                        key: 'Del'
                    }]);
            });
        }

        //---------
        // Controls
        //---------

        private textbox: xp.TextBox;
        private list: xp.List;

        private onDeleteClick(args: xp.MouseEventArgs) {
            var index = this.app.todos.indexOf(args.element.scope['t']); // Hmm...
            if (index >= 0) {
                this.removeItem(index);
            }
        }

        private onClearDoneClick(args: xp.MouseEventArgs) {
            for (var i = this.app.todos.length - 1; i >= 0; i--) {
                if (this.app.todos[i].isDone) {
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
            this.data.undone = this.app.todos.filter((t) => !t.isDone);
            this.data.done = this.app.todos.filter((t) => t.isDone);
        }

        private onDoneToggle(args: xp.CheckChangeArgs) {
            this.refreshFiltered();
        }

        //----------------
        // Data management
        //----------------

        private data: {
            undone: TodoItem[];
            done: TodoItem[];
            filter: string;
        }

        private addItem(name: string) {
            var item: TodoItem = {
                name: name,
                isDone: false
            };
            this.app.todos.push(item);
            this.refreshFiltered();
        }

        private removeItem(index: number) {
            this.app.todos.splice(index, 1);
            this.refreshFiltered();
        }
    }
}