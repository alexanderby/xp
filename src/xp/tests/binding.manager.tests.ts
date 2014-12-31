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

    var source = <Person>xp.Binding.createNotifierFrom({
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
    assertEquals(source.onPropertyChanged['handlers'].length, 1);
    assertEquals(source.city.onPropertyChanged['handlers'].length, 1);

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
    assertEquals(source.onPropertyChanged['handlers'].length, 1);
    assertEquals(source.city.onPropertyChanged['handlers'].length, 1);
    assertEquals(oldCity.onPropertyChanged['handlers'].length, 0);


    //
    // The End

    console.info('Test: Binding manager. Finish.');
}