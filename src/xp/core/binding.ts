module xp {
    /**
     * Creates bindable object.
     * Change-notifications can be reached by subscribing to 'onPropertyChanged' event.
     * Values should be changed through 'data' property object.
     * @param obj Source object.
     * @param [propertyNames] If specified, determines which properties' changes should be tracked. In other case all properties' changes would be tracked.
     */
    export function createBindableObject<T>(obj: T, propertyNames?: string[]): BindableObject<T> {
        var b: BindableObject<T> = {
            onPropertyChanged: new Event<PropertyChangedArgs>(),
            data: <T>{},
            source: obj
        };
        if (propertyNames) {
            // Track specified properties
            propertyNames.forEach((name) => {
                createProperty(b, name);
            });
        }
        else {
            // Track all properties
            for (var key in obj) {
                createProperty(b, key);
            }
        }
        return b;
    }

    function createProperty<T>(bObj: BindableObject<T>, name: string) {
        Object.defineProperty(bObj.data, name, {
            get: function () {
                return bObj.source[name];
            },
            set: function (value) {
                var oldValue = bObj.source[name];
                bObj.source[name] = value;
                bObj.onPropertyChanged.invoke({
                    propertyName: name,
                    oldValue: oldValue,
                    newValue: value
                });
            },
            enumerable: true,
            configurable: true
        });
    }

    /**
     * Arguments of object's property changed event.
     */
    export interface PropertyChangedArgs {
        propertyName: string;
        oldValue: any;
        newValue: any;
        //invoker?: any;
    }

    /**
     * Represents an object which notifies of it's properties' changes.
     */
    export interface INotifier {
        /**
         * Is invoked when any object's property is changed.
         */
        onPropertyChanged: Event<PropertyChangedArgs>;
    }

    /**
     * Bindable object.
     * Change-notifications can be reached by subscribing to 'onPropertyChanged' event.
     * Values should be changed through 'data' property object.
     */
    export interface BindableObject<T> extends INotifier {
        /**
         * Is invoked when any object's property is changed.
         */
        onPropertyChanged: Event<PropertyChangedArgs>;
        /**
         * Changes should be made through this object.
         */
        data: T;
        /**
         * Source object. Changes made to 'data' property will be reflected on this property too.
         */
        source: T;
    }
} 