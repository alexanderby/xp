module xp.Tests {
    Log.write(Log.HeatLevel.Info, Log.Domain.Test, 'Test: Model. Start.');

    //
    // Define models classes

    class Person extends xp.Model {
        name: string;
        city: City;
        books: Book[];
        constructor() {
            super();
            xp.Model.simpleProperty(this, 'name');
            xp.Model.modelProperty(this, 'city', City);
            xp.Model.modelCollection(this, 'books', Book, []);
        }
    }

    class City extends xp.Model {
        name: string;
        constructor() {
            super();
            xp.Model.simpleProperty(this, 'name');
        }
    }

    class Book extends xp.Model {
        title: string;
        pages: number;
        constructor() {
            super();
            xp.Model.simpleProperty(this, 'title');
            xp.Model.simpleProperty(this, 'pages');
        }
    }

    //
    // Create source

    var source = {
        name: 'John',
        city: {
            name: 'New York'
        },
        books: [
            { title: 'Maths', pages: 144 },
            { title: 'Physics', pages: 256 }
        ]
    };
    var json = JSON.stringify(source);

    //
    // Parse model

    var model = xp.Model.parseModel(Person, json);
    assert(json === JSON.stringify(model));
    assert(model instanceof Person);
    assert(model.city instanceof City);
    assert(model.books instanceof ModelCollection);
    assert(model.books[0] instanceof Book);
    assert(model.books[1] instanceof Book);

    //
    // The End

    Log.write(Log.HeatLevel.Info, Log.Domain.Test, 'Test: Model. Finish.');
}