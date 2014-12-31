var app: xp.Application;

window.onload = () => {
    app = new xp.Application({
        startupUrl: 'main.xml'
    });
    app.start();
};
