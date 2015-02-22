module xp {
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

        /**
         * Defines simple getter and setter for a model instance.
         */
        static defineProperty(model: Model, prop: string, value: any) {
            Object.defineProperty(model, prop, {
                get: () => {
                    return value;
                },
                set: (v) => {
                    value = v;
                    model.onPropertyChanged.invoke(prop);
                }
            });
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