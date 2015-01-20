module xp.UI {

    /**
     * "XML tag":"UI class" dictionary.
     */
    export var Tags: { [tag: string]: typeof Element } = {};

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
        var tagName = markup[0].nodeName;
        var type = xp.UI.Tags[tagName];
        var init = new type().getMarkupInitializer($(rootNode)); // TODO: Separate class for mapkup processing - MarkupProcessor<T extends Element>
        var dependencies = xp.UI.Dependencies[tagName];
        if (dependencies) {
            var instances = dependencies.map((d) => {
                if (!xp.UI.Instances[d]) {
                    throw new Error(
                        xp.formatString('Unable to get instance of dependency "{0}" for element <{1}>.', d, tagName));
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