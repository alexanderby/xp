var app: xp.Application;

window.onload = () => {
    app = new xp.Application({
        startupUrl: 'main.xml'
    });
    xp.UI.Instances['App'] = app;
    xp.UI.Dependencies['Window'] = ['App'];

    app.start();
};
