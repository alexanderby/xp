var app = new xp.Application({
    windowHref: 'view/window.xml'
});

var bs;

window.onload = () => {

    app.start();

    var person = {
        id: 123,
        name: 'John',
        city: {
            id: 4,
            name: 'New York',
            country: {
                name: 'USA',
                toString: () => 'Country1'
            },
            toString: () => 'City1'
        },
        books: [
            { pages: 5 },
            { pages: 44 }
        ],
        toString: () => 'Person1'
    };
    bs = xp.Binding.createNotifierFromObject(person);

    console.log('App: Set window context.');
    app.window.context = bs;

    setTimeout(() => {
        console.log('App: Set person name.');
        bs['name'] = 'Nick';
        console.log('App: Set city name.');
        bs['city']['name'] = 'Los Angeles';

        setTimeout(() => {
            console.log('App: Set city.');
            bs['city'] = {
                id: 5,
                name: 'Gomel',
                country: {
                    name: 'Belarus',
                    toString: () => 'Country2'
                },
                toString: () => 'City2'
            };
        }, 2000);
    }, 2000);
};

window.onerror = (message: any, uri: string, lineNumber: number, columnNumber?: number, e?: Error) => {
    if (e && (<any>e).stack) {
        console.log((<any>e).stack);
    }
};
