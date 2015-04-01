module xp {
    /**
     * UI control's property bindable expression.
     */
    export class Expression implements INotifier {
        /**
         * Is invoked when expression result changes.
         */
        onPropertyChanged: Event<string>;
        private scope: Object;
        private func: Function;
        private propsPaths: string[];
        private managers: BindingManager[];
        private params: INotifier;
        // Holds change handlers for collection parameters.
        private collectionRegistrations: { [paramName: string]: EventRegistrar };

        /**
         * Creates control's property bindable expression.
         * @param expression Expression e.g. "{obj.a} * 2 + Math.round({b})".
         */
        constructor(expression: string) {
            Object.defineProperty(this, 'onPropertyChanged', {
                value: new Event()
            });

            // Find paths
            var regex = /\{([^\s\(\)]+?)\}/g;
            var matches = expression.match(regex);
            var propsPaths: string[] = [];
            if (matches) {
                for (var i = 0; i < matches.length; i++) {
                    var path = matches[i].replace('{', '').replace('}', '');
                    if (path === '')
                        throw new Error('Empty path binding for expression is not supported. Expression: "' + expression + '"');
                    if (propsPaths.indexOf(path) < 0) {
                        propsPaths.push(path);
                    }
                }
            }
            this.propsPaths = propsPaths;

            // TODO: eval() ?

            // Create function
            var body = expression;
            var params: string[] = [];
            this.params = { onPropertyChanged: new Event<string>() };
            this.collectionRegistrations = {};
            propsPaths.forEach((p, i) => {
                var param = 'p' + i;
                //body = body.replace('{' + p + '}', param); // Doesn't replace all. Regexp?
                body = body.split('{' + p + '}').join(param);
                params.push(param);
                // Add param property
                var fieldName = '_' + param;
                this.params[fieldName] = null;
                Object.defineProperty(this.params, param, {
                    get: () => this.params[fieldName],
                    set: (value) => {
                        if (this.collectionRegistrations[param]) {
                            // Unsubscribe from collection changes
                            this.collectionRegistrations[param].unsubscribeAll();
                            delete this.collectionRegistrations[param];
                        }

                        if (value !== void 0 && isCollectionNotifier(value)) {
                            // Subscribe for collection changes
                            var registar = new EventRegistrar();
                            var cn = <ICollectionNotifier>value;
                            registar.subscribe(cn.onCollectionChanged,(args) => {
                                this.exec();
                            }, this);
                            this.collectionRegistrations[param] = registar
                        }

                        this.params[fieldName] = value;
                        // Execute function
                        if (!this.sourceSetToken) {
                            this.exec();
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
            });
            this.func = new Function(params.join(', '), 'return ' + body + ';');

            // Create managers
            this.managers = [];
            this.propsPaths.forEach((path, i) => {
                var manager = new BindingManager(this.params, params[i], this.scope, path);
                this.managers.push(manager);
            });

            // Execute
            this.exec();
        }

        /**
         * Gets expression evaluation result.
         */
        get result() {
            return this.resultField;
        }

        private resultField;

        /**
         * Executes the expression.
         */
        exec() {
            // Get parameters
            var params = [];
            for (var key in this.params) {
                // TODO: Use "Object.defineProperty" with "enumerable:false"
                // for properties, which should not be listed.
                if (key[0] === 'p') {
                    var p = this.params[key];
                    if (p instanceof ObservableCollection) {
                        p = (<ObservableCollection<any>>p).slice();
                    }
                    params.push(p);
                }
            }
            try {
                // Execute
                this.resultField = this.func.apply(this, params);
            }
            catch (e) {
                Log.write(Log.HeatLevel.Warn, Log.Domain.Binding, 'Expression error: ' + e);
                this.resultField = null;
            }
            this.onPropertyChanged.invoke('result');
        }

        private sourceSetToken = false; // Prevents multiple evaluations on all bindings reset.

        /**
         * Resets source and causes expression evaluation.
         * @param scope Source.
         */
        resetWith(scope: Object) {
            this.sourceSetToken = true;
            this.scope = scope;
            this.managers.forEach((m) => {
                m.resetWith(scope);
            });
            this.sourceSetToken = false;
            this.exec();
        }

        /**
         * Removes binding.
         * Must be called when target is being disposed or property path changes.
         */
        unbind() {
            this.managers.forEach((m) => m.unbind());
            this.onPropertyChanged.removeAllHandlers();
        }
    }
    hidePrototypeProperties(Expression);
} 