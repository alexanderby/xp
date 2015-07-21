module xp {
    // TODO: Define properties for model's prototype?

    /**
     * Base observable model.
     */
    export class Model implements Notifier {

        /**
         * Creates an observable model.
         */
        constructor() {
            Object.defineProperty(this, 'onPropertyChanged', {
                enumerable: false,
                configurable: true,
                writable: false,
                value: new Event()
            });
        }

        /**
         * Is invoked when any property is changed.
         */
        onPropertyChanged: Event<string>;


        //-----------------
        // Static functions
        //-----------------

        // TODO: Use Typescript 1.5 decorators for property definitions?

        /**
         * Defines a getter and setter for a model instance, which notifies of it's change.
         * @param obj Model instance.
         * @param prop Property name.
         * @param value Default value. If observable then setted values will be converted to observable.
         * @param opts Model property options. Convertors can be defined here. Enumerable by default.
         */
        static property(obj: Notifier, prop: string, value?, opts?: ModelPropertyOptions) {
            opts = opts || {};
            var convertToObservable = opts.convertToObservable || isNotifier(value);
            var convertNested = opts.convertNested || (
                value instanceof ObservableObject
                    ? value['__convertNested__']
                    : false);
            if (opts.enumerable === void 0) {
                opts.enumerable = true;
            }

            // Getter
            if (opts.getterConvertor) {
                var getterConvertor = opts.getterConvertor;
                var getter = () => getterConvertor(value);
            }
            else {
                var getter = () => value;
            }

            // Setter
            if (opts.setterConvertor) {
                var setterConvertor = opts.setterConvertor;
                if (convertToObservable) {
                    var setter = (v) => {
                        if (ObservableObject.isConvertable(v)) {
                            v = observable(v, convertNested);
                        }
                        value = setterConvertor(v);
                        obj.onPropertyChanged.invoke(prop);
                    };
                }
                else {
                    var setter = (v) => {
                        value = setterConvertor(v);
                        obj.onPropertyChanged.invoke(prop);
                    };
                }
            }
            else {
                if (convertToObservable) {
                    var setter = (v) => {
                        if (ObservableObject.isConvertable(v)) {
                            v = observable(v, convertNested);
                        }
                        value = v;
                        obj.onPropertyChanged.invoke(prop);
                    };
                }
                else {
                    var setter = (v) => {
                        value = v;
                        obj.onPropertyChanged.invoke(prop);
                    };
                }
            }

            // Define property
            Object.defineProperty(obj, prop, {
                get: getter,
                set: setter,
                configurable: true,
                enumerable: opts.enumerable
            });
        }

        /**
         * Defines a non-enumerable and non-observable field.
         * @param obj Model instance.
         * @param prop Field name.
         * @param value Default value.
         */
        static nonEnumerableField<T extends Model>(obj: Model, field: string, value?: any) {
            Object.defineProperty(obj, field, {
                enumerable: false,
                configurable: true,
                writable: true,
                value: value
            });
        }
    }
    //hidePrototypeProperties(Model);

    /**
     * Options of a model property.
     */
    export interface ModelPropertyOptions {
        setterConvertor?: (v) => any;
        getterConvertor?: (v) => any;
        enumerable?: boolean;
        convertToObservable?: boolean;
        convertNested?: boolean;
    }
    
    /**
     * Model property decorator.
     */
    export function property(opts?: ModelPropertyOptions): PropertyDecorator {
        opts = opts || {};
        return function(proto: Model, propName: string) {
            var convertToObservable = opts.convertToObservable;
            var convertNested = opts.convertNested;
            var enumerable = opts.enumerable === void 0 ? true : opts.enumerable;

            var fieldName = '_' + propName;
            
            // Getter
            if (opts.getterConvertor) {
                var getterConvertor = opts.getterConvertor;
                var getter = function() { return getterConvertor(this[fieldName]); };
            }
            else {
                var getter = function() { return this[fieldName]; };
            }

            // Setter
            if (opts.setterConvertor) {
                var setterConvertor = opts.setterConvertor;
                if (convertToObservable) {
                    var setter = function(v) {
                        if (ObservableObject.isConvertable(v)) {
                            v = observable(v, convertNested);
                        }
                        this[fieldName] = setterConvertor(v);
                        (<Notifier>this).onPropertyChanged.invoke(propName);
                    };
                }
                else {
                    var setter = function(v) {
                        this[fieldName] = setterConvertor(v);
                        (<Notifier>this).onPropertyChanged.invoke(propName);
                    };
                }
            }
            else {
                if (convertToObservable) {
                    var setter = function(v) {
                        if (ObservableObject.isConvertable(v)) {
                            v = observable(v, convertNested);
                        }
                        this[fieldName] = v;
                        (<Notifier>this).onPropertyChanged.invoke(propName);
                    };
                }
                else {
                    var setter = function(v) {
                        this[fieldName] = v;
                        (<Notifier>this).onPropertyChanged.invoke(propName);
                    };
                }
            }
            
            // Define property
            Object.defineProperty(proto, propName, {
                get: getter,
                set: setter,
                configurable: true,
                enumerable: enumerable
            });
            
            // Define field
            Object.defineProperty(proto, fieldName, {
                writable: true,
                configurable: true,
                enumerable: false
            });
        };
    };
} 