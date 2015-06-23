module xp.Tests {
    Log.write(Log.HeatLevel.Info, Log.Domain.Test, 'Test: Observable collection. Start.');

    //
    // Create

    var collection = [
        { v: 1 },
        { v: 2 },
        { v: 3 }
    ];

    var nc = new ObservableCollection(collection);

    //
    // Subscribe

    nc.onCollectionChanged.addHandler((args) => {
        Log.write(Log.HeatLevel.Log, Log.Domain.Test, 'Test: Collection changed. Type: {0}, new index: {1}, old index: {2}, new item: {3}, old item: {4}.', CollectionChangeAction[args.action], args.newIndex, args.oldIndex, args.newItem, args.oldItem);
    }, window);
    nc.onPropertyChanged.addHandler((prop) => {
        Log.write(Log.HeatLevel.Log, Log.Domain.Test, 'Test: Collection property changed: "{0}".', prop);
    }, window);

    //
    // Process

    nc.push({ v: 4 }, { v: 5 });
    assertEqual(
        JSON.stringify(nc),
        JSON.stringify([{ v: 1 }, { v: 2 }, { v: 3 }, { v: 4 }, { v: 5 }]));

    nc.pop();
    assertEqual(
        JSON.stringify(nc),
        JSON.stringify([{ v: 1 }, { v: 2 }, { v: 3 }, { v: 4 }]));

    nc.shift();
    assertEqual(
        JSON.stringify(nc),
        JSON.stringify([{ v: 2 }, { v: 3 }, { v: 4 }]));

    nc.unshift({ v: 0 });
    assertEqual(
        JSON.stringify(nc),
        JSON.stringify([{ v: 0 }, { v: 2 }, { v: 3 }, { v: 4 }]));

    nc.splice(1, 2, { v: 7 }, { v: 8 });
    assertEqual(
        JSON.stringify(nc),
        JSON.stringify([{ v: 0 }, { v: 7 }, { v: 8 }, { v: 4 }]));

    nc[2] = { v: 9 };
    assertEqual(
        JSON.stringify(nc),
        JSON.stringify([{ v: 0 }, { v: 7 }, { v: 9 }, { v: 4 }]));

    nc.move(1, 3);
    assertEqual(
        JSON.stringify(nc),
        JSON.stringify([{ v: 0 }, { v: 9 }, { v: 4 }, { v: 7 }]));

    nc.sort((a, b) => a.v - b.v);
    assertEqual(
        JSON.stringify(nc),
        JSON.stringify([{ v: 0 }, { v: 4 }, { v: 7 }, { v: 9 }]));

    nc.reverse();
    assertEqual(
        JSON.stringify(nc),
        JSON.stringify([{ v: 9 }, { v: 7 }, { v: 4 }, { v: 0 }]));

    var t = nc.detach(2);
    assertEqual(
        JSON.stringify(nc),
        JSON.stringify([{ v: 9 }, { v: 7 }, { v: 0 }]));

    nc.attach(t, 2);
    assertEqual(
        JSON.stringify(nc),
        JSON.stringify([{ v: 9 }, { v: 7 }, { v: 4 }, { v: 0 }]));

    //
    // Check

    assertEqual(nc.length, 4);
    assertEqual(nc[0].v, 9);
    assertEqual(nc[1].v, 7);
    assertEqual(nc[2].v, 4);
    assertEqual(nc[3].v, 0);

    //
    // Index subscription

    var col = new xp.ObservableCollection([{ city: { name: 'Gomel' } }, { city: { name: 'Minsk' } }]);
    var name: string;
    var bm = new BindingCallManager(col, '0.city.name',(v) => name = v || 'Default');
    assertEqual(name, 'Gomel');
    col.splice(0, 1);
    assertEqual(name, 'Minsk');
    col.splice(0);
    assertEqual(name, 'Default');
    col.push({ city: { name: 'New York' } });
    assertEqual(name, 'New York');


    //
    // The End

    Log.write(Log.HeatLevel.Info, Log.Domain.Test, 'Test: Observable collection. Finish.');
}