# Extensible presentation
**xp** is a TypeScript MVVM framework designed for use in large web applications that consist of many specific components.

# Features
- Strongly typed controls
- Strongly typed models
- Powerful data binding
- JavaScript markup
- Flexible box layout
- Customizable style sheet
- No directives, providers and other bull$#!t

# Samples
For some code sample see [Dark Reader's popup page](https://github.com/alexanderby/darkreader/tree/master/src/popup/ui) or [simple demo](http://alexanderby.github.io/xp/demo/) below.

### HTML

``` html
<html>
	<head>
		<title>No title</title>
		<script src="xp/xp.js"></script>
		<script src="app.js"></script>
		<link rel="stylesheet" href="style.css" />
	</head>
	<body>
		<div>Empty</div>
	</body>

</html>
```

### LESS

``` less
@import "xp/style/_variables.less";
@import "xp/style/_xp.less";

// Override value
@color-control-back:#345;
@color-control-hover:#357;
@color-control-active:#379;

.BooksViewer{
	.title{
		color: #d42;
	}
	.content{
		background-color: white;
	}
}
```

### TypeScript

``` typescript
/// <reference path="xp/typing/xp.d.ts"/>

// --- Models ---

class Student extends xp.Model {
	name: string;
	books: xp.ObservableCollection<Book>;
	constructor() {
		super();
		xp.Model.property(this, 'name');
		xp.Model.property(this, 'books', new xp.ObservableCollection());
	}
}

interface Book {
	title: string;
}


// --- Some application ---

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
		// Deserialize data from JSON
		var json = this.getJsonData();
		this.student = xp.deserialize(json, [Student]);
	}
	
	// Returns string JSON data
	private getJsonData(): string {
		return JSON.stringify({
			name: 'John',
			__xp_model__: 'Student', // Field for restoring model
			books: [
				{ title: 'Maths' },
				{ title: 'Physics' }
			]
		});
	}
}
xp.hidePrototypeProperties(App);


// --- View ---

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
						init: (tb) => this.newBookTextBox = tb
					}),
					new xp.Button({
						text: 'Add book',
						onClick: (e) => {
							var text = this.newBookTextBox.text.trim();
							if (!text) {
								xp.MessageBox.show('Please, enter book name', 'ERROR');
							} else {
								if (app.student.books.filter((b) => b.title === text).length > 0) {
									xp.MessageBox.show('There is already a ' + text + ' book name', 'ERROR');
								} else {
									app.student.books.push({
										title: text
									});
									this.newBookTextBox.text = '';
									this.newBookTextBox.focus();
								}
							}
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
							text: '{book.title}',
							flex: 'stretch'
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
				
				// Reload button
				new xp.Button({
					text: 'Reload',
					onClick: (e) => app.reloadData()
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

	protected getTemplate() {
		// Clear body
		while (document.body.childElementCount > 0) {
			document.body.removeChild(document.body.lastElementChild);
		}
		return super.getTemplate();
	}
}


// --- Custom control ---

class BooksViewer extends xp.Element {
	books: xp.ObservableCollection<Book>;
	constructor(markup?: BooksViewerMarkup) {
		super(markup);
	}
	protected contentElement: HTMLElement;
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
	protected defineProperties() {
		super.defineProperties();
		
		// Define property
		var booksChangeRegistrar = new xp.EventRegistrar();
		this.defineProperty('books', {
			setter: (books: xp.ObservableCollection<Book>) => {
				var content = this.contentElement;
				
				// Unsubscribe from previous collection changes
				booksChangeRegistrar.unsubscribeAll();
				while (content.lastElementChild) {
					content.removeChild(content.lastElementChild);
				}

				if (books) {
					// Add new books
					var addBook = (title: string) => {
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
					books.forEach((b) => addBook(b.title));
				
					// Handle collection changes
					booksChangeRegistrar.subscribe(books.onCollectionChanged, (args) => {
						switch (args.action) {
							case xp.CollectionChangeAction.Create:
								addBook(args.newItem.title);
								break;
							case xp.CollectionChangeAction.Delete:
								for (var i = 0; i < this.contentElement.children.length; i++) {
									var item = this.contentElement.children.item(i);
									if (item.textContent === args.oldItem.title) {
										this.contentElement.removeChild(item);
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
	}
}
interface BooksViewerMarkup extends xp.ElementMarkup<BooksViewer> {
	books?: string;
}


// --- Start app ---

var app: App;
window.onload = () => {
	app = new App();
	app.start();
};
```

# Welcome
**xp** is not complete. If you like the idea, please contribute.