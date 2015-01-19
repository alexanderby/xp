module xp.Binding {
    // TODO: Ideas:
    // 1. Scope should implement INotifier or...
    // 2. Should not create INotifier, ObservableCollection,
    // use Object.observe instead.

    /**
     * Data scope.
     */
    export class Scope {
        private parent: Scope;
        private self: INotifier;

        /**
         * Creates a scope.
         * @param source Source object for converting into observable object.
         * @param [parent] Parent scope.
         */
        constructor(source: any, parent?: Scope) {
            if (source instanceof Scope) {
                this.self = (<Scope>source).self;
            }
            else if (isNotifier(source)) {
                this.self = source;
            }
            else if (Array.isArray(source)) {
                this.self = new ObservableCollection(source);
            }
            else {
                this.self = createNotifierFrom(source);
            }

            this.parent = parent;
        }

        /**
         * Returns a property that is accessed at current or parent scopes by path.
         * @param path Property path.
         */
        get(path: string): any {
            var prop = xp.Path.getPropertyByPath(this.self, path, false);
            if (prop !== void 0) {
                return prop;
            }
            else if (this.parent) {
                return this.parent.get(path);
            }
            else {
                return void 0;
            }
        }

        /**
         * Sets a property value by path.
         * @param path Property path.
         * @param value Value.
         */
        set(path: string, value): any {
            if (this.get(path) === void 0) {
                throw new Error(
                    xp.formatString('Unable to set property value "{0}" by path "{1}". Property is unreachable.', value, path));
            }

            var holder = this.getPropertyHolder(path);
            var obj = xp.Path.getPropertyByPath(holder.get(''), xp.Path.getObjectPath(path));
            var propName = xp.Path.getPropertyName(path);

            obj[propName] = value;
        }

        /**
         * Returns a nearest scope that has the property.
         * @param path Property path.
         * @returns Scope or "undefined" if property is unreachable.
         */
        getPropertyHolder(path: string): Scope {
            var prop = xp.Path.getPropertyByPath(this.self, path, false);
            if (prop !== void 0) {
                return this;
            }
            else if (this.parent) {
                return this.parent.getPropertyHolder(path);
            }
            else {
                return void 0;
            }
        }

        ///**
        // * Is invoked when any object's property is changed.
        // * Argument is a property name.
        // */
        //onPropertyChanged: Event<string>;
    }

    //export interface Scope extends INotifier {
    //    /**
    //     * Returns parent scope.
    //     */
    //    getParentScope(): Scope;
    //    /**
    //     * Returns a property that is accessed at current or parent scopes by path.
    //     * @param path Property path.
    //     */
    //    getProperty(path: string);
    //    /**
    //     * Returns a nearest scope that has the property.
    //     * @param path Property path.
    //     * @returns Scope or "undefined" if property is unreachable.
    //     */
    //    getPropertyHolder(path: string);
    //}

    //export function isScope(obj: any) {
    //    return (!!obj
    //        && 'getParentScope' in obj
    //        && 'getProperty' in obj
    //        && 'getPropertyHolder' in obj);
    //}

    ///**
    // * Creates scope object.
    // */
    //export function createScopeFrom(obj: any, parent: Scope) {
    //    // Returns parent scope
    //    function getParentScope(): Scope {
    //        return parent;
    //    }

    //    if (isScope(obj)) {
    //        // If already a scope
    //        (<Scope>obj).getParentScope = getParentScope;
    //        return obj;
    //    }

    //    var self = <Scope>obj;

    //    // Returns property
    //    function getProperty(path: string): any {
    //        var prop = xp.Path.getPropertyByPath(self, path);
    //        if (prop !== void 0) {
    //            return prop;
    //        }
    //        else if (self.getParentScope()) {
    //            return self.getParentScope().getProperty(path);
    //        }
    //        else {
    //            return void 0;
    //        }
    //    }

    //    // Returns nearest scope which has a property
    //    function getPropertyHolder(path: string): Scope {
    //        var prop = xp.Path.getPropertyByPath(self, path);
    //        if (prop !== void 0) {
    //            return self;
    //        }
    //        else if (self.getParentScope()) {
    //            return self.getParentScope().getPropertyHolder(path);
    //        }
    //        else {
    //            return void 0;
    //        }
    //    }

    //    var result: Scope;

    //    if (isNotifier(obj)) {
    //        result = obj;
    //    }
    //    else if (Array.isArray(obj)) {
    //        result = new ObservableCollection(obj);
    //    }
    //    else {
    //        result = createNotifierFrom(source);
    //    }

    //    result.getParentScope = getParentScope;
    //    result.getProperty = getProperty;
    //    result.getPropertyHolder = getPropertyHolder;

    //    this.parent = parent;
    //}
}