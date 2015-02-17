var app = new xp.Application({
    startupUrl: 'view/window.xml'
});

window.onload = () => {
    app.start();

    var shown = false;
    app.window.onClick.addHandler(() => {
        if (!shown) {
            xp.UI.MessageBox.show('Test message. Test message. Test message. Test message. Test message.', 'Message title');
            shown = true;
        }
    }, this);
};

window.onerror = (message: any, uri: string, lineNumber: number, columnNumber?: number, e?: Error) => {
    if (e && (<any>e).stack) {
        console.log((<any>e).stack);
    }
};
