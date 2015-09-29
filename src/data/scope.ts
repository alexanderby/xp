module xp {

    /**
     * Data scope. Supports multiple levels and notifies of their changes.
     */
    export class Scope implements Notifier {
        onPropertyChanged: Event<string>;
        private __registrar__: EventRegistrar;
        
        /**
         * Creates a scope.
         * @param source Source object. Should be observable.
         * @param parent Parent scope. Should be observable.
         */
        constructor(source: Object, parent: Object) {
            Object.defineProperty(this, 'onPropertyChanged', {
                value: new Event()
            });
            Object.defineProperty(this, '__registrar__', {
                value: new EventRegistrar()
            });

            //
            // Create property for each source property

            var ownProps: string[] = [];
            var settingProp = false;
            var createOwnProperty = (prop: string) => {
                Object.defineProperty(this, prop, {
                    enumerable: true,
                    configurable: true,
                    get: () => {
                        return source[prop];
                    },
                    set: (value) => {
                        settingProp = true;
                        source[prop] = value;
                        settingProp = false;
                        this.onPropertyChanged.invoke(prop);
                    }
                });
                ownProps.push(prop);
            };
            for (var prop in source) {
                createOwnProperty(prop);
            }

            // Subscribe for changes
            if (isNotifier(source)) {
                this.__registrar__.subscribe((<Notifier>source).onPropertyChanged, (prop) => {
                    if (!settingProp) {
                        if (ownProps.indexOf(prop) < 0) {
                            createOwnProperty(prop);
                        }
                        this.onPropertyChanged.invoke(prop);
                    }
                }, this);
            }

            if (parent) {
                //
                // Create property for each missing parent property

                var parentProps: string[] = [];
                var createParentProperty = (prop: string) => {
                    Object.defineProperty(this, prop, {
                        enumerable: true,
                        configurable: true,
                        get: () => {
                            return parent[prop];
                        },
                        set: (value) => {
                            settingProp = true;
                            parent[prop] = value;
                            settingProp = false;
                            this.onPropertyChanged.invoke(prop);
                        }
                    });
                    parentProps.push(prop);
                };
                for (var prop in parent) {
                    if (ownProps.indexOf(prop) < 0) {
                        createParentProperty(prop);
                    }
                }

                // Subscribe for changes
                if (isNotifier(parent)) {
                    this.__registrar__.subscribe((<Notifier>parent).onPropertyChanged, (prop) => {
                        if (!settingProp && ownProps.indexOf(prop) < 0) {
                            if (parentProps.indexOf(prop) < 0) {
                                createParentProperty(prop);
                            }
                            this.onPropertyChanged.invoke(prop);
                        }
                    }, this);
                }
            }
        }

        // TODO: Automate scope unsubscription or don't care.

        /**
         * Must be called when the scope object is not used anymore.
         * Otherwise source object changes would be reflected.
         */
        @enumerable(false)
        unsubscribeScopeFromChanges() {
            this.__registrar__.unsubscribeAll();
        }
    }
}