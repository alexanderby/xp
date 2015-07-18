/// <reference path="../../utils/log.ts"/>
/// <reference path="../../data/model.ts"/>
/// <reference path="../../data/collection.ts"/>
/// <reference path="../../ui/controls/window.ts"/>

xp.Log.DisplayMessages = xp.Log.HeatLevel.Warn | xp.Log.Domain.Binding;

module Todo {
    //
    // ------Todo app ---------

    export class App extends xp.Model {
        window: xp.Window;

        constructor() {
            super();
            xp.Model.property(this, 'todos', new xp.ObservableCollection());
            this.window = new Todo.Window(this);
        }

        todos: TodoItem[];
    }

    export interface TodoItem {
        name: string;
        isDone: boolean;
    }
}

var todoApp: Todo.App;

//
// ------ Start app -----

window.onload = () => {
    todoApp = new Todo.App();
};
