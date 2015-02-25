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
        }

        //---------
        // Controls
        //---------

        private onDeleteClick(args: xp.UI.UIEventArgs) {
            var index = this.data.todos.indexOf(args.targetUIControl.scope.get('t')); // Hmm...
            if (index >= 0) {
                this.removeItem(index);
            }
        }

        private onClearDoneClick(args: xp.UI.UIEventArgs) {
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
} 