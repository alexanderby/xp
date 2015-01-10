﻿module xp.Binding {
    /**
     * Data scope.
     */
    export class Scope {
        private parent: Scope;
        private self: INotifier;

        /**
         * Creates a scope.
         * @param obj Source object for converting into observable object.
         * @param parent Parent scope.
         */
        constructor(obj: any, parent?: Scope) {
            if (isNotifier(obj)) {
                this.self = obj;
            }
            else if (Array.isArray(obj)) {
                this.self = new ObservableCollection(obj);
            }
            else {
                this.self = createNotifierFrom(obj);
            }

            this.parent = parent;
        }

        /**
         * Returns a property that is accessed at current or parent scopes by path.
         * @param path Property path.
         */
        get(path: string): any {
            var prop = xp.Path.getPropertyByPath(this.self, path);
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
         * Returns an object that holds the property.
         * @param path Property path.
         */
        getPropertyHolder(path: string) {
            var prop = xp.Path.getPropertyByPath(this.self, path);
            if (prop !== void 0) {
                return this.self;
            }
            else if (this.parent) {
                return this.parent.getPropertyHolder(path);
            }
            else {
                return void 0;
            }
        }
    }

    export class BindingManager2 {



    }
}