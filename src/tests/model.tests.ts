﻿/// <reference path="../utils/log.ts"/>
/// <reference path="../data/model.ts"/>
/// <reference path="../data/object.ts"/>
/// <reference path="../data/serialization.ts"/>
/// <reference path="../data/observable.ts"/>
/// <reference path="../data/collection.ts"/>
/// <reference path="assert.ts"/>

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
            xp.Model.property(this, 'name');
            xp.Model.property(this, 'city');
            xp.Model.property(this, 'books', new xp.ObservableCollection());
        }
    }

    class City extends xp.Model {
        name: string;
        constructor() {
            super();
            xp.Model.property(this, 'name');
        }
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
            { title: 'Maths', pages: 144 },
            { title: 'Physics', pages: 256 }
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
    var j = xp.serialize(model, false);
    assert(j.indexOf('__xp_model__') < 0);

    //
    // The End

    Log.write(Log.HeatLevel.Info, Log.Domain.Test, 'Test: Model. Finish.');
}