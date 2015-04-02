xp.Log.DisplayMessages = 255;

window.onload = () => {
    xp.UI.MarkupParseInfo['Window'].markupUrl = 'view/window.xml';

    xp.UI.init(() => {
        var window = new xp.UI.Window();
        var shown = false;
        window.onClick.addHandler(() => {
            if (!shown) {
                xp.UI.MessageBox.show('Test message. Test message. Test message. Test message. Test message.', 'Message title');
                shown = true;
            }
        }, this);
    });
};

window.onerror = (message: any, uri: string, lineNumber: number, columnNumber?: number, e?: Error) => {
    if (e && (<any>e).stack) {
        console.log((<any>e).stack);
    }
};
