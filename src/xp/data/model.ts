module xp {
    // TODO: Define properties for model's prototype?

    /**
     * Base observable model.
     */
    export class Model implements INotifier {

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
         * Defines simple getter and setter for a model instance.
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
         * Defines observable getter and setter for a model instance.
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
                    if (value && !isNotifier(v)) {
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
         * Defines nested model property.
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
        * Defines nested model collection property.
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
         * Creates a model instance from JSON string.
         * @param modelCtor Model constructor. Must be parameterless.
         * @param json JSON string.
         */
        static parseModel<T extends Model>(modelCtor: new () => T, json: string): T {
            var source = JSON.parse(json);
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
         * @param json JSON string.
         */
        static parseCollection<T extends Model>(modelCtor: new () => T, json: string): ModelCollection<T> {
            var source = JSON.parse(json);
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

    export class ModelCollection<T extends Model> extends ObservableCollection<T>{
        model: new () => T;

        constructor(modelCtor: new () => T, collection?: Array<T>) {
            super();
            this.model = modelCtor;
            if (collection) {
                this.copySource(collection);
            }
        }

        //
        // Overrides

        protected createNotifier(item): INotifier {
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

    //class Animal extends xp.Model {
    //    id: number;
    //    name: string;

    //    constructor(id: string, name: string) {
    //        super();
    //        xp.Model.defineProperty(this, 'id', id);
    //        xp.Model.defineProperty(this, 'name', name);
    //    }
    //}
} 