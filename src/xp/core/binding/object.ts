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
     * Determines whether object implements INotifier.
     * @param obj Object.
     */
    export function isNotifier(obj) {
        return obj && typeof obj === 'object' && 'onPropertyChanged' in obj;
    }


    /**
     * An object which notifies of it's changes.
     */
    export class ObservableObject implements INotifier {
        protected __inner__: Object;
        onPropertyChanged: xp.Event<string>;

        /**
         * Creates an object, which notifies of it's properties changes.
         * WARNING: The source's nested object-properties will be replaced with observables.
         * @param source Source object.
         */
        constructor(source: Object) {
            this.init(source);
        }

        protected init(source) {
            if (source instanceof ObservableObject) {
                throw new Error('Source object is an observer already.');
            }
            if (Array.isArray(source)) {
                throw new Error('Source must not be an array. Use ObservableCollection.');
            }
            if (!(source instanceof Object)) {
                throw new Error('Source must be an object.');
            }

            Object.defineProperty(this, 'onPropertyChanged', {
                configurable: true,
                enumerable: false,
                value: new Event<string>()
            });
            Object.defineProperty(this, '__inner__', {
                configurable: true,
                enumerable: false,
                value: source
            });

            for (var key in source) {
                // Create notification property
                addNotificationProperty(this, key);
            }
        }
    }

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
        if (name === 'onPropertyChanged' || name === '__inner__' || name === '__create__') {
            throw new Error('Unable to create notification property. Reserved name "' + name + '" is used.');
        }

        var inner = obj['__inner__'];
        var value = inner[name];
        if (value === null)
            value = {};

        //
        // Check if property is an object.
        // If so -> make it Notifier.

        if (Array.isArray(value)) {
            inner[name] = new ObservableCollection(value);
            var isNestedObject = true;
        }
        else if (typeof value === 'object' && !isNotifier(value)) {
            inner[name] = new ObservableObject(value);
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
                if (newObj === null) {
                    newObj = {};
                }
                else if (Array.isArray(newObj)) {
                    newObj = new ObservableCollection(newObj);
                }
                else if (!isNotifier(newObj)) {
                    newObj = new ObservableObject(newObj);
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