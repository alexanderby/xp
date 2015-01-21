module xp.UI {

    /**
     * Represents a markup processor.
     */
    export interface MarkupProcessor<T extends Element> {
        /**
        * Returns function which initializes control
        * according to provider markup.
        * @param markup Element's markup.
        */
        getInitializer(markup: JQuery): UIInitializer<T>;
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
} 