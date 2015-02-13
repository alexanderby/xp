module xp.Binding.Tests {
    console.info('Test: Binding manager. Start.');

    interface Person extends INotifier {
        name: string;
        city: City;
    }

    interface City extends INotifier {
        name: string;
    }

    //
    // Create

    var source = xp.Binding.observable({
        name: 'John',
        city: {
            name: 'New York'
        }
    });

    var target = {
        cityName: null
    };

    // Create manager
    console.log('Test: Create binding manager.');
    var manager = new xp.Binding.BindingManager(target, 'cityName', source, 'city.name', 'unknown');
    assertEquals(source.city.name, target.cityName);
    assertEquals(source['onPropertyChanged']['handlers'].length, 1);
    assertEquals(source.city['onPropertyChanged']['handlers'].length, 1);

    // Change name
    console.log('Test: Change name.');
    source.name = 'Ivan';
    assertEquals(source.name, 'Ivan');

    // Change city name
    console.log('Test: Change city name.');
    source.city.name = 'Moscow';
    assertEquals(source.city.name, 'Moscow');

    // Change city
    console.log('Test: Change city.');
    var oldCity = source.city;
    source.city = <any>{ name: 'Hoiniki' };
    assertEquals(source.city.name, 'Hoiniki');
    assertEquals(source['onPropertyChanged']['handlers'].length, 1);
    assertEquals(source.city['onPropertyChanged']['handlers'].length, 1);
    assertEquals(oldCity['onPropertyChanged']['handlers'].length, 0);

    // Change city to null
    console.log('Test: Change city to NULL.');
    source.city = null;
    assertEquals(target.cityName, 'unknown');

    // Revert city
    console.log('Test: Revert city.');
    source.city = oldCity;
    assertEquals(source.city.name, 'Moscow');
    assertEquals(target.cityName, 'Moscow');
    assertEquals(source['onPropertyChanged']['handlers'].length, 1);
    assertEquals(source.city['onPropertyChanged']['handlers'].length, 1);

    // Change source to null
    console.log('Test: Change source to NULL.');
    manager.resetWith(null);
    assertEquals(target.cityName, 'unknown');

    // Revert source
    console.log('Test: Revert source.');
    manager.resetWith(source);
    assertEquals(source.city.name, 'Moscow');
    assertEquals(target.cityName, 'Moscow');
    assertEquals(source['onPropertyChanged']['handlers'].length, 1);
    assertEquals(source.city['onPropertyChanged']['handlers'].length, 1);


    //
    // The End

    console.info('Test: Binding manager. Finish.');
}