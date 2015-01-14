module xp.Binding {
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

        // Create inner object
        var inner = {};
        propertiesNames.forEach((p) => {
            inner[p] = null;
        });
        obj['__inner__'] = inner;

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
    export function createNotifierFrom<T>(source: T/*Object*/): T /*INotifier*/ { // TODO: Mixin<T, INotifier>?
        if (isNotifier(source))
            throw new Error('Source is notifier already.');
        var obj: INotifier = { onPropertyChanged: new Event<string>() };
        obj['__inner__'] = source;
        for (var key in source) {
            // Create notification property
            addNotificationProperty(obj, key);
        }
        return <T><any>obj;
    }

    /**
     * Determines whether object implements INotifier.
     * @param obj Object.
     */
    export function isNotifier(obj) {
        return obj && 'onPropertyChanged' in obj;
    }


    //--------
    // PRIVATE
    //--------

    /**
     * Adds property to INotifier.
     * @param obj Notifier.
     * @param name Name of the property to create.
     */
    function addNotificationProperty(obj: INotifier, name: string) {
        //
        // Ensure property is not already present.
        if (name in obj) {
            throw new Error('Unable to create notification property. Object already has "' + name + '" property.');
        }
        if (name === 'onPropertyChanged') {
            throw new Error('Unable to create notification property. Reserved name "onPropertyChanged" is used.');
        }

        var inner = obj['__inner__'];
        var value = inner[name];

        //
        // Check if property is an object.
        // If so -> make it Notifier.

        if (Array.isArray(value)) {
            inner[name] = new ObservableCollection(value);
            var isNestedObject = true;
        }
        else if (typeof value === 'object') {
            inner[name] = createNotifierFrom(value);
            var isNestedObject = true;
        }

        //
        // Getters/setters

        var getter = function () {
            return inner[name];
        };

        // Simple setter
        var setter = function (value) {
            inner[name] = value;
            obj.onPropertyChanged.invoke(name);
        };

        if (isNestedObject) {
            // Nested object setter
            var nestedSetter = function (newObj) {
                if (Array.isArray(newObj)) {
                    newObj = new ObservableCollection(newObj);
                }
                if (!isNotifier(newObj)) {
                    newObj = createNotifierFrom(newObj);
                }
                inner[name] = newObj;
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