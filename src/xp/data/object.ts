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
        onPropertyChanged: xp.Event<string>;

        /**
         * Creates an object, which notifies of it's properties changes.
         * @param source Source object.
         */
        constructor(source: Object) {
            this.initProperties();
            if (source) {
                this.copySource(source);
            }
        }

        protected initProperties() {
            Object.defineProperty(this, 'onPropertyChanged', {
                configurable: true,
                enumerable: false,
                value: new Event<string>()
            });
        }

        protected copySource(source: Object) {
            if (source instanceof ObservableObject) {
                throw new Error('Source object is already observable.');
            }
            if (Array.isArray(source)) {
                throw new Error('Source must not be an array. Use ObservableCollection.');
            }
            if (!(source instanceof Object)) {
                throw new Error('Source must be an object.');
            }

            for (var key in source) {
                // Create notification property
                addNotificationProperty(this, key, source[key]);
            }
        }
    }

    /**
     * Adds property to INotifier.
     * @param obj Notifier.
     * @param name Name of the property to create.
     * @param value Default value.
     */
    function addNotificationProperty(obj: INotifier, name: string, value: any) {
        //
        // Ensure property is not already present.
        if (name in obj) {
            throw new Error('Unable to create notification property. Object already has "' + name + '" property.');
        }
        if (name === 'onPropertyChanged') {
            throw new Error('Unable to create notification property. Reserved name "' + name + '" is used.');
        }

        if (value === null)
            value = {}; // TODO: How to handle nulls?


        //
        // Check if property is an object.
        // If so -> make it Notifier.

        if (typeof value === 'object' && !isNotifier(value)) {
            value = observable(value);
            var isNestedObject = true;
        }

        ////
        //// Create private field
        //var fieldName = '_' + name;
        //Object.defineProperty(obj, fieldName, {
        //    configurable: true,
        //    enumerable: false,
        //    writable: true,
        //    value: value
        //});

        //
        // Getters/setters

        var getter = function () {
            return value;
        };

        // Simple setter
        var setter = function (v) {
            value = v;
            obj.onPropertyChanged.invoke(name);
        };

        if (isNestedObject) {
            // Nested object setter
            var nestedSetter = function (newObj) {
                if (newObj === null) {
                    newObj = {};
                }
                if (!isNotifier(newObj)) {
                    newObj = observable(newObj);
                }
                value = newObj;
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