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
        // NOTE: xp properties definition.
        // These properties will invoke model's "onPropertyChanged" event
        // when the change occurs.
        // ES7 Decorators may be used in future to avoid
        // defining observable properties in constructor.
        xp.Model.property(this, 'name');
        xp.Model.property(this, 'books', new xp.ObservableCollection());
    }
    return Student;
})(xp.Model);
// --- Some random application ---
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
        // NOTE: "__xp_model__" field is used
        // for restoring model by constructor name.
        var json = "\n            {\n                \"name\": \"John\",\n                \"__xp_model__\": \"Student\",\n                \"books\": [\n                    { \"title\": \"Maths\" },\n                    { \"title\": \"Physics\" }\n                ]\n            }\n        ";
        // Deserialize data from JSON
        this.student = xp.deserialize(json, [Student]);
    };
    return App;
})(xp.Model);
// --- View ---
// NOTE: xp.Window is a wrapper over <body>.
// If your view mainly consists of HTML,
// you may inherit your root component from VBox
// and render it with "renderTo(domElement)" method.
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
                        onKeyDown: function (e) {
                            if (e.domEvent.keyCode === 13 /*Enter*/) {
                                _this.onAddBook();
                            }
                        },
                        init: function (tb) { return _this.newBookTextBox = tb; }
                    }),
                    new xp.Button({
                        text: 'Add book',
                        onClick: function (e) {
                            _this.onAddBook();
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
                new xp.VBox({ itemsIndent: '0.5em' }, [
                    // Sort button
                    new xp.Button({
                        text: 'Sort',
                        onClick: function (e) { return app.student.books.sort(function (a, b) {
                            return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
                        }); }
                    }),
                    // Reload button
                    new xp.Button({
                        text: 'Reload',
                        onClick: function (e) { return app.reloadData(); }
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
    AppWindow.prototype.getTemplate = function () {
        // Clear body
        while (document.body.childElementCount > 0) {
            document.body.removeChild(document.body.lastElementChild);
        }
        return _super.prototype.getTemplate.call(this);
    };
    AppWindow.prototype.onAddBook = function () {
        var _this = this;
        var text = this.newBookTextBox.text.trim();
        if (!text) {
            xp.MessageBox.show('Please, enter book name', 'ERROR', { 'OK': function () { return _this.newBookTextBox.focus(); } });
        }
        else {
            if (app.student.books.filter(function (b) { return b.title === text; }).length > 0) {
                xp.MessageBox.show('There is already "' + text + '" book', 'ERROR', { 'OK': function () { return _this.newBookTextBox.focus(); } });
            }
            else {
                app.student.books.push({
                    title: text
                });
                this.newBookTextBox.text = '';
                this.newBookTextBox.focus();
            }
        }
    };
    return AppWindow;
})(xp.Window);
// --- Custom component ---
// NOTE: For creating a component in most of the cases you may:
// 1. Override "getTemplate()" method to return HTML element.
// 2. Override "defineProperties()" to define how properties'
// values affect DOM.
// 3. Provide component's Markup interface.
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
        // Define property "books"
        var booksChangeRegistrar = new xp.EventRegistrar();
        this.defineProperty('books', {
            setter: function (books) {
                var content = _this.contentElement;
                // Unsubscribe from previous collection changes
                booksChangeRegistrar.unsubscribeAll();
                // Remove old items
                while (content.lastElementChild) {
                    content.removeChild(content.lastElementChild);
                }
                if (books) {
                    // Add new books
                    var addBook = function (title, index) {
                        var bookEl = document.createElement('div');
                        function random() { return Math.round(Math.random() * 255); }
                        bookEl.style.color = "rgb(" + random() + "," + random() + "," + random() + ")";
                        bookEl.style.backgroundColor = "rgb(" + random() + "," + random() + "," + random() + ")";
                        bookEl.textContent = title;
                        if (index === void (0) || index === content.childElementCount) {
                            content.appendChild(bookEl);
                        }
                        else {
                            content.insertBefore(bookEl, content.children.item(index));
                        }
                    };
                    books.forEach(function (b) { return addBook(b.title); });
                    // Handle collection changes
                    // NOTE: "Attach" and "detach" actions signalize that collection item
                    // is not removed, but moved to another collection and that node
                    // should not be deleted, but moved.
                    booksChangeRegistrar.subscribe(books.onCollectionChanged, function (args) {
                        switch (args.action) {
                            case xp.CollectionChangeAction.Create:
                            case xp.CollectionChangeAction.Attach:
                                addBook(args.newItem.title, args.newIndex);
                                break;
                            case xp.CollectionChangeAction.Delete:
                            case xp.CollectionChangeAction.Detach:
                                var item = _this.contentElement.children.item(args.oldIndex);
                                _this.contentElement.removeChild(item);
                                break;
                            case xp.CollectionChangeAction.Move:
                                var moved = content.children.item(args.oldIndex);
                                var after = content.children.item(args.newIndex < args.oldIndex ?
                                    args.newIndex
                                    : args.newIndex + 1);
                                _this.contentElement.insertBefore(moved, after);
                                break;
                            case xp.CollectionChangeAction.Replace:
                                var oldItem = _this.contentElement.children.item(args.oldIndex);
                                _this.contentElement.removeChild(oldItem);
                                addBook(args.newItem.title, args.newIndex);
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