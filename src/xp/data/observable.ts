module xp {
    
    /**
     * Creates an object or collection, which notifies of it's properties changes.
     * WARNING: Avoid circular references.
     * WARNING: Source properties must be initialized 
     * (at least have {} or [] but not null or undefined).
     */
    export function observable<T>(source: T) {
        // Check
        if (source instanceof ObservableObject) {
            throw new Error('Source object is an observer already.');
        }
        if (!(source instanceof Object)) {
            throw new Error('Source must be an object.');
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