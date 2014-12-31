module xp.Binding.Tests {
    console.info('Test: Observable collection. Start.');

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
        console.log(xp.formatString('Test: Collection changed. Type: {0}, new index: {1}, old index: {2}, new item: {3}, old item: {4}.', CollectionChangeAction[args.action], args.newIndex, args.oldIndex, args.newItem, args.oldItem));
    }, window);
    nc.onPropertyChanged.addHandler((prop) => {
        console.log(xp.formatString('Test: Collection property changed: "{0}".', prop));
    }, window);
    console.log(nc);

    //
    // Process

    console.log('Test: Push.');
    nc.push({ v: 4 }, { v: 5 });
    console.log(nc);

    console.log('Test: Pop.');
    nc.pop();
    console.log(nc);

    console.log('Test: Shift.');
    nc.shift();
    console.log(nc);

    console.log('Test: Unshift.');
    nc.unshift({ v: 0 });
    console.log(nc);

    console.log('Test: Splice.');
    nc.splice(1, 2, { v: 7 }, { v: 8 });
    console.log(nc);

    console.log('Test: Replace.');
    nc[2] = { v: 9 };
    console.log(nc);

    //
    // Check

    assertEquals(nc.length, 4);
    assertEquals(nc[0].v, 0);
    assertEquals(nc[1].v, 7);
    assertEquals(nc[2].v, 9);
    assertEquals(nc[3].v, 4);

    //
    // The End

    console.info('Test: Observable collection. Finish.');

    export function assertEquals(a, b) {
        if (a !== b) {
            throw new Error(xp.formatString('"{0}" is not equal to "{1}".', a, b));
        }
    }
}