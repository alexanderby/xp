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

        ///**
        // * Defines a property which notifies of it's change.
        // * @param prop Property name.
        // * @param value Default value. If observable then setted values will be converted to observable.
        // * @param opts Model property options. Convertors can be defined here. Enumerable by default.
        // */
        //defineProperty(prop: string, value?, opts?: ModelPropertyOptions) {
        //    Model.property(this, prop, value, opts);
        //}

        /**
         * Is invoked when any property is changed.
         */
        onPropertyChanged: Event<string>;


        //-----------------
        // Static functions
        //-----------------

        // TODO: Use Typescript 1.5 decorators por property definitions?

        /**
         * Defines a getter and setter for a model instance, which notifies of it's change.
         * @param obj Model instance.
         * @param prop Property name.
         * @param value Default value. If observable then setted values will be converted to observable.
         * @param opts Model property options. Convertors can be defined here. Enumerable by default.
         */
        static property(obj: Notifier, prop: string, value?, opts?: ModelPropertyOptions) {
            opts = opts || {};
            var convertToObservable = isNotifier(value);
            var convertNested = value instanceof ObservableObject ? value['__convertNested__'] : false;
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
    }
} 