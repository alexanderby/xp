/// <reference path="../utils/log.ts"/>
/// <reference path="../data/model.ts"/>
/// <reference path="../data/observable_object.ts"/>
/// <reference path="../data/serialization.ts"/>
/// <reference path="../data/observable.ts"/>
/// <reference path="../data/observable_collection.ts"/>
/// <reference path="assert.ts"/>

module xp.Tests {
    Log.write(Log.HeatLevel.Info, Log.Domain.Test, 'Test: Model. Start.');

    //
    // Define models classes

    class Person extends xp.Model {
        @xp.property
        name: string;

        @xp.property
        city: City;

        @xp.property
        books = new xp.ObservableCollection<Book>();
    }

    class City extends xp.Model {
        @xp.property
        name: string;
    }

    interface Book {
        title: string;
        pages: number;
    }

    //
    // Create source

    var source = {
        __xp_model__: 'Person',
        name: 'John',
        city: {
            __xp_model__: 'City',
            name: 'New York'
        },
        books: [
            { title: 'Maths', pages: 144, __xp_model__: 'ObservableObject' },
            { title: 'Physics', pages: 256, __xp_model__: 'ObservableObject' }
        ]
    };
    var json = JSON.stringify(source);

    //
    // Parse model

    var model = xp.deserialize(json, [Person, City]);
    assert(model instanceof Person);
    assert(model.city instanceof City);
    assert(model.books instanceof ObservableCollection);
    assert(model.books[0] instanceof ObservableObject);
    assert(model.books[1] instanceof ObservableObject);
    var j = xp.serialize(model, { writeModel: false });
    assert(j.indexOf('__xp_model__') < 0);

    //
    // The End

    Log.write(Log.HeatLevel.Info, Log.Domain.Test, 'Test: Model. Finish.');
}