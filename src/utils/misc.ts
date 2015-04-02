module xp {
    ///**
    // * Extends given object with properties from another one.
    // * @param source Object to extend.
    // * @param extension Object containing the extensions.
    // */
    //export function extendObject<TSrc, TExt>(source: TSrc, extension: TExt): TSrc { // TODO: Mixin.
    //    var result = {};
    //    for (var key in source) {
    //        result[key] = source[key];
    //    }
    //    for (var key in extension) {
    //        result[key] = extension[key];
    //    }
    //    return <TSrc>result;
    //}

    /**
     * Replaces each format item in a specified string with values.
     * @param formatStr A composite format string.
     * @param args Arguments to insert into formatting string.
     */
    export function formatString(format: string, ...ars: any[]): string {
        var s = format;
        for (var i = 0; i < ars.length; i++) {
            s = s.replace(new RegExp("\\{" + i + "\\}", "gm"), ars[i]);
        }
        return s;
    }

    ///**
    // * Returns current stack trace (maybe works in Chrome only).
    // */
    //export function getStackTrace() {
    //    var msg: string;
    //    try {
    //        throw new Error();
    //    } catch (e) {
    //        msg = e.stack;
    //    }
    //    if (msg.match(/^Error\n/)) {
    //        msg = msg.replace(/^Error\n/, 'Stack trace:\n');
    //    }
    //    return msg;
    //}

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
    export function getClassName(obj) {
        var funcNameRegex = /function\s+(.+?)\s*\(/;
        var results = funcNameRegex.exec(obj['constructor'].toString());
        return (results && results.length > 1) ? results[1] : '';
    }

    /**
     * Converts enum into array.
     * @param en Enum.
     */
    export function enumToArray(en: any): string[] {
        var items = [];
        for (var key in en) {
            if (!isNaN(parseInt(key))) {
                items.push(en[key]);
            }
        }
        return items;
    }

    //// http://stackoverflow.com/a/728694/4137472
    ///**
    // * Creates a deep copy of an object.
    // * Will infinitely loop on circular references.
    // */
    //export function clone(obj: any): any {
    //    var copy;

    //    // Handle the 3 simple types, and null or undefined
    //    if (null == obj || "object" != typeof obj) return obj;

    //    // Handle Date
    //    if (obj instanceof Date) {
    //        copy = new Date();
    //        copy.setTime(obj.getTime());
    //        return copy;
    //    }

    //    // Handle Array
    //    if (obj instanceof Array) {
    //        copy = [];
    //        for (var i = 0, len = obj.length; i < len; i++) {
    //            copy[i] = clone(obj[i]);
    //        }
    //        return copy;
    //    }

    //    // Handle Object
    //    if (obj instanceof Object) {
    //        copy = {};
    //        for (var attr in obj) {
    //            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
    //        }
    //        return copy;
    //    }

    //    throw new Error("Unable to copy obj! Its type isn't supported.");
    //}

    /**
     * Creates new object and applies arguments to constructor.
     * @param ctor Type of object.
     * @param args Arguments to apply.
     * @returns New object.
     */
    export function applyConstructor<T extends Object>(ctor: new (...args) => T, args: any[]): T {
        // http://stackoverflow.com/a/1608546/4137472
        //function F(): void {
        //    constructor.apply(this, args);
        //}
        //F.prototype = constructor.prototype;
        //return new F();

        // http://stackoverflow.com/a/24963721/4137472
        switch (args.length) {
            case 0: return new ctor();
            case 1: return new ctor(args[0]);
            case 2: return new ctor(args[0], args[1]);
            case 3: return new ctor(args[0], args[1], args[2]);
            case 4: return new ctor(args[0], args[1], args[2], args[3]);
            case 5: return new ctor(args[0], args[1], args[2], args[3], args[4]);
            case 6: return new ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
            case 7: return new ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
            case 8: return new ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
            default: throw new Error('Two much arguments to apply to constructor.');
        }
    }

    /**
     * Hides type's prototype properties (makes them non-enumerable).
     * @param ctor Type constructor.
     */
    export function hidePrototypeProperties(ctor: new (...args) => Object) {
        var proto = ctor.prototype;
        for (var prop in proto) {
            var desc = Object.getOwnPropertyDescriptor(proto, prop);
            if (desc && desc.configurable) {
                desc.enumerable = false;
                Object.defineProperty(proto, prop, desc);
            }
        }
    }
}