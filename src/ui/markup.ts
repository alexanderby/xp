module xp.UI {

    /**
     * Represents a markup processor.
     */
    export interface MarkupParser<T extends Element> {
        /**
        * Returns function which initializes control
        * according to provider markup.
        * @param markup Element's markup.
        */
        getInitializer(markup: gElement): UIInitializer<T>;
    }


    //--------
    // MAPPING
    //--------

    export interface AttributeMap<T extends Element> {
        [attr: string]: ValueMap<T>;
    }

    export interface ValueMap<T extends Element> {
        [value: string]: (value?: string) => UIInitializer<Element>;
    }

    /**
     * Extends attribute map with another one.
     * @param source Base map.
     * @param extension Map extension.
     */
    export function extendAttributeMap<TSrc extends Element, TExt extends Element>(source: AttributeMap<TSrc>, extension: AttributeMap<TExt>): AttributeMap<TExt> { // TODO: Mixin.
        var result = {};
        for (var key in source) {
            result[key] = source[key];
        }
        for (var key in extension) {
            result[key] = extension[key];
        }
        return <AttributeMap<TExt>>result;
    }

    /**
     * Represents a function which initializes UI element.
     */
    export interface UIInitializer<T extends Element> {
        (el: T): void;
    }

    /**
     * Info needed to parse single markup item.
     */
    export interface MarkupItemParseInfo<T extends Element> {
        /**
         * Constructor of UI element.
         */
        ctor: Constructor<T>;
        /**
         * Parser of element markup.
         */
        parser: MarkupParser<T>;
        /**
         * Constructors of type instances that UI element depends on.
         * Instances of specified dependencies will be taken from DIInstances dictionary.
         */
        dependencies?: Array<Constructor<any>>;
        /**
         * Markup URL (used to load markup of View or it's inheritors).
         */
        markupUrl?: string;
    }

    /**
     * Contains info for parsing elements.
     */
    export var MarkupParseInfo: { [tag: string]: MarkupItemParseInfo<Element> } = {};

    /**
     * "Dependency constructor":"Instance" dictionary.
     */
    export var DIInstances = new Dictionary<Constructor<any>, any>();

    /**
     * Creates UI element resolving dependencies.
     * @param markup Element's markup.
     */
    export function createElement<T extends Element>(markup: gElement): T {
        var create = getElementCreator(markup);
        var el = create();
        return <T>el;
    }

    /**
     * Returns a function which creates an element resolving dependencies.
     * @param markup Element's markup.
     */
    export function getElementCreator(markup: gElement): () => Element {
        var tag = markup.nodeName;
        if (!(tag in MarkupParseInfo)) {
            throw new Error('Markup parse info for element "' + tag + '" is not found.');
        }

        var mp = xp.UI.MarkupParseInfo[tag];
        var init = mp.parser.getInitializer(markup);
        if (mp.dependencies) {
            var instances = mp.dependencies.map((d) => {
                var inst = xp.UI.DIInstances.get(d)
                if (!inst) {
                    throw new Error(
                        xp.formatString('Unable to get instance of dependency "{0}" for element <{1}>.', d.toString().match(/function\s*(.*?)\s*\(/)[1], tag));
                }
                return inst;
            });
        }

        return () => {
            var el: Element;
            if (instances) {
                el = xp.applyConstructor(mp.ctor, instances);
            }
            else {
                el = new mp.ctor();
            }
            init(el);
            return el;
        };
    }
} 