/// <reference path="../../utils/log.ts"/>
/// <reference path="../../data/model.ts"/>
/// <reference path="../../data/observable_collection.ts"/>
/// <reference path="../../ui/controls/window.ts"/>

xp.Log.DisplayMessages = xp.Log.HeatLevel.Warn | xp.Log.Domain.Binding;

module Todo {
    //
    // ------Todo app ---------

    export class App extends xp.Model {
        window: xp.Window;

        @xp.property
        todos = new xp.ObservableCollection<TodoItem>();

        constructor() {
            super();
            this.window = new Todo.Window(this);
        }
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
