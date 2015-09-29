module xp {

    /**
     * Creates a deep copy of an item.
     * Only enumerable properties will be copied.
     * @param item Item to copy.
     */
    export function clone<T>(item: T): T {
        var sources = [];
        var results = [];

        var cloneItem = (item) => {
            var index = sources.indexOf(item);
            if (index >= 0) {
                return results[index];
            }

            // Simple types
            var itemType = typeof item;
            if (item === null
                || itemType === 'string'
                || itemType === 'boolean'
                || itemType === 'number'
                || itemType === 'undefined'
            // TODO: Maybe clone anonimous functions
            // in this way http://stackoverflow.com/a/6772648/4137472
                || itemType === 'function'
                ) {
                return item;
            }
            // Complex types
            else if (item instanceof Object) {
                var result;

                // Date
                if (item instanceof Date) {
                    var d = new Date();
                    d.setDate((<Date>item).getTime());
                    result = d;
                }
                // Array
                else if (item instanceof Array) {
                    var arr = [];
                    for (var i = 0; i < (<any[]>item).length; i++) {
                        arr[i] = cloneItem(item[i]);
                    }
                    result = arr;
                }
                // Observable collection
                else if (item instanceof xp.ObservableCollection) {
                    var col = new xp.ObservableCollection();
                    for (var i = 0; i < (<any[]>item).length; i++) {
                        col.push(cloneItem(item[i]));
                    }
                    result = col;
                }
                // Observable object
                else if (item instanceof xp.ObservableObject) {
                    var obj = {};
                    for (var key in item) {
                        obj[key] = cloneItem(item[key]);
                    }
                    result = xp.observable(obj);
                }
                // DOM node
                else if (item instanceof Node) {
                    result = (<Node>item).cloneNode(true);
                }
                // Other objects
                else {
                    var ctor = Object.getPrototypeOf(item).constructor;
                    var instance = new ctor();
                    for (var key in item) {
                        if ((<Object>item).hasOwnProperty(key)) {
                            instance[key] = cloneItem(item[key]);
                        }
                    }
                    result = instance;
                }

                sources.push(item);
                results.push(result);
                return result;
            }
            else {
                throw new Error('Item type is not supported for cloning.');
            }
        };

        return cloneItem(item);
    }

    /**
     * Creates unique identifier.
     */
    export function createUuid() {
        // http://www.ietf.org/rfc/rfc4122.txt
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";

        var uuid = s.join("");
        return uuid;
    }

    /**
     * Gets class name of object.
     * @param obj Object.
     */
    export function getClassName(obj: Object) {
        var funcNameRegex = /function\s+(.+?)\s*\(/;
        var results = funcNameRegex.exec(obj['constructor'].toString());
        return (results && results.length > 1) ? results[1] : '';
    }

    /**
     * Creates new object by passing arguments to constructor.
     * @param ctor Type of object.
     * @param args Arguments to apply.
     * @returns New object.
     */
    export function applyConstructor<T extends Object>(ctor: new (...args) => T, args: any[]): T {
        // http://stackoverflow.com/a/8843181/4137472
        return new (ctor.bind.apply(ctor, [null].concat(args)));
    }
}