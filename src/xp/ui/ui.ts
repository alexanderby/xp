module xp.UI {

    /**
     * "XML tag":"UI control class" dictionary.
     */
    export var Controls: { [tag: string]: new (...args: any[]) => Element } = {};

    /**
     * "XML tag":"Markup processor instance" dictionary.
     */
    export var Processors: { [tag: string]: MarkupProcessor<Element> } = {};

    /**
     * "XML tag":"List of dependencies types" dictionary.
     */
    //export var Dependencies: { [tag: string]: typeof Object [] } = {};

    /**
     * "XML tag":"Dependency name" dictionary.
     */
    export var Dependencies: { [tag: string]: string[] } = {};

    /**
     * "Dependency name":"Instance" dictionary.
     */
    export var Instances: { [depName: string]: any } = {};

    //export var TabIndex = 0;

    /**
     * Creates UI element resolving dependencies.
     * @param markup Element's markup.
     */
    export function createElement(markup: JQuery) {
        var create = getElementCreator(markup);
        var el = create();
        return el;
    }

    /**
     * Returns a function which creates an element resolving dependencies.
     * @param markup Element's markup.
     */
    export function getElementCreator(markup: JQuery): () => Element {
        var rootNode = markup[0];
        var tag = markup[0].nodeName;
        if (!(tag in xp.UI.Controls)) {
            throw new Error('Element "' + tag + '" is not defined in controls dictionary.');
        }
        if (!(tag in xp.UI.Processors)) {
            throw new Error('Element "' + tag + '" is not defined in processors dictionary.');
        }
        var type = xp.UI.Controls[tag];
        var init = xp.UI.Processors[tag].getInitializer($(rootNode));
        var dependencies = xp.UI.Dependencies[tag];
        if (dependencies) {
            var instances = dependencies.map((d) => {
                if (!xp.UI.Instances[d]) {
                    throw new Error(
                        xp.formatString('Unable to get instance of dependency "{0}" for element <{1}>.', d, tag));
                }
                return xp.UI.Instances[d];
            });
        }

        return () => {
            var el: Element;
            if (instances) {
                el = xp.applyConstructor(type, instances);
            }
            else {
                el = new type();
            }
            init(el);
            return el;
        };
    }
}  