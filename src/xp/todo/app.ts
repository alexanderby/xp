var app: xp.Application;

window.onload = () => {
    app = new xp.Application({
        startupUrl: 'main.xml'
    });
    xp.UI.DIInstances.set(xp.Application, app);

    app.start();
};
