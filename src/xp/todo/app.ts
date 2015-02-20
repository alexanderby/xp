module Todo {
    export class App {
        window: xp.UI.Window;
    }
}

var todoApp: Todo.App;

window.onload = () => {
    todoApp = new Todo.App();
    xp.UI.DIInstances.set(Todo.App, todoApp);

    console.log('BEFORE INIT');
    xp.UI.init(() => {
        console.log('BEFORE CREATE WINDOW');
        todoApp.window = new Todo.Main(todoApp);
    });
};
