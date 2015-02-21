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
    Log.write(Log.HeatLevel.Log, Log.Domain.Test, nc);

    //
    // Process

    Log.write(Log.HeatLevel.Log, Log.Domain.Test, 'Test: Push.');
    nc.push({ v: 4 }, { v: 5 });
    Log.write(Log.HeatLevel.Log, Log.Domain.Test, nc);
    assertEqual(
        JSON.stringify(nc),
        JSON.stringify([{ v: 1 }, { v: 2 }, { v: 3 }, { v: 4 }, { v: 5 }]));

    Log.write(Log.HeatLevel.Log, Log.Domain.Test, 'Test: Pop.');
    nc.pop();
    Log.write(Log.HeatLevel.Log, Log.Domain.Test, nc);
    assertEqual(
        JSON.stringify(nc),
        JSON.stringify([{ v: 1 }, { v: 2 }, { v: 3 }, { v: 4 }]));

    Log.write(Log.HeatLevel.Log, Log.Domain.Test, 'Test: Shift.');
    nc.shift();
    Log.write(Log.HeatLevel.Log, Log.Domain.Test, nc);
    assertEqual(
        JSON.stringify(nc),
        JSON.stringify([{ v: 2 }, { v: 3 }, { v: 4 }]));

    Log.write(Log.HeatLevel.Log, Log.Domain.Test, 'Test: Unshift.');
    nc.unshift({ v: 0 });
    Log.write(Log.HeatLevel.Log, Log.Domain.Test, nc);
    assertEqual(
        JSON.stringify(nc),
        JSON.stringify([{ v: 0 }, { v: 2 }, { v: 3 }, { v: 4 }]));

    Log.write(Log.HeatLevel.Log, Log.Domain.Test, 'Test: Splice.');
    nc.splice(1, 2, { v: 7 }, { v: 8 });
    Log.write(Log.HeatLevel.Log, Log.Domain.Test, nc);
    assertEqual(
        JSON.stringify(nc),
        JSON.stringify([{ v: 0 }, { v: 7 }, { v: 8 }, { v: 4 }]));

    Log.write(Log.HeatLevel.Log, Log.Domain.Test, 'Test: Replace.');
    nc[2] = { v: 9 };
    Log.write(Log.HeatLevel.Log, Log.Domain.Test, nc);
    assertEqual(
        JSON.stringify(nc),
        JSON.stringify([{ v: 0 }, { v: 7 }, { v: 9 }, { v: 4 }]));

    Log.write(Log.HeatLevel.Log, Log.Domain.Test, 'Test: Move.');
    nc.move(1, 3);
    Log.write(Log.HeatLevel.Log, Log.Domain.Test, nc);
    assertEqual(
        JSON.stringify(nc),
        JSON.stringify([{ v: 0 }, { v: 9 }, { v: 4 }, { v: 7 }]));

    Log.write(Log.HeatLevel.Log, Log.Domain.Test, 'Test: Sort.');
    nc.sort((a, b) => a.v - b.v);
    Log.write(Log.HeatLevel.Log, Log.Domain.Test, nc);
    assertEqual(
        JSON.stringify(nc),
        JSON.stringify([{ v: 0 }, { v: 4 }, { v: 7 }, { v: 9 }]));

    Log.write(Log.HeatLevel.Log, Log.Domain.Test, 'Test: Reverse.');
    nc.reverse();
    Log.write(Log.HeatLevel.Log, Log.Domain.Test, nc);
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
    // The End

    Log.write(Log.HeatLevel.Info, Log.Domain.Test, 'Test: Observable collection. Finish.');
}