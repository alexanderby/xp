module xp.Tests {
    Log.write(Log.HeatLevel.Info, Log.Domain.Test, 'Test: Binding manager. Start.');

    interface Person extends INotifier {
        name: string;
        city: City;
    }

    interface City extends INotifier {
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
    Log.write(Log.HeatLevel.Log, Log.Domain.Test, 'Test: Create binding manager.');
    var manager = new xp.BindingManager(target, 'cityName', new Scope(source), 'city.name', 'unknown');
    assertEqual(source.city.name, target.cityName);
    assertEqual(source['onPropertyChanged']['handlers'].length, 1);
    assertEqual(source.city['onPropertyChanged']['handlers'].length, 1);

    // Change name
    Log.write(Log.HeatLevel.Log, Log.Domain.Test, 'Test: Change name.');
    source.name = 'Ivan';
    Log.write(Log.HeatLevel.Log, Log.Domain.Test, source.name, 'Ivan');

    // Change city name
    Log.write(Log.HeatLevel.Log, Log.Domain.Test, 'Test: Change city name.');
    source.city.name = 'Moscow';
    Log.write(Log.HeatLevel.Log, Log.Domain.Test, source.city.name, 'Moscow');

    // Change city
    Log.write(Log.HeatLevel.Log, Log.Domain.Test, 'Test: Change city.');
    var oldCity = source.city;
    source.city = <any>{ name: 'Hoiniki' };
    assertEqual(source.city.name, 'Hoiniki');
    assertEqual(source['onPropertyChanged']['handlers'].length, 1);
    assertEqual(source.city['onPropertyChanged']['handlers'].length, 1);
    assertEqual(oldCity['onPropertyChanged']['handlers'].length, 0);

    // Change city to null
    Log.write(Log.HeatLevel.Log, Log.Domain.Test, 'Test: Change city to NULL.');
    source.city = null;
    assertEqual(target.cityName, 'unknown');

    // Revert city
    Log.write(Log.HeatLevel.Log, Log.Domain.Test, 'Test: Revert city.');
    source.city = oldCity;
    assertEqual(source.city.name, 'Moscow');
    assertEqual(target.cityName, 'Moscow');
    assertEqual(source['onPropertyChanged']['handlers'].length, 1);
    assertEqual(source.city['onPropertyChanged']['handlers'].length, 1);

    // Change source to null
    Log.write(Log.HeatLevel.Log, Log.Domain.Test, 'Test: Change source to NULL.');
    manager.resetWith(null);
    assertEqual(target.cityName, 'unknown');

    // Revert source
    Log.write(Log.HeatLevel.Log, Log.Domain.Test, 'Test: Revert source.');
    manager.resetWith(new Scope(source));
    assertEqual(source.city.name, 'Moscow');
    assertEqual(target.cityName, 'Moscow');
    assertEqual(source['onPropertyChanged']['handlers'].length, 1);
    assertEqual(source.city['onPropertyChanged']['handlers'].length, 1);


    //
    // The End

    Log.write(Log.HeatLevel.Info, Log.Domain.Test, 'Test: Binding manager. Finish.');
}