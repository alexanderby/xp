﻿module xp.Binding {
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
     * Notification properties and fiels for storing data will be
     * created for every source property.
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
     * Determines whether object implements INotifier.
     * @param obj Object.
     */
    export function isNotifier(obj) {
        return !!(<INotifier>obj).onPropertyChanged;
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
        //if (obj[name] !== void 0) {
        //    throw new Error('Unable to create notification property. Object already has "' + name + '" property.');
        //}
        //if (name === 'onPropertyChanged') {
        //    throw new Error('Unable to create notification property. Reserved name is used.');
        //}
        var fieldName = '_' + name;
        //if (obj[fieldName]) {
        //    throw new Error('Unable to create field for notification property. Object already has "' + fieldName + '" property.');
        //}
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
                    newObj = createNotifierFromObject(newObj);
                }
                obj[fieldName] = newObj;
                obj.onPropertyChanged.invoke(name);
            };
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