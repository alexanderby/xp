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
                configurable: false,
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

        /**
         * Defines a simple getter and setter for a model instance.
         * @param obj Model instance.
         * @param prop Property name.
         * @param value Default value.
         * @param setterConvertor Performs conversion before a value is set.
         * @param getterConvertor Performs conversion before returning a value.
         */
        static simpleProperty(obj: Model, prop: string, value?: any, setterConvertor?: (v) => any, getterConvertor?: (v) => any) {
            Object.defineProperty(obj, prop, {
                get: () => {
                    return setterConvertor ?
                        getterConvertor(value)
                        : value;
                },
                set: (v) => {
                    value = setterConvertor ?
                        setterConvertor(v)
                        : v;
                    obj.onPropertyChanged.invoke(prop);
                },
                configurable: true,
                enumerable: true
            });
        }

        /**
         * Defines an observable getter and setter for a model instance.
         * @param obj Model instance.
         * @param prop Property name.
         * @param value Default value.
         */
        static observableProperty(obj: Model, prop: string, value?: any) {
            if (ObservableObject.isConvertable(value)) {
                value = observable(value);
            }
            Object.defineProperty(obj, prop, {
                get: () => {
                    return value;
                },
                set: (v) => {
                    if (ObservableObject.isConvertable(v)) {
                        v = observable(v);
                    }
                    value = v;
                    obj.onPropertyChanged.invoke(prop);
                },
                configurable: true,
                enumerable: true
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
} 