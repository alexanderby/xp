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
            var el = select(selector, result);
            if (!el) {
                throw new Error('Selector "' + selector + '" didn\'t return anything.');
            }
            var setter = selectorSetters[selector];
            setter(el);
        }
        return result;
    }

    /**
     * Returns the first element that matches the selector.
     * @param selector Selector.
     * @param parent Element to start the search from.
     */
    export function select(selector: string, parent?: NodeSelector): HTMLElement {
        parent = parent || document;
        return <HTMLElement>parent.querySelector(selector);
    }

    /**
     * Removes a node.
     * @param node Node to remove.
     */
    export function remove(node: Node): Node {
        if (node.parentNode) {
            return node.parentNode.removeChild(node);
        }
        return node;
    }
} 