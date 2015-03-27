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
        protected __convertNested__: boolean;

        /**
         * Creates an object, which notifies of it's properties changes.
         * @param source Source object.
         * @param convertNested Specifies whether to convert nested items into observables. Default is true.
         */
        constructor(source: Object, convertNested = true) {
            this.initProperties();
            this.__convertNested__ = convertNested;
            if (source) {
                this.copySource(source);
            }
        }

        protected initProperties() {
            Object.defineProperty(this, 'onPropertyChanged', {
                configurable: true,
                value: new Event<string>()
            });
            Object.defineProperty(this, '__convertNested__', {
                configurable: true,
                writable: true,
                value: true
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
                ObservableObject.extend(this, key, source[key], this.__convertNested__);
            }
        }

        /**
         * Determines whether specified object can be converted into an observable object.
         * @param source Source object.
         */
        static isConvertable(source): boolean {
            return (typeof source === 'object'
                && !isNotifier(source)
                && source !== null
                && !(source instanceof Date));
        }

        /**
         * Adds property to INotifier.
         * @param obj Notifier.
         * @param name Name of the property to create.
         * @param value Default value.
         * @param convertToObservable Specifies whether to convert value into observable. Default is true.
         */
        static extend(obj: INotifier, name: string, value: any, convertToObservable = true) {
            //
            // Ensure property is not already present.
            if (name in obj) {
                throw new Error('Unable to create notification property. Object already has "' + name + '" property.');
            }
            if (name === 'onPropertyChanged') {
                throw new Error('Unable to create notification property. Reserved name "' + name + '" is used.');
            }

            // Clone date
            if (value instanceof Date) {
                var d = new Date();
                d.setTime((<Date>value).getTime());
                value = d;
            }

            //
            // Getters/setters

            var getter = function () {
                return value;
            };

            // NOTE: Check if property is an object.
            // If so -> make it Observable and use observable setter.
            if (convertToObservable && ObservableObject.isConvertable(value)) {
                value = observable(value);
                var setter = function (newObj) {
                    if (ObservableObject.isConvertable(newObj)) {
                        newObj = observable(newObj);
                    }
                    value = newObj;
                    obj.onPropertyChanged.invoke(name);
                };
            }
            else {
                var setter = function (v) {
                    value = v;
                    obj.onPropertyChanged.invoke(name);
                };
            }

            //
            // Define property

            Object.defineProperty(obj, name, {
                get: getter,
                set: setter,
                enumerable: true,
                configurable: true
            });
        }
    }
    hidePrototypeProperties(ObservableObject);
}