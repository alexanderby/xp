module xp.Dom {
    /**
     * Creates a HTML element from string content.
     * @param html HTML markup,
     */
    export function create(html: string): HTMLElement {
        var temp = document.createElement('div');
        temp.innerHTML = html;
        return <HTMLElement>temp.firstElementChild;
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