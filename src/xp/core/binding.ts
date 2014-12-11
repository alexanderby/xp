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
     * Creates object, which notifies of it's properties changes.
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
     * @param plainSource Plain source object.
     */
    export function createNotifierFromObject(plainSource): INotifier {
        var obj: INotifier = { onPropertyChanged: new Event<string>() };
        for (var key in plainSource) {
            addNotificationProperty(obj, key, obj[key]);
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
     * @param [value] Default property value.
     */
    function addNotificationProperty(obj: INotifier, name: string, value?) {
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

        // Define property
        Object.defineProperty(obj, name, {
            get: function () {
                return obj[fieldName];
            },
            set: function (value) {
                obj[fieldName] = value;
                obj.onPropertyChanged.invoke(name);
            },
            enumerable: true,
            configurable: true
        });
    }
} 