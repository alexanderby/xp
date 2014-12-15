module xp {

    /**
     * Defines an object, which notifies of it's properties changes.
     */
    export interface INotifier {
        /**
         * Is invoked when any object's property is changed.
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
     * @param plainSource Source object.
     */
    export function createNotifierFromObject(source: Object): INotifier {
        var obj: INotifier = { onPropertyChanged: new Event<string>() };
        for (var key in source) {
            // Create notification property
            addNotificationProperty(obj, key, source[key]);
        }
        return obj;
    }

    export class BindingManager {
        root;
        path: string;
        target: xp.Ui.Element;
        targetProperty: string;

        constructor(target: xp.Ui.Element, targetProperty: string, sourceProperty: string, source, sourcePath?: string) {
            this.target = target;
            this.targetProperty = targetProperty;
            this.root = source;
            this.path = sourcePath ? sourcePath + '.' + sourceProperty : sourceProperty;

            // Subscribe for source change

            // Subscribe for source property change
        }

        get source() {
            var srcPath = xp.Path.getObjectPath(this.path);
            var src = xp.Path.getPropertyByPath(this.root, srcPath, false);
            return src;
        }

        protected isNotifier(obj) {
            return (<INotifier>obj).onPropertyChanged;
        }

        protected getNotifier(obj): INotifier {
            if (this.isNotifier(obj))
                return <INotifier>obj;
            else
                return null;
        }

        updateSource() {
            var source = this.source;
            if (source) {
                var value = this.target[this.targetProperty];
                source
            }
        }

        updateTarget() { }

        unbind() { }
    }


    //--------
    // PRIVATE
    //--------

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
                throw new Error('Replacement of nested object property breaks the binding.');
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