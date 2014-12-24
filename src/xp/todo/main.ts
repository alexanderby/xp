module Todo {
    interface TodoItem {
        name: string;
        isDone: boolean;
    }

    export class Main extends xp.UI.Window {
        constructor(xml) {
            super(xml);

            this.textbox.onTextChanged.addHandler((args) => {
                if (args.newValue) {
                    this.addItem(args.newValue);
                    this.textbox.text = '';
                }
            }, this);

            this.data = {
                todos: new xp.Binding.ObservableCollection<TodoItem>(),
                undone: 0
            };
            this.context = this.data;
        }

        //---------
        // Controls
        //---------

        private onDeleteButtonClick(args: xp.UI.UIEventArgs) {
            alert('Delete');
        }

        private textbox: xp.UI.TextBox;
        private list: xp.UI.List;
        private button_ClearCompleted: xp.UI.Button;

        //----------------
        // Data management
        //----------------

        private data: {
            todos: TodoItem[];
        }

        private addItem(name: string) {
            var item: TodoItem = {
                name: name,
                isDone: false
            };
            this.data.todos.push(item);
        }

        private removeItem(index: number) {
            this.data.todos.splice(index, 1);
        }
    }
    xp.UI.Tags['window'] = Main;
} 