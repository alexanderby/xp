﻿module Todo {
    interface TodoItem {
        name: string;
        isDone: boolean;
    }

    export class Main extends xp.UI.Window {
        constructor(xml) {
            super(xml);

            this.data = xp.Binding.createNotifierFrom({
                todos: new Array<TodoItem>(),
                selected: null
            });
            this.scope = new xp.Binding.Scope(this.data);
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

        private onDoneToggle(args: xp.UI.CheckChangeArgs) {
            //this.undone = this.data.todos.filter((t) => !t.isDone).length;
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
    xp.UI.Tags['Window'] = Main;
} 