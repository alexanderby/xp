window.onload = () => {
    var app = new xp.Application({
        windowHref: 'view/window.xml'
    });
    app.start();
    //var person = {
    //    id: 123,
    //    name: 'John'
    //};
    //var bs = xp.createBindableObject(person, ['id']);
    //bs.onPropertyChanged.addHandler((args) => {
    //    alert(xp.formatString('"{0}" changed from "{1}" to "{2}".', args.propertyName, args.oldValue, args.newValue));
    //}, this);
    //bs.data.id = 456;
    //bs.data.name = 'Nick';
    //alert(bs.source.id);
};