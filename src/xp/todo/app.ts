var app: xp.Application;
var controller: Controller;

window.onload = () => {
    app = new xp.Application({
        windowHref: 'view/window.xml'
    });

    app.start();
    controller = new Controller(app);
};

interface TodoItem {
    name: string;
    isDone: boolean;
}

class Controller {
    constructor(private app: xp.Application) {
        this.initControls();
        this.data = {
            todos: new xp.Binding.ObservableCollection<TodoItem>()
        };
        this.app.window.context = this.data;
    }

    //---------
    // Controls
    //---------

    private initControls() {
        this.textbox = <xp.Ui.TextBox>this.app.window.findElement('#textbox');
        var token = false;
        this.textbox.onTextChanged.addHandler((args) => {
            if (args.newValue) {
                this.addItem(args.newValue);
                this.textbox.text = '';
            }
        }, this);

        this.list = <xp.Ui.List>this.app.window.findElement('#list');
        this.button_ClearCompleted = <xp.Ui.Button>this.app.window.findElement('#button_ClearCompleted');
    }

    private textbox: xp.Ui.TextBox;
    private list: xp.Ui.List;
    private button_ClearCompleted: xp.Ui.Button;


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