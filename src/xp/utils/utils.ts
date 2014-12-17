module xp {
    /**
     * Extends given object with properties from another one.
     * @param source Object to extend.
     * @param extension Object containing the extensions.
     */
    export function extendObject<TSrc>(source: TSrc, extension): TSrc {
        var result = {};
        for (var key in source) {
            result[key] = source[key];
        }
        for (var key in extension) {
            result[key] = extension[key];
        }
        return <TSrc>result;
    }

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

    /**
     * Returns current stack trace (maybe works in Chrome only).
     */
    export function getStackTrace() {
        var msg: string;
        try {
            throw new Error();
        } catch (e) {
            msg = e.stack;
        }
        if (msg.match(/^Error\n/)) {
            msg = msg.replace(/^Error\n/, 'Stack trace:\n');
        }
        return msg;
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
    export function getClassName(obj) {
        var funcNameRegex = /function (.{1,})\(/;
        var results = funcNameRegex.exec(obj['constructor'].toString());
        return (results && results.length > 1) ? results[1] : '';
    }
}

module xp.Path {
    /**
     * Returns object's property.
     * @param obj Source object.
     * @param path Dotted path to property. If path='.' or '', then source object will be returned.
     * @param [throwErr=true] Throws an error if object not found.
     */
    export function getPropertyByPath(obj, path, throwErr = true) {
        if (!obj) {
            if (throwErr) {
                throw new Error('Unable to get property by path "' + path + '".');
            }
            else {
                return null;
            }
        }

        path = path.replace(/\[(.+)\]/g, '.$1');
        if (path === '' || path === '.') {
            return obj;
        }
        var parts = path.split('.');
        var current = obj;
        parts.every((p) => {
            if (current[p] === void 0) {
                if (throwErr) {
                    throw new Error('Unable to get property by path "' + path + '".');
                }
                current = null;
                return false;
            }
            current = current[p];
            return true;
        });
        return current;
    }

    /**
     * Gets object path from property path.
     * @param propertyPath Property path.
     */
    export function getObjectPath(propertyPath: string): string {
        var matches = propertyPath.match(/^(.*)\.[^\.]*$/);
        if (matches && matches[1]) {
            return matches[1];
        }
        else {
            return '';
        }
    }

    /**
     * Gets property name from property path.
     * @param propertyPath Property path.
     */
    export function getPropertyName(propertyPath: string): string {
        var matches = propertyPath.match(/(^.*\.)?([^\.]*)$/);
        if (matches && matches[2]) {
            return matches[2];
        }
        else {
            return '';
        }
    }
}