module xp.Path {

    /**
     * Returns object's property.
     * @param obj Source object.
     * @param path Path to property. If path='', then source object will be returned.
     * @param [throwErr=true] Throws an error if property not found.
     */
    export function getPropertyByPath(obj, path, throwErr = true) {
        if (!obj) {
            if (throwErr) {
                throw new Error('Unable to get property by path "' + path + '".');
            }
            else {
                return void 0;
            }
        }

        path = path.replace(/\[(.+)\]/g, '.$1');
        if (path === '') {
            return obj;
        }
        var parts = path.split('.');
        var current = obj;
        parts.every((p) => {
            if (current[p] === void 0 || current[p] === null) {
                if (throwErr) {
                    throw new Error('Unable to get property by path "' + path + '".');
                }
                current = current[p];
                return false;
            }
            current = current[p];
            return true;
        });
        return current;
    }

    /**
     * Sets property value by path.
     * @param obj Source object.
     * @param path Path to property.
     * @param value Value.
     * @param [throwErr=true] Throws an error if property not found.
     */
    export function setPropertyByPath(obj, path, value, throwErr = true) {
        var objPath = getObjectPath(path);
        var obj = getPropertyByPath(obj, objPath, throwErr);
        var propName = getPropertyName(path);

        // TODO: Allow adding properties?
        if (!(propName in obj) && throwErr) {
            throw new Error(
                xp.formatString('Unable to set property value "{0}" by path "{1}". Property is unreachable.', value, path));
        }

        obj[propName] = value;
    }

    /**
     * Gets object path from property path.
     * @param propertyPath Property path.
     */
    export function getObjectPath(propertyPath: string): string {
        propertyPath = propertyPath.replace(/\[(.+)\]/g, '.$1');
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
        propertyPath = propertyPath.replace(/\[(.+)\]/g, '.$1');
        var matches = propertyPath.match(/(^.*\.)?([^\.]*)$/);
        if (matches && matches[2]) {
            return matches[2];
        }
        else {
            return '';
        }
    }

    /**
     * Replaces path indexers with properties.
     * E.g. "obj[value].prop" transforms into "obj.value.prop".
     * @param path Property path.
     */
    export function replaceIndexers(path: string): string {
        // Without validation
        //var result = path.replace(indexerRegex, '.$1');

        // With property identifier validation.
        var result = path.replace(indexerRegex,(match, m1) => {
            if (!identifierRegex.test(m1)) {
                throw new Error(
                    xp.formatString('Wrong property identifier. Property: "{0}". Path: "{1}".', path, m1));
            }
            return '.' + m1;
        });

        return result;
    }
    var indexerRegex = /\[(.+?)\]/g;
    //var identifierRegex = /^[$A-Z_][0-9A-Z_$]*$/i;
    var identifierRegex = /^[0-9A-Z_$]*$/i;
}