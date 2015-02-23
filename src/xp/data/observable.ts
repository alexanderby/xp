module xp {
    
    /**
     * Creates an object or collection, which notifies of it's properties changes.
     * WARNING: Avoid circular references.
     * WARNING: Source properties must be initialized (have some value).
     * New properties may be added using ObservableObject.extend().
     */
    export function observable<T>(source: T) {
        // Check
        if (isNotifier(source)) {
            throw new Error('Source object is already observable.');
        }
        if (!(typeof source === 'object')) {
            throw new Error('Source must be an object.');
        }
        else if(source instanceof Date) {
            throw new Error('Dates cannot be converted into an observable.');
        }

        // Return
        if (Array.isArray(source)) {
            return <T><any>new ObservableCollection(<Array<any>><any>source);
        }
        else {
            return <T><any>new ObservableObject(source);
        }
    }

    /**
     * Creates a plain object that repeates the structure
     * of the source observable object.
     */
    export function plain<T>(observable: T) {
        return JSON.parse(JSON.stringify(observable));
    }
} 