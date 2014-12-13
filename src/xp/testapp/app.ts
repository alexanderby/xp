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
            name: 'New York'
        }
    };
    bs = xp.createNotifierFromObject(person);

    app.window.context = bs;

    setTimeout(() => {
        bs['name'] = 'Nick';
        bs['city']['name'] = 'Los Angeles';

        setTimeout(() => {
            bs['city'] = { id: 5, name: 'Gomel' };
        }, 2000);
    }, 2000);

    //var person = {
    //    id: 123,
    //    name: 'John'
    //};
    //var bs = xp.createNotifierFromObject(person);

    //var label = app.window.findElement('label1');
    //label.bind('text', 'name', bs);

    //var textbox1 = app.window.findElement('textbox1');
    //textbox1.bind('text', 'name', bs);

    //setTimeout(() => {
    //    bs['name'] = 'Nick';
    //}, 1000);
};
