module xp {
    // TODO: Serialize and restore circular references (e.g. by "id" like in Inker).

    /**
     * Serializes item to JSON.
     * @param item Item to serialize.
     * @param writeModel Specifies whether to write models prototypes names (adds __xp_model__ property). Default is true.
     * @param replacer A function that transforms the result.
     * @param whiteSpace Specifies whether to add white space into output. Default is " ".
     */
    export function serialize(item: any, options?: { writeModel?: boolean, replacer?: (k: string, v: any) => any, whiteSpace?: string|number }): string {
        options = options || <any>{};
        if (options.writeModel === void 0) { options.writeModel = true; }
        if (options.whiteSpace === void 0) { options.whiteSpace = ''; }
        return JSON.stringify(item, function(k, v) {
            var result = {};
            if (v instanceof ObservableObject
                || v instanceof ObservableCollection
                || v instanceof Model) {
                // TODO: Determine proper way of serializing
                var keys = Object.keys(Object.getPrototypeOf(v));
                keys.splice(keys.indexOf('constructor'), 1);
                var ownKeys = Object.keys(v);
                for (var i = 0; i < ownKeys.length; i++) {
                    if (keys.indexOf(ownKeys[i]) < 0) {
                        keys.push(ownKeys[i]);
                    }
                }
                for (var i = 0; i < keys.length; i++) {
                    result[keys[i]] = v[keys[i]];
                }
            } else if (typeof v === 'object') {
                for (var key in v) {
                    result[key] = v[key];
                }
            } else {
                result = v;
            }

            if (options.writeModel
                && v !== null
                && typeof v === 'object'
                && !Array.isArray(v)
                && !(Object.getPrototypeOf(v) === Object)
                ) {
                // Add model name
                result['__xp_model__'] = xp.getClassName(v);
            }

            if (options.replacer) {
                result = options.replacer(k, v);
            }
            return result;

        }, options.whiteSpace);
    }

    /**
     * Deserializes JSON string and restores models.
     * @param json JSON string.
     * @param models Array of models' constructors. Each constructor must be parameterless.
     * @param reviver A function which prescribes how the value is transformed. Is called before model restore.
     */
    export function deserialize(json: string, models?: { new (): Object }[], reviver?: (k: string, v: any) => any): any {
        // Create "name"-"constructor" doctionary.
        var modelsDictionary: { [model: string]: new () => Object } = {};
        models && models.forEach((m) => {
            var name = m.toString().match(/^function\s*(.*?)\s*\(/)[1];
            if (name in modelsDictionary) {
                throw new Error('Duplicate model name: "' + name + '".');
            }
            modelsDictionary[name] = m;
        });

        return JSON.parse(json, function(k, v) {
            if (reviver) {
                v = reviver(k, v);
            }
            if (typeof v === 'object' && v !== null && '__xp_model__' in v) {

                if (v['__xp_model__'] === 'ObservableObject'/* || v['__xp_model__'] === 'ObservableCollection'*/) {

                    // Create observable
                    delete v['__xp_model__'];
                    return observable(v, false);
                }

                //
                // Restore model

                var ctor = modelsDictionary[v['__xp_model__']];
                if (!ctor) {
                    throw new Error('No costructor specified for model "' + v['__xp_model__'] + '".');
                }
                var model = new ctor();
                for (var prop in v) {
                    if (prop !== '__xp_model__') {
                        if (prop in model
                            && model[prop] instanceof ObservableCollection
                            && !(v[prop] instanceof ObservableCollection)
                            ) {
                            if (!Array.isArray(v[prop])) {
                                throw new Error(`Property ${prop} supposed to be an array.`);
                            }
                            for (var i = 0; i < v[prop].length; i++) {
                                model[prop].push(v[prop][i]);
                            }
                        } else {
                            model[prop] = v[prop];
                        }
                    }
                }
                return model;
            }
            return v;
        });
    }
}