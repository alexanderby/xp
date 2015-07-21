/// <reference path="xp/typing/xp.d.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
// --- Models ---
var Student = (function (_super) {
    __extends(Student, _super);
    function Student() {
        _super.call(this);
        xp.Model.property(this, 'name');
        xp.Model.property(this, 'books', new xp.ObservableCollection());
    }
    return Student;
})(xp.Model);
// --- Some application ---
var App = (function (_super) {
    __extends(App, _super);
    function App() {
        _super.call(this);
        xp.Model.property(this, 'student');
    }
    App.prototype.start = function () {
        this.reloadData();
        // Create window
        this.window = new AppWindow(this);
    };
    App.prototype.reloadData = function () {
        // Deserialize data from JSON
        var json = this.getJsonData();
        this.student = xp.deserialize(json, [Student]);
    };
    // Returns string JSON data
    App.prototype.getJsonData = function () {
        return JSON.stringify({
            name: 'John',
            __xp_model__: 'Student',
            books: [
                { title: 'Maths' },
                { title: 'Physics' }
            ]
        });
    };
    return App;
})(xp.Model);
xp.hidePrototypeProperties(App);
// --- View ---
var AppWindow = (function (_super) {
    __extends(AppWindow, _super);
    function AppWindow(app) {
        var _this = this;
        _super.call(this, { scope: app, title: '("xp demo - " + {student.name})', itemsAlign: 'center', padding: '2em' }, [
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
                        init: function (tb) { return _this.newBookTextBox = tb; }
                    }),
                    new xp.Button({
                        text: 'Add book',
                        onClick: function (e) {
                            var text = _this.newBookTextBox.text.trim();
                            if (!text) {
                                xp.MessageBox.show('Please, enter book name', 'ERROR');
                            }
                            else {
                                if (app.student.books.filter(function (b) { return b.title === text; }).length > 0) {
                                    xp.MessageBox.show('There is already "' + text + '" book', 'ERROR');
                                }
                                else {
                                    app.student.books.push({
                                        title: text
                                    });
                                    _this.newBookTextBox.text = '';
                                    _this.newBookTextBox.focus();
                                }
                            }
                        }
                    })
                ]),
                // List of books
                new xp.List({
                    items: '{student.books}',
                    itemId: 'book',
                    itemCreator: function (item) { return new xp.HBox({ itemsIndent: '1em' }, [
                        new xp.Label({
                            text: '({student.books}.indexOf({book}) + 1)'
                        }),
                        new xp.Label({
                            text: '{book.title}'
                        }),
                        new xp.Placeholder(),
                        new xp.Button({
                            text: 'Delete',
                            onClick: function (e) {
                                app.student.books.splice(app.student.books.indexOf(item), 1);
                            }
                        })
                    ]); },
                    height: '10em',
                    itemsIndent: '0.5em'
                }),
                // Expression
                new xp.Label({ text: '("Student name is " + {student.name} + ". He has " + {student.books.length} + " books.")' }),
                // Reload button
                new xp.Button({
                    text: 'Reload',
                    onClick: function (e) { return app.reloadData(); }
                }),
                // Custom control
                new BooksViewer({
                    books: '{student.books}'
                })
            ])
        ]);
        // Set focus
        this.newBookTextBox.focus();
    }
    AppWindow.prototype.getTemplate = function () {
        // Clear body
        while (document.body.childElementCount > 0) {
            document.body.removeChild(document.body.lastElementChild);
        }
        return _super.prototype.getTemplate.call(this);
    };
    return AppWindow;
})(xp.Window);
// --- Custom control ---
var BooksViewer = (function (_super) {
    __extends(BooksViewer, _super);
    function BooksViewer(markup) {
        _super.call(this, markup);
    }
    BooksViewer.prototype.getTemplate = function () {
        var _this = this;
        return xp.Dom.create("\n            <div class=\"BooksViewer\">\n              <div class=\"title\">Books viewer</div>\n              <div class=\"content\"></div>\n            </div>\n            ", {
            '.content': function (el) { return _this.contentElement = el; }
        });
    };
    BooksViewer.prototype.defineProperties = function () {
        var _this = this;
        _super.prototype.defineProperties.call(this);
        // Define property
        var booksChangeRegistrar = new xp.EventRegistrar();
        this.defineProperty('books', {
            setter: function (books) {
                var content = _this.contentElement;
                // Unsubscribe from previous collection changes
                booksChangeRegistrar.unsubscribeAll();
                while (content.lastElementChild) {
                    content.removeChild(content.lastElementChild);
                }
                if (books) {
                    // Add new books
                    var addBook = function (title) {
                        var bookEl = document.createElement('div');
                        bookEl.style.color = 'rgb('
                            + Math.round(Math.random() * 255) + ','
                            + Math.round(Math.random() * 255) + ','
                            + Math.round(Math.random() * 255) + ')';
                        bookEl.style.backgroundColor = 'rgb('
                            + Math.round(Math.random() * 255) + ','
                            + Math.round(Math.random() * 255) + ','
                            + Math.round(Math.random() * 255) + ')';
                        bookEl.textContent = title;
                        content.appendChild(bookEl);
                    };
                    books.forEach(function (b) { return addBook(b.title); });
                    // Handle collection changes
                    booksChangeRegistrar.subscribe(books.onCollectionChanged, function (args) {
                        switch (args.action) {
                            case xp.CollectionChangeAction.Create:
                                addBook(args.newItem.title);
                                break;
                            case xp.CollectionChangeAction.Delete:
                                for (var i = 0; i < _this.contentElement.children.length; i++) {
                                    var item = _this.contentElement.children.item(i);
                                    if (item.textContent === args.oldItem.title) {
                                        _this.contentElement.removeChild(item);
                                        break;
                                    }
                                }
                                break;
                            default:
                                throw new Error('Action is not implemented.');
                        }
                    });
                }
            }
        });
    };
    return BooksViewer;
})(xp.Element);
// --- Start app ---
var app;
window.onload = function () {
    app = new App();
    app.start();
};
//# sourceMappingURL=app.js.map