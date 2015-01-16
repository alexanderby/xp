var app = new xp.Application({
    startupUrl: 'view/window.xml'
});

var person;
var bs;

window.onload = () => {

    app.start();

    person = {
        id: 123,
        name: 'John',
        city: {
            id: 4,
            name: 'New York',
            country: {
                name: 'USA',
            },
        },
        books: [
            { pages: 5 },
            { pages: 44 }
        ],
        numbers: [3, 5, 7],
    };
    bs = xp.Binding.createNotifierFrom(person);

    console.log('App: Set window context.');
    app.window.scope = bs;

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
                },
            };
            bs['numbers'].push(4);
        }, 2000);
    }, 2000);
};

window.onerror = (message: any, uri: string, lineNumber: number, columnNumber?: number, e?: Error) => {
    if (e && (<any>e).stack) {
        console.log((<any>e).stack);
    }
};
