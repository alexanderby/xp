var app = new xp.Application({
    startupUrl: 'view/window.xml'
});

window.onload = () => {
    app.start();
};

window.onerror = (message: any, uri: string, lineNumber: number, columnNumber?: number, e?: Error) => {
    if (e && (<any>e).stack) {
        console.log((<any>e).stack);
    }
};
