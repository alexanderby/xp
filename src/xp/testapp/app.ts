var app = new xp.Application({
    windowHref: 'view/window.xml'
});

window.onload = () => {

    app.start();

    var person = {
        id: 123,
        name: 'John'
    };
    var bs = xp.createBindableObject(person/*, ['name']*/);

    var label = app.window.findElement('label1');
    label.bind('text', 'name', bs);

    var textbox1 = app.window.findElement('textbox1');
    textbox1.bind('text', 'name', bs);

    //console.log(bs.data.name);
    //bs.data.name = 'Nick';
    //console.log(bs.data.name);
    setTimeout(() => {
        bs.data.name = 'Nick';
    }, 1000);

    //bs.onPropertyChanged.addHandler((args) => {
    //    alert(xp.formatString('"{0}" changed from "{1}" to "{2}".', args.propertyName, args.oldValue, args.newValue));
    //}, this);
    //bs.data.id = 456;
    //bs.data.name = 'Nick';
    //alert(bs.source.id);
};

//window.onerror = (e) => {
//    console.log(xp.getStackTrace());
//};