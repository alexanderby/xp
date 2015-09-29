module xp {

    /**
     * Descriptor for setting property's enumerability.
     */
    export var enumerable = function(value: boolean): MethodDecorator {
        return function(proto: Object, propName: string, descr?: PropertyDescriptor) {
            descr.enumerable = value;
        };
    }

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
        
        /**
         * Method called by JSON.stringify()
         */
        // @enumerable(false)
        // toJSON() {
        //     var result = {};
        //     var keys = Object.keys(Object.getPrototypeOf(this));
        //     keys.splice(keys.indexOf('constructor'), 1);
        //     var ownKeys = Object.keys(this);
        //     for (var i = 0; i < ownKeys.length; i++) {
        //         if (keys.indexOf(ownKeys[i]) < 0) {
        //             keys.push(ownKeys[i]);
        //         }
        //     }
        //     for (var i = 0; i < keys.length; i++) {
        //         result[keys[i]] = this[keys[i]];
        //     }
        //     result['__xp_model__'] = getClassName(this);
        //     return result;
        // }
    }
    
    /**
     * Model property decorator.
     * Creates a property that notifies of it's change.
     */
    export var property: PropertyDecorator = function(proto: Object, propName: string) {
        var fieldName = '_' + propName;

        var desc = Object.getOwnPropertyDescriptor(proto, propName);
            
        // Define property
        Object.defineProperty(proto, propName, {
            get: function() { return this[fieldName] },
            set: function(v) {
                if (!(fieldName in this)) {
                    Object.defineProperty(this, fieldName, {
                        configurable: true,
                        writable: true
                    })
                }
                this[fieldName] = v;
                (<Notifier>this).onPropertyChanged.invoke(propName);
            },
            configurable: true,
            enumerable: desc ? desc.enumerable : true
        });
    };
} 