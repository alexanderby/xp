xp.Log.DisplayMessages = xp.Log.HeatLevel.Warn | xp.Log.Domain.Binding;

module Todo {
    export class App {
        window: xp.Window;
    }
}

var todoApp: Todo.App;

window.onload = () => {
    todoApp = new Todo.App();
    todoApp.window = new Todo.Window(todoApp);
};
