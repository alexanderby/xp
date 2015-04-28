module xp {
    
    /**
     * Creates an object or collection, which notifies of it's properties changes.
     * WARNING: Avoid circular references.
     * WARNING: Source properties must be initialized (have some value).
     * New properties may be added using ObservableObject.extend().
     * @param source Source object.
     * @param convertNested Specifies whether to convert nested items into observables. Default is true.
     */
    export function observable<T>(source: T, convertNested = true) {
        // Check
        if (isNotifier(source)) {
            throw new Error('Source object is already observable.');
        }
        if (!(typeof source === 'object')) {
            throw new Error('Source must be an object.');
        }
        else if (source instanceof Date) {
            throw new Error('Dates cannot be converted into an observable.');
        }

        // Return
        if (Array.isArray(source)) {
            return <T><any>new ObservableCollection(<Array<any>><any>source, convertNested);
        }
        else {
            return <T><any>new ObservableObject(source, convertNested);
        }
    }
} 