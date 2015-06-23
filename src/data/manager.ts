module xp {
    // TODO: Parameters object.
    // TODO: Option for not updating source
    // for the first time (usually element
    // has no scope when binding occurs)?

    /**
     * Manages the scope data binding for a single property.
     * This manager is hold by target and must exist until
     * target is disposed. Nested source properties are
     * not supposed to be always reachable.
     */
    export class BindingManager {

        private target: any;
        private targetPropertyPath: string;
        private scope: Object;
        private path: string;
        private defaultValue: any;

        /**
         * Creates the scope binding manager.
         * @param target Target.
         * @param targetPropertyPath Target property path.
         * @param scope Scope object.
         * @param path Path to bind to.
         * @param options Options.
         */
        constructor(target: any, targetPropertyPath: string, scope: Object, path: string, defaultValue?: any) {
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
            this.defaultValue = defaultValue;

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

            // Subscribe for all path changes
            this.registerPathObjects();
            this.updateTarget();
        }

        private pathParts: string[];
        private pathObjects: PathObjectInfo[];

        /**
         * Registers path objects' change handlers.
         * @param [startIndex=0] Path index to start re-initialization from.
         */
        private registerPathObjects(startIndex = 0) {
            //
            // Unregister previous replacement handlers

            if (this.pathObjects) {
                var po = this.pathObjects;
                for (var i = startIndex; i < po.length - 1; i++) {
                    if (isNotifier(po[i].obj)) {
                        (<Notifier>po[i].obj).onPropertyChanged.removeHandler(po[i].handler);
                    }
                }
                this.pathObjects.splice(startIndex, po.length - startIndex);
            }

            //
            // Register replacement handlers for path objects

            var parts = this.pathParts;

            if (startIndex === 0) {
                this.pathObjects = [];
            }
            this.pathObjects[startIndex] = {
                obj: startIndex === 0 ?
                    this.scope
                    : Path.getPropertyByPath(this.scope, parts.slice(0, startIndex).join('.'))
            };

            var po: PathObjectInfo[] = this.pathObjects;
            for (var i = startIndex; i < parts.length; i++) {
                // Property name
                var prop = parts[i];
                po[i].prop = prop;

                var current = po[i].obj;

                if (!current) {
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
                        handler = ((propNameToCompare: string) => {
                            return (prop: string) => {
                                if (prop === propNameToCompare) {
                                    this.updateTarget();
                                }
                            };
                        })(prop);
                    }
                    else {
                        // Re-registers lower path objects and updates the target.
                        handler = ((propNameToCompare: string, indexToReplaceFrom: number) => {
                            return (prop: string) => {
                                if (prop === propNameToCompare) {
                                    this.registerPathObjects(indexToReplaceFrom);
                                    this.updateTarget();
                                }
                            };
                        })(prop, i + 1);
                    }

                    (<Notifier>po[i].obj).onPropertyChanged.addHandler(handler, this);
                    po[i].handler = handler;
                }
            }

            this.pathObjects = po;
        }

        /**
         * Resets binding with new binding source (with the same hierarchy).
         * @param scope Scope to sync with.
         */
        resetWith(scope: Object) {
            this.logMessage(xp.formatString('Reset with "{0}".', this.scope));
            this.scope = scope;
            this.registerPathObjects();
            this.updateTarget();
        }

        /**
         * Updates source property.
         */
        updateSource() {
            var value = xp.Path.getPropertyByPath(this.target, this.targetPropertyPath);
            var pathLength = this.pathParts.length;
            var sourceObj = this.pathObjects[pathLength - 1].obj;
            if (typeof sourceObj === 'object' && sourceObj !== null) {
                this.logMessage(xp.formatString('Update source "{0}" property with value "{1}".', this.path, value));
                var sourceProp = this.pathParts[pathLength - 1];
                sourceObj[sourceProp] = value;
            }
            else {
                this.logMessage(xp.formatString('Unable to update source property "{0}". It is unreachable.', this.path));
            }
        }

        /**
         * Updates target property.
         */
        updateTarget() {
            var value = Path.getPropertyByPath(this.scope, this.path, false);
            var path = xp.Path.getObjectPath(this.targetPropertyPath);
            var prop = xp.Path.getPropertyName(this.targetPropertyPath);
            var targetObj = xp.Path.getPropertyByPath(this.target, path);

            if (value !== void 0 && value !== null) {
                this.logMessage(xp.formatString('Update target with "{0}" property value "{1}".', this.path, value));
                targetObj[prop] = value
            }
            else {
                this.logMessage(xp.formatString('Unable to reach value "{0}". Using default value "{1}".', this.path, this.defaultValue));
                targetObj[prop] = this.defaultValue;
            }
        }

        /**
         * Removes binding.
         * Must be called when target is being disposed or property path changes.
         */
        unbind() {
            this.logMessage('Unbind.');
            if (this.pathObjects) {
                var po = this.pathObjects;
                for (var i = 0; i < po.length - 1; i++) {
                    if (isNotifier(po[i].obj)) {
                        (<Notifier>po[i].obj).onPropertyChanged.removeHandler(po[i].handler);
                    }
                }
            }
        }


        private logMessage(message: string) {
            Log.write(Log.HeatLevel.Log, Log.Domain.Binding,
                'BM of "{0}#{1}.{2}": {3}',
                xp.getClassName(this.target),
                this.target['name'],
                this.targetPropertyPath,
                message);
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

    //------------------------------------------------
    //
    // TODO: Use expression chains instead of strings?

    //class Getter<T> {
    //    item: T;
    //    private chain: Chain;
    //    constructor(item: T, chain?: Chain) {
    //        this.item = item;
    //    }
    //    get<K>(getter: (item: T) => K): Getter<K> {
    //        if (this.chain) {
    //            chain.getters.push(getter);
    //        }
    //        if (this.item === void 0 || this.item === null) {
    //            return new Getter(null, chain);
    //        }
    //        var prop = getter(this.item);
    //        return new Getter(prop, chain);
    //    }
    //}

    //var country = {
    //    name: 'Hrenland',
    //    city: {
    //        name: 'New York',
    //        street: {
    //            name: 'Baker str.',
    //            houses: [
    //                { num: 1 },
    //                { num: 3 }
    //            ]
    //        }
    //    }
    //};

    //class Chain {
    //    getters: { (item): any }[];
    //    constructor() {
    //        this.getters = [];
    //    }
    //}

    //var chain = new Chain();
    //var housesCount = new Getter(country)
    //    .get(c=> c.city)
    //    .get(c=> c.street)
    //    .get(s=> s.name)
    //    .get(n=> n.toUpperCase());

    // How to handle onPropertyChanged<(item)=>any>?
} 