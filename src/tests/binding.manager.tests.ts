/// <reference path="../utils/log.ts"/>
/// <reference path="../data/observable_object.ts"/>
/// <reference path="../data/binding_manager.ts"/>
/// <reference path="../data/observable.ts"/>
/// <reference path="../data/observable_collection.ts"/>
/// <reference path="assert.ts"/>

module xp.Tests {
    Log.write(Log.HeatLevel.Info, Log.Domain.Test, 'Test: Binding manager. Start.');

    interface Person extends Notifier {
        name: string;
        city: City;
    }

    interface City extends Notifier {
        name: string;
    }

    //
    // Create

    var source = xp.observable({
        name: 'John',
        city: {
            name: 'New York'
        }
    });

    var target = {
        cityName: null
    };

    // Create manager
    var manager = new xp.BindingManager({
        scope: source,
        path: 'city.name',
        setter: (v) => target.cityName = v,
        getter: () => target.cityName,
        defaultValue: 'unknown'
    });
    assertEqual(source.city.name, target.cityName);
    assertEqual(source['onPropertyChanged']['handlers'].length, 1);
    assertEqual(source.city['onPropertyChanged']['handlers'].length, 1);

    // Change name
    source.name = 'Ivan';

    // Change city name
    source.city.name = 'Moscow';

    // Change city
    var oldCity = source.city;
    source.city = <any>{ name: 'Hoiniki' };
    assertEqual(source.city.name, 'Hoiniki');
    assertEqual(source['onPropertyChanged']['handlers'].length, 1);
    assertEqual(source.city['onPropertyChanged']['handlers'].length, 1);
    assertEqual(oldCity['onPropertyChanged']['handlers'].length, 0);

    // Change city to null
    source.city = null;
    assertEqual(target.cityName, 'unknown');

    // Revert city
    source.city = oldCity;
    assertEqual(source.city.name, 'Moscow');
    assertEqual(target.cityName, 'Moscow');
    assertEqual(source['onPropertyChanged']['handlers'].length, 1);
    assertEqual(source.city['onPropertyChanged']['handlers'].length, 1);

    // Change source to null
    manager.resetWith(null);
    assertEqual(target.cityName, 'unknown');

    // Revert source
    manager.resetWith(source);
    assertEqual(source.city.name, 'Moscow');
    assertEqual(target.cityName, 'Moscow');
    assertEqual(source['onPropertyChanged']['handlers'].length, 1);
    assertEqual(source.city['onPropertyChanged']['handlers'].length, 1);

    // Nested object replacement
    var obs = xp.observable({ x: { y: { z: 1 } } });
    var num: number;
    var b = new BindingManager({
        scope: obs,
        path: 'x.y.z',
        setter: (v) => num = v || 0
    });
    assertEqual(num, 1);
    obs.x = void 0;
    assertEqual(num, 0);
    obs.x = { y: { z: 2 } };
    assertEqual(num, 2);


    //
    // The End

    Log.write(Log.HeatLevel.Info, Log.Domain.Test, 'Test: Binding manager. Finish.');
}