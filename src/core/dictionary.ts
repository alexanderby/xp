module xp {

    /**
     * Key/value dictionary.
     */
    export class Dictionary<TKey, TValue> {
        /**
         * Key/value pairs.
         */
        pairs: KeyValuePair<TKey, TValue>[];

        /**
         * Creates a dictionary.
         */
        constructor(items?: KeyValuePair<TKey, TValue>[]) {
            this.pairs = items || [];
        }

        /**
         * Gets a value.
         * @param key Key.
         */
        get(key: TKey) {
            var found = this.pairs.filter(p=> p.key === key);
            return found.length > 0 ? found[0].value : void 0;
        }

        /**
         * Sets a value.
         * @param key Key.
         * @param value Value.
         */
        set(key: TKey, value: TValue) {
            var found = this.pairs.filter(t=> t.key === key);

            if (found.length > 0) {
                if (value === void 0) {
                    // Remove pair
                    this.pairs.splice(this.pairs.indexOf(found[0]), 1);
                }
                else {
                    // Reset value
                    found[0].value = value;
                }
            }
            else {
                // Add pair
                this.pairs.push({
                    key: key,
                    value: value
                });
            }
        }

        /**
         * Removes a value.
         */
        remove(key: TKey) {
            var found = this.pairs.filter(t=> t.key === key);
            if (found.length > 0) {
                this.pairs.splice(this.pairs.indexOf(found[0]), 1);
            }
        }
    }

    /**
     * Key/value pair.
     */
    export interface KeyValuePair<TKey, TValue> {
        key: TKey;
        value: TValue;
    }
} 