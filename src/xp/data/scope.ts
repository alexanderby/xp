module xp {
    // TODO: Ideas:
    // 1. Scope should implement INotifier or...
    // 2. Should not create INotifier, ObservableCollection,
    // use Object.observe instead.

    /**
     * Data scope.
     */
    export class Scope {
        private parent: Scope;
        private self: any;

        /**
         * Creates a scope.
         * @param source Source object. Should be observable to enable two-way data binding.
         * @param [parent] Parent scope.
         */
        constructor(source: any, parent?: Scope) {
            this.self = source;
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
    }
}