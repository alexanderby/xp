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
    var manager = new xp.BindingManager(target, 'cityName', source, 'city.name', 'unknown');
    assertEquals(source.city.name, target.cityName);
    assertEquals(source['onPropertyChanged']['handlers'].length, 1);
    assertEquals(source.city['onPropertyChanged']['handlers'].length, 1);

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
    assertEquals(source.city.name, 'Hoiniki');
    assertEquals(source['onPropertyChanged']['handlers'].length, 1);
    assertEquals(source.city['onPropertyChanged']['handlers'].length, 1);
    assertEquals(oldCity['onPropertyChanged']['handlers'].length, 0);

    // Change city to null
    Log.write(Log.HeatLevel.Log, Log.Domain.Test, 'Test: Change city to NULL.');
    source.city = null;
    assertEquals(target.cityName, 'unknown');

    // Revert city
    Log.write(Log.HeatLevel.Log, Log.Domain.Test, 'Test: Revert city.');
    source.city = oldCity;
    assertEquals(source.city.name, 'Moscow');
    assertEquals(target.cityName, 'Moscow');
    assertEquals(source['onPropertyChanged']['handlers'].length, 1);
    assertEquals(source.city['onPropertyChanged']['handlers'].length, 1);

    // Change source to null
    Log.write(Log.HeatLevel.Log, Log.Domain.Test, 'Test: Change source to NULL.');
    manager.resetWith(null);
    assertEquals(target.cityName, 'unknown');

    // Revert source
    Log.write(Log.HeatLevel.Log, Log.Domain.Test, 'Test: Revert source.');
    manager.resetWith(source);
    assertEquals(source.city.name, 'Moscow');
    assertEquals(target.cityName, 'Moscow');
    assertEquals(source['onPropertyChanged']['handlers'].length, 1);
    assertEquals(source.city['onPropertyChanged']['handlers'].length, 1);


    //
    // The End

    Log.write(Log.HeatLevel.Info, Log.Domain.Test, 'Test: Binding manager. Finish.');
}