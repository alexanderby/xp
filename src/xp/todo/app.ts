var app: xp.Application;
//var controller: Controller;

window.onload = () => {
    app = new xp.Application({
        windowUrl: 'main.xml'
    });

    app.start();
    //controller = new Controller(app);
};



//class Controller {
//    constructor(private app: xp.Application) {
//        this.initControls();
//        this.data = {
//            todos: new xp.Binding.ObservableCollection<TodoItem>(),
//            undone: 0
//        };
//        this.app.window.context = this.data;
//    }

//    //---------
//    // Controls
//    //---------

//    private initControls() {
//        this.textbox = <xp.UI.TextBox>this.app.window.findElement('#textbox');
//        var token = false;
//        this.textbox.onTextChanged.addHandler((args) => {
//            if (args.newValue) {
//                this.addItem(args.newValue);
//                this.textbox.text = '';
//            }
//        }, this);

//        this.list = <xp.UI.List>this.app.window.findElement('#list');
//        this.button_ClearCompleted = <xp.UI.Button>this.app.window.findElement('#button_ClearCompleted');
//    }

//    private textbox: xp.UI.TextBox;
//    private list: xp.UI.List;
//    private button_ClearCompleted: xp.UI.Button;


//    //----------------
//    // Data management
//    //----------------

//    private data: {
//        todos: TodoItem[];
//    }

//    private addItem(name: string) {
//        var item: TodoItem = {
//            name: name,
//            isDone: false
//        };
//        this.data.todos.push(item);
//    }

//    private removeItem(index: number) {
//        this.data.todos.splice(index, 1);
//    }
//}