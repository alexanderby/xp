module xp.Dom {
    /**
     * Creates a HTML element from string content.
     * @param html HTML markup.
     * @param selectorSetter Selector/setter dictionary.
     */
    export function create(html: string, selectorSetters?: { [selector: string]: (htmlEl) => void }): HTMLElement {
        var temp = document.createElement('div');
        temp.innerHTML = html;
        var result = <HTMLElement>temp.firstElementChild;
        for (var selector in selectorSetters) {
            var el = result.querySelector(selector);
            if (!el) {
                throw new Error('Selector "' + selector + '" didn\'t return anything.');
            }
            var setter = selectorSetters[selector];
            setter(el);
        }
        return result;
    }
} 