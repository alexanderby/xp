var app: xp.Application;

window.onload = () => {
    app = new xp.Application({
        windowUrl: 'main.xml'
    });
    app.start();
};
