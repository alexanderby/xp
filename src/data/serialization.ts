module xp {
    /**
     * Serializes item to JSON.
     * @param item Item to serialize.
     * @param writeModel Specifies whether to write models prototypes names (adds __xp_model__ property). Default is true.
     * @param replacer A function that transforms the result.
     * @param whiteSpace Specifies whether to add white space into output. Default is " ".
     */
    export function serialize(item: any, writeModel = true, replacer?: (k: string, v: any) => any, whiteSpace = ' '): string {
        return JSON.stringify(item, function (k, v) {

            if (writeModel
                && typeof v === 'object'
                && !Array.isArray(v)
                && !(Object.getPrototypeOf(v) === Object)
                ) {
                // Add model name
                v['__xp_model__'] = xp.getClassName(v);
            }

            if (replacer) {
                v = replacer(k, v);
            }
            return v;

        }, whiteSpace);
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

        return JSON.parse(json, function (k, v) {
            if (reviver) {
                v = reviver(k, v);
            }
            if (typeof v === 'object' && '__xp_model__' in v) {

                if (v['__xp_model__'] === 'ObservableObject' || v['__xp_model__'] === 'ObservableCollection') {

                    // Create observable
                    delete v['__xp_model__'];
                    return observable(v);
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
                        model[prop] = v[prop];
                    }
                }
                return model;
            }
            return v;
        });
    }
}