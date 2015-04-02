module xp {
    /**
     * Calls a setter function when a single property
     * change occurs. Nested source properties are
     * not supposed to be always reachable.
     */
    export class BindingCallManager extends BindingManager {
        private setterFn: (value) => void;

        /**
         * Creates the binding call manager.
         * @param scope Scope object.
         * @param path Path to bind to.
         * @param setterFn Setter function.
         * @param [getterFn] Getter function.
         * @param [defaultValue] Value to use is case when source property is unreachable.
         */
        constructor(scope: Object, path: string, setterFn: (value) => void, getterFn?: () => any, defaultValue?: any) {
            super((function () {
                // Create an object with getter and setter.
                var target = {};
                Object.defineProperty(target, 'result', {
                    set: function (result) {
                        setterFn(result);
                    },
                    get: function () {
                        if (getterFn) {
                            return getterFn();
                        }
                        return void 0;
                    }
                });
                return target;
            })(), 'result', scope, path, defaultValue);
        }
    }
}