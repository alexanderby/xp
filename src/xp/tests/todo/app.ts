module Todo {
    export class App {
        window: xp.UI.Window;
    }
}

var todoApp: Todo.App;

window.onload = () => {
    todoApp = new Todo.App();
    xp.UI.DIInstances.set(Todo.App, todoApp);

    xp.UI.init(() => {
        todoApp.window = new Todo.Main(todoApp);
    });
};
