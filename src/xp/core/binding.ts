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
     * @param [deep] If specified and property is object, then property will be able to notify of it's changes.
     * @param [path] Path from [grand]parent object to source object.
     */
    export function createNotifierFromObject(source: Object, deep?: boolean, path?: string): INotifier {
        var obj: INotifier = { onPropertyChanged: new Event<string>() };
        for (var key in source) {
            if (deep && typeof source[key] === 'object') {
                // If property is object and deep creation enabled.
                var propObj = createNotifierFromObject(source[key], true, path);
            }

            // Create notification property
            addNotificationProperty(obj, key, path, propObj || source[key]);
        }
        return obj;
    }


    //--------
    // PRIVATE
    //--------

    /**
     * Adds property to INotifier.
     * @param obj Notifier.
     * @param name Name of the property to create.
     * @param [path] Path from [grand]parent object to source object.
     * @param [value] Default property value.
     */
    function addNotificationProperty(obj: INotifier, name: string, path?: string, value?) {
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

        // If nested object - combine path.
        var path = (path !== void 0 ? path + '.' : '') + name;

        //var getter = function () {
        //    return obj[fieldName];
        //};
        //var setter = function (value) {
        //    obj[fieldName] = value;
        //    obj.onPropertyChanged.invoke(name);
        //};
        //var deepSetter = function (newObj) {

        //}

        // Define property
        Object.defineProperty(obj, name, {
            get: function () {
                return obj[fieldName];
            },
            set: function (value) {
                obj[fieldName] = value;
                obj.onPropertyChanged.invoke(path);
            },
            enumerable: true,
            configurable: true
        });
    }
} 