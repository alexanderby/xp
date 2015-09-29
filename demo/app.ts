/// <reference path="xp/typing/xp.d.ts"/>

// --- Models ---

class Student extends xp.Model {
    name: string;
    books: xp.ObservableCollection<Book>;
    constructor() {
        super();
        // NOTE: xp properties definition.
        // These properties will invoke model's "onPropertyChanged" event
        // when the change occurs.
        // ES7 Decorators may be used in future to avoid
        // defining observable properties in constructor.
        xp.Model.property(this, 'name');
        xp.Model.property(this, 'books', new xp.ObservableCollection());
    }
}

interface Book {
    title: string;
}


// --- Some random application ---

class App extends xp.Model {
    student: Student;
    window: AppWindow;

    constructor() {
        super();
        xp.Model.property(this, 'student');
    }

    start() {
        this.reloadData();
        
        // Create window
        this.window = new AppWindow(this);
    }

    reloadData() {
        // NOTE: "__xp_model__" field is used
        // for restoring model by constructor name.
        var json = `
            {
                "name": "John",
                "__xp_model__": "Student",
                "books": [
                    { "title": "Maths" },
                    { "title": "Physics" }
                ]
            }
        `;
        // Deserialize data from JSON
        this.student = xp.deserialize(json, [Student]);
    }
}


// --- View ---

// NOTE: xp.Window is a wrapper over <body>.
// If your view mainly consists of HTML,
// you may inherit your root component from VBox
// and render it with "renderTo(domElement)" method.
class AppWindow extends xp.Window {
    private newBookTextBox: xp.TextBox;

    constructor(app: App) {
        super({ scope: app, title: '("xp demo - " + {student.name})', itemsAlign: 'center', padding: '2em' }, [
            new xp.VBox({ itemsIndent: '2em', width: '20em', contentAlign: 'middle' }, [
                // Title
                new xp.Label({ style: 'title', text: 'XP DEMO' }),
            
                // Student name
                new xp.HBox({ itemsIndent: '1em' }, [
                    new xp.Label({ text: 'student:' }),
                    new xp.TextBox({
                        placeholder: 'enter student name',
                        notifyOnKeyDown: true,
                        text: '{student.name}' // Bind name
                    })
                ]),
            
                // Add new book
                new xp.HBox({ itemsIndent: '1em' }, [
                    new xp.TextBox({
                        placeholder: 'enter book name',
                        onKeyDown: (e) => {
                            if (e.domEvent.keyCode === 13/*Enter*/) {
                                this.onAddBook();
                            }
                        },
                        init: (tb) => this.newBookTextBox = tb
                    }),
                    new xp.Button({
                        text: 'Add book',
                        onClick: (e) => {
                            this.onAddBook();
                        }
                    })
                ]),
            
                // List of books
                new xp.List({
                    items: '{student.books}',
                    itemId: 'book',
                    itemCreator: (item: Book) => new xp.HBox({ itemsIndent: '1em' }, [
                        new xp.Label({
                            text: '({student.books}.indexOf({book}) + 1)'
                        }),
                        new xp.Label({
                            text: '{book.title}'
                        }),
                        new xp.Placeholder(),
                        new xp.Button({
                            text: 'Delete',
                            onClick: (e) => {
                                app.student.books.splice(app.student.books.indexOf(item), 1);
                            }
                        })
                    ]),
                    height: '10em',
                    itemsIndent: '0.5em'
                }),
            
                // Expression
                new xp.Label({ text: '("Student name is " + {student.name} + ". He has " + {student.books.length} + " books.")' }),

                new xp.VBox({ itemsIndent: '0.5em' }, [
                    // Sort button
                    new xp.Button({
                        text: 'Sort',
                        onClick: (e) => app.student.books.sort((a, b) => {
                            return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
                        })
                    }),
                
                    // Reload button
                    new xp.Button({
                        text: 'Reload',
                        onClick: (e) => app.reloadData()
                    }),
                ]),

                // Custom component
                new BooksViewer({
                    books: '{student.books}'
                })
            ])
        ]);
        
        // Set focus
        this.newBookTextBox.focus();
    }

    // NOTE: You may choose another way of window appearance, eg. fade in.
    protected getTemplate() {
        // Clear body
        while (document.body.childElementCount > 0) {
            document.body.removeChild(document.body.lastElementChild);
        }
        return super.getTemplate();
    }

    private onAddBook() {
        var text = this.newBookTextBox.text.trim();
        if (!text) {
            xp.MessageBox.show('Please, enter book name', 'ERROR', { 'OK': () => this.newBookTextBox.focus() });
        } else {
            if (app.student.books.filter((b) => b.title === text).length > 0) {
                xp.MessageBox.show('There is already "' + text + '" book', 'ERROR', { 'OK': () => this.newBookTextBox.focus() });
            } else {
                app.student.books.push({
                    title: text
                });
                this.newBookTextBox.text = '';
                this.newBookTextBox.focus();
            }
        }
    }
}


// --- Custom component ---

// NOTE: For creating a component in most of the cases you may:
// 1. Override "getTemplate()" method to return HTML element.
// 2. Override "defineProperties()" to define how properties'
// values affect DOM.
// 3. Provide component's Markup interface.
class BooksViewer extends xp.Element {
    books: xp.ObservableCollection<Book>;
    constructor(markup?: BooksViewerMarkup) {
        super(markup);
    }

    protected getTemplate() {
        return xp.Dom.create(`
            <div class="BooksViewer">
              <div class="title">Books viewer</div>
              <div class="content"></div>
            </div>
            `, {
                '.content': (el) => this.contentElement = el
            });
    }
    private contentElement: HTMLElement;

    protected defineProperties() {
        super.defineProperties();
        
        // Define property "books"
        var booksChangeRegistrar = new xp.EventRegistrar();
        this.defineProperty('books', {
            setter: (books: xp.ObservableCollection<Book>) => {
                var content = this.contentElement;
                
                // Unsubscribe from previous collection changes
                booksChangeRegistrar.unsubscribeAll();
                // Remove old items
                while (content.lastElementChild) {
                    content.removeChild(content.lastElementChild);
                }

                if (books) {
                    // Add new books
                    var addBook = (title: string, index?: number) => {
                        var bookEl = document.createElement('div');
                        function random() { return Math.round(Math.random() * 255); }
                        bookEl.style.color = `rgb(${random() },${random() },${random() })`;
                        bookEl.style.backgroundColor = `rgb(${random() },${random() },${random() })`;
                        bookEl.textContent = title;
                        if (index === void (0) || index === content.childElementCount) {
                            content.appendChild(bookEl);
                        } else {
                            content.insertBefore(bookEl, content.children.item(index));
                        }
                    };
                    books.forEach((b) => addBook(b.title));
                
                    // Handle collection changes
                    // NOTE: "Attach" and "detach" actions signalize that collection item
                    // is not removed, but moved to another collection and that node
                    // should not be deleted, but moved.
                    booksChangeRegistrar.subscribe(books.onCollectionChanged, (args) => {
                        switch (args.action) {
                            case xp.CollectionChangeAction.Create:
                            case xp.CollectionChangeAction.Attach:
                                addBook(args.newItem.title, args.newIndex);
                                break;

                            case xp.CollectionChangeAction.Delete:
                            case xp.CollectionChangeAction.Detach:
                                var item = this.contentElement.children.item(args.oldIndex);
                                this.contentElement.removeChild(item);
                                break;

                            case xp.CollectionChangeAction.Move:
                                var moved = content.children.item(args.oldIndex);
                                var after = content.children.item(
                                    args.newIndex < args.oldIndex ?
                                        args.newIndex
                                        : args.newIndex + 1);
                                this.contentElement.insertBefore(moved, after);
                                break;

                            case xp.CollectionChangeAction.Replace:
                                var oldItem = this.contentElement.children.item(args.oldIndex);
                                this.contentElement.removeChild(oldItem);
                                addBook(args.newItem.title, args.newIndex);
                                break;

                            default:
                                throw new Error('Action is not implemented.');
                        }
                    });
                }
            }
        });
    }
}
interface BooksViewerMarkup extends xp.ElementMarkup<BooksViewer> {
    books?: xp.ObservableCollection<Book>|string; // string "{*}" is used for binding
}


// --- Start app ---

var app: App;
window.onload = () => {
    app = new App();
    app.start();
};