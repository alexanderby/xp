module xp {

    /**
     * Defines an object, which notifies of it's properties changes.
     */
    export interface INotifier {
        /**
         * Is invoked when any object's property is changed.
         * Argument is a property name.
         */
        onPropertyChanged: Event<string>;
    }

    /**
     * Creates plain object, which notifies of it's properties changes.
     * @param propertiesNames Names of properties.
     */
    export function createNotifier(propertiesNames: string[]): INotifier {
        var obj: INotifier = { onPropertyChanged: new Event<string>() };
        propertiesNames.forEach((name) => {
            addNotificationProperty(obj, name);
        });
        return obj;
    }

    /**
     * Creates object, which notifies of it's properties changes.
     * @param source Source object.
     */
    export function createNotifierFromObject(source: Object): INotifier {
        var obj: INotifier = { onPropertyChanged: new Event<string>() };
        for (var key in source) {
            // Create notification property
            addNotificationProperty(obj, key, source[key]);
        }
        return obj;
    }

    /**
     * Manages binding of source and target properties.
     * This manager is hold by target and exists until
     * target is disposed. Nested source properties are
     * not supposed to be always reachable.
     */
    export /*sealed*/ class BindingManager {
        private root;
        private target/*: xp.Ui.Element*/;
        private targetProperty: string;
        dafaultValue;
        sourcePropertyPath: string;

        constructor(target/*: xp.Ui.Element*/, targetProperty: string, source, sourcePropertyPath: string, defaultValue?) {
            this.target = target;
            this.targetProperty = targetProperty;
            this.root = source;
            this.sourcePropertyPath = sourcePropertyPath;
            this.dafaultValue = defaultValue;

            // Subscribe for all path changes
            this.registerPathObjects();
            this.updateTarget();
        }

        private pathObjects: { obj: any; handler?: (name: string) => void; }[];

        private registerPathObjects(startIndex = 0) {
            //
            // Remove previous path objects' handlers

            if (this.pathObjects) {
                var po = this.pathObjects;
                for (var i = startIndex; i < po.length - 1; i++) {
                    if (isNotifier(po[i].obj)) {
                        (<INotifier>po[i].obj).onPropertyChanged.removeHandler(po[i + 1].handler);
                    }
                }
            }

            //
            // Get all objects by path

            // TODO: Collections...
            var parts = this.sourcePropertyPath.split('.');
            if (startIndex === 0 && !this.pathObjects) {
                this.pathObjects = [{ obj: this.root }];
            }
            var po = this.pathObjects;
            for (var i = startIndex; i < parts.length; i++) {
                if (!po[i].obj) {
                    break;
                }
                // Set path object
                po[i + 1] = {
                    obj: po[i].obj[parts[i]]
                }
                if (isNotifier(po[i].obj)) {
                    // Handle path object replacement
                    var handler: (prop: string) => void;

                    if (i == parts.length - 1) {
                        // Only updates target.
                        handler = ((propName) => {
                            return (prop: string) => {
                                if (prop === propName) {
                                    this.updateTarget();
                                }
                            };
                        })(parts[i]);
                    }
                    else {
                        // Re-registers lower path objects, updates target.
                        handler = ((index, propName) => {
                            return (prop: string) => {
                                if (prop === propName) {
                                    this.registerPathObjects(index);
                                    this.updateTarget();
                                }
                            };
                        })(i + 1, parts[i]);
                    }

                    (<INotifier>po[i].obj).onPropertyChanged.addHandler(handler, this);
                    po[i + 1].handler = handler;
                }
            }
        }

        private getSource() {
            var srcPath = xp.Path.getObjectPath(this.sourcePropertyPath);
            var src = xp.Path.getPropertyByPath(this.root, srcPath, false);
            return src;
        }

        /**
         * Updates source property.
         */
        updateSource() {
            var source = this.getSource();
            if (source) {
                var value = this.target[this.targetProperty];
                source[xp.Path.getPropertyName(this.sourcePropertyPath)] = value;
            }
        }

        /**
         * Updates target property.
         */
        updateTarget() {
            var source = this.getSource();
            if (source) {
                var value = source[xp.Path.getPropertyName(this.sourcePropertyPath)];
                this.target[this.targetProperty] = value;
            }
            else {
                this.target[this.targetProperty] = this.dafaultValue;
            }
        }

        /**
         * Removes binding.
         * Must be called when target is being disposed or property path changes.
         */
        unbind() {
            if (this.pathObjects) {
                var po = this.pathObjects;
                for (var i = 0; i < po.length - 1; i++) {
                    if (isNotifier(po[i].obj)) {
                        (<INotifier>po[i].obj).onPropertyChanged.removeHandler(po[i + 1].handler);
                    }
                }
            }
        }
    }


    //--------
    // PRIVATE
    //--------

    /**
     * Determines whether object implements INotifier.
     * @param obj Object.
     */
    function isNotifier(obj) {
        return !!(<INotifier>obj).onPropertyChanged;
    }

    /**
     * Adds property to INotifier.
     * @param obj Notifier.
     * @param name Name of the property to create.
     * @param [value] Default property value.
     */
    function addNotificationProperty(obj: INotifier, name: string, value?) {
        //
        // Ensure property is not already present.
        if (obj[name] !== void 0) {
            throw new Error('Unable to create notification property. Object already has "' + name + '" property.');
        }
        if (name === 'onPropertyChanged') {
            throw new Error('Unable to create notification property. Reserved name is used.');
        }
        var fieldName = '_' + name;
        if (obj[fieldName]) {
            throw new Error('Unable to create field for notification property. Object already has "' + fieldName + '" property.');
        }
        if (value !== void 0) {
            obj[fieldName] = value;
        }

        //
        // Check if property is an object.
        // If so -> make it Notifier.

        if (typeof value === 'object') {
            obj[fieldName] = createNotifierFromObject(value);
            var isNestedObject = true;
        }

        //
        // Getters/setters

        var getter = function () {
            return obj[fieldName];
        };

        // Simple setter
        var setter = function (value) {
            obj[fieldName] = value;
            obj.onPropertyChanged.invoke(name);
        };

        if (isNestedObject) {
            // Nested object setter
            var nestedSetter = function (newObj: INotifier) {
                if (!isNotifier(newObj)) {
                    newObj = xp.createNotifierFromObject(newObj);
                }
                obj[fieldName] = newObj;
                obj.onPropertyChanged.invoke(name);
            };
            //var nestedSetter = function (newObj: INotifier) {
            //    if (!newObj.onPropertyChanged) {
            //        //throw new Error('Object must be Notifier.');
            //        newObj = createNotifierFromObject(newObj);
            //    }

            //    if (obj[fieldName] && obj[fieldName].onPropertyChanged) {
            //        // Pass event with all it's handlers
            //        newObj.onPropertyChanged = obj[fieldName].onPropertyChanged;
            //    }

            //    // Set new value, announce the change
            //    obj[fieldName] = newObj;
            //    obj.onPropertyChanged.invoke(name);

            //    // Invoke all nested properties has changed
            //    for (var key in newObj) {
            //        if (key !== 'onPropertyChanged') {
            //            newObj.onPropertyChanged.invoke(key);
            //        }
            //    }
            //};

            //function passChangeEvents(obj:INotifier) {
            //    for (var key in obj) {
            //        if (key !== 'onPropertyChanged') {
            //            newObj.onPropertyChanged.invoke(key);
            //        }
            //    }
            //}
        }

        //
        // Define property

        Object.defineProperty(obj, name, {
            get: getter,
            set: isNestedObject ? nestedSetter : setter,
            enumerable: true,
            configurable: true
        });
    }
} 