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
         */
        static simpleProperty(obj: Model, prop: string, value?: any) {
            Object.defineProperty(obj, prop, {
                get: () => {
                    return value;
                },
                set: (v) => {
                    value = v;
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
            if (value && !isNotifier(value)) {
                value = observable(value);
            }
            Object.defineProperty(obj, prop, {
                get: () => {
                    return value;
                },
                set: (v) => {
                    if (xp.ObservableObject.isConvertable(v)) {
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
         * Defines a nested model property.
         * Allows creating right model instances when doing JSON deserialization.
         * @param obj Model instance.
         * @param prop Property name.
         * @param propModel Property model constructor. Must be parameterless.
         * @param value Default value.
         */
        static modelProperty<T extends Model>(obj: Model, prop: string, propModel: new () => T, value?: T) {
            if (value) {
                value = Model.createModel(propModel, value);
            }
            Object.defineProperty(obj, prop, {
                get: () => {
                    return value;
                },
                set: (v) => {
                    v = Model.createModel(propModel, v);
                    value = v;
                    obj.onPropertyChanged.invoke(prop);
                },
                configurable: true,
                enumerable: true
            });
        }

        private static createModel<T extends Model>(model: new () => T, source: Object): T {
            if (source instanceof model) {
                return <T>source;
            }
            else {
                // Create model, copy values
                var m = new model();
                for (var key in source) {
                    m[key] = source[key];
                }
                return m;
            }
        }

        /**
        * Defines a nested model collection property.
        * Allows filling the collection with right model instances when doing JSON deserialization.
        * @param obj Model instance.
        * @param prop Property name.
        * @param model Model constructor. Must be parameterless.
        * @param items Default items collection.
        */
        static modelCollection<T extends Model>(obj: Model, prop: string, model: new () => T, items?: Array<T>) {
            items = Model.createCollection(model, items);
            Object.defineProperty(obj, prop, {
                get: () => {
                    return items;
                },
                set: (v) => {
                    v = Model.createCollection(model, v);
                    items = v;
                    obj.onPropertyChanged.invoke(prop);
                },
                configurable: true,
                enumerable: true
            });
        }

        private static createCollection<T extends Model>(model: new () => T, source: T[]): ModelCollection<T> {
            if (source instanceof ModelCollection) {
                if ((<ModelCollection<T>>source).model !== model) {
                    throw new Error('Collection model mismatch.');
                }
                return <ModelCollection<T>>source;
            } else {
                // Create model collection
                return new ModelCollection(model, source)
            }
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

        /**
         * Creates a model instance from JSON string.
         * @param modelCtor Model constructor. Must be parameterless.
         * @param json JSON string or object.
         */
        static parseModel<T extends Model>(modelCtor: new () => T, json: string|Object): T {
            var source = typeof json === 'string' ? JSON.parse(json) : json;
            if (typeof source !== 'object') {
                throw new Error('Unable to parse a model. The specified string does not contain an object. JSON: ' + json);
            }
            else if (Array.isArray(source)) {
                throw new Error('Unable to parse a model. The specified string contains an array. Use parseCollection() method.');
            }
            var model = new modelCtor();
            for (var key in source) {
                model[key] = source[key];
            }
            return model;
        }

        /**
         * Creates a model collection from JSON string.
         * @param modelCtor Model constructor. Must be parameterless.
         * @param json JSON string or array.
         */
        static parseCollection<T extends Model>(modelCtor: new () => T, json: string|Object[]): ModelCollection<T> {
            var source = typeof json === 'string' ? JSON.parse(json) : json;
            if (!Array.isArray(source)) {
                throw new Error('Unable to parse a collection. The specified string doesn not contain an array. JSON: ' + json);
            }
            var collection = new ModelCollection(modelCtor, source);
            return collection;
        }
    }


    //-----------
    // COLLECTION
    //-----------

    /**
     * Collection of models.
     */
    export class ModelCollection<T extends Model> extends ObservableCollection<T>{
        model: new () => T;

        /**
         * Creates a collection of models.
         * @param modelCtor Model type constructor.
         * @param collection Initial items.
         */
        constructor(modelCtor: new () => T, collection?: Array<T>) {
            super();
            this.model = modelCtor;
            if (collection) {
                this.copySource(collection);
            }
        }

        //
        // Overrides

        protected createNotifierIfPossible(item): Notifier {
            if (!(item instanceof this.model)) {
                // Create model instance and copy values
                var m = new this.model();
                for (var key in item) {
                    m[key] = item[key];
                }
                item = m;
            }
            return item;
        }
    }
    hidePrototypeProperties(ModelCollection);
} 