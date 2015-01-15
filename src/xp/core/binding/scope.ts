module xp.Binding {
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
         * Returns a scope that holds the property.
         * @param path Property path.
         */
        getPropertyHolder(path: string): Scope {
            var prop = xp.Path.getPropertyByPath(this.self, path);
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

    /**
     * Manages the scope data binding for a single property.
     */
    export class ScopeBindingManager {

        private target: any;
        private targetPropertyPath: string;
        private scope: Scope;
        private path: string;

        /**
         * Creates the scope binding manager.
         * @param target Target.
         * @param targetPropertyPath Target property path.
         * @param scope Scope object.
         * @param path Path to bind to.
         */
        constructor(target: any, targetPropertyPath: string, scope: Scope, path: string) {
            //
            // Checks

            if (!targetPropertyPath)
                throw new Error('Target property path is not set.');

            if (!path)
                throw new Error('Unable to bind to empty path.');

            this.target = target;
            this.targetPropertyPath = targetPropertyPath;
            this.scope = scope;
            this.path = path;

            //
            // Split path into parts

            // TODO: Support for "$parent.path", "$root.path".
            this.pathParts = xp.Path.replaceIndexers(path).split('.');
            if (!this.pathParts || this.pathParts.length < 1) {
                throw new Error(
                    xp.formatString('Wrong binding path: "{0}".', path));
            }
            this.pathParts.forEach((part) => {
                if (part === '')
                    throw new Error(
                        xp.formatString('Unable to bind to empty path. Path: "{0}".', path));
            });

            // Register path objects, update target.
        }

        private pathParts: string[];
        private pathObjects: PathObjectInfo[];

        /**
         * Registers path objects' change handlers.
         * @param [startIndex=0] Path index to start re-initialization from.
         */
        private registerPathObjects(startIndex = 0) {
            // WARNING: If property is unreachable then the current scope will be used.
            var scope = this.scope.getPropertyHolder(this.path) || this.scope;
            var parts = this.pathParts;

            if (startIndex === 0) {
                this.pathObjects = [{
                    // Root item
                    obj: scope.get('')
                }];
            }

            var po: PathObjectInfo[] = this.pathObjects;
            for (var i = startIndex; i < parts.length; i++) {
                // Property name
                var prop = parts[i];
                po[i].prop = prop;

                var current = po[i].obj;

                if (!(prop in current)) {
                    break;
                }

                // Next path object
                po[i + 1] = {
                    obj: current[prop]
                };


                //
                // Create property replacement handler

                if (isNotifier(current)) {

                    var handler: (prop: string) => void;

                    if (i == parts.length - 1) {
                        // Only updates the target.
                        handler = ((propName: string) => {
                            return (prop: string) => {
                                if (prop === propName) {
                                    // Update target
                                }
                            };
                        })(prop);
                    }
                    else {
                        // Re-registers lower path objects and updates the target.
                        handler = ((propName: string, index: number) => {
                            return (prop: string) => {
                                if (prop === propName) {
                                    // Register path objects
                                    // Update target
                                }
                            };
                        })(prop, i + 1); // ?
                    }

                    po[i].handler = handler;
                }
            }

            this.pathObjects = po;
        }
    }

    /**
     * Holds a path object property change listening info.
     */
    interface PathObjectInfo {
        /**
         * Object.
         */
        obj: any;
        /**
         * Property name which changes should be listened to.
         */
        prop?: string;
        /**
         * Handles the replacement of the property.
         */
        handler?: (prop: string) => void;
    }
}