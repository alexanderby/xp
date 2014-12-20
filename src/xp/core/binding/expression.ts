module xp.Binding {
    /**
     * UI control's property bindable expression.
     */
    export class Expression implements INotifier {
        /**
         * Is invoked when expression result changes.
         */
        onPropertyChanged: Event<string>;
        private source;
        private func: Function;
        private propsPaths: string[];
        private managers: BindingManager[];
        private params: INotifier;

        /**
         * Creates control's property bindable expression.
         * @param expression Expression e.g. "{obj.a} * 2 + Math.round({b})".
         */
        constructor(expression: string) {
            this.onPropertyChanged = new Event<string>();

            // Find paths
            var regex = /\{(.+?)\}/g;
            var matches = expression.match(regex);
            var propsPaths: string[] = [];
            if (matches) {
                for (var i = 0; i < matches.length; i++) {
                    var path = matches[i].replace('{', '').replace('}', '');
                    if (propsPaths.indexOf(path) < 0) {
                        propsPaths.push(path);
                    }
                }
            }
            this.propsPaths = propsPaths;

            // Create function
            var body = expression;
            var params: string[] = [];
            this.params = { onPropertyChanged: new Event<string>() };
            propsPaths.forEach((p, i) => {
                var param = 'p' + i;
                body = body.replace('{' + p + '}', param);
                params.push(param);
                // Add param property
                var fieldName = '_' + param;
                this.params[fieldName] = null;
                Object.defineProperty(this.params, param, {
                    get: () => this.params[fieldName],
                    set: (value) => {
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
                var manager = new BindingManager(this.params, params[i], this.source, path);
                this.managers.push(manager);
            });
        }

        /**
         * Gets expression evaluation result.
         */
        get result() {
            return this.resultField;
        }
        private resultField;
        private exec() {
            var params = [];
            for (var key in this.params) {
                if (key[0] === 'p') { // HACK.
                    params.push(this.params[key]);
                }
            }
            this.resultField = this.func.apply(this, params);
            this.onPropertyChanged.invoke('result') || null;
        }
        private sourceSetToken = false;

        /**
         * Resets source and causes expression evaluation.
         * @param source Source.
         */
        resetWith(source) {
            this.sourceSetToken = true;
            this.source = source;
            this.managers.forEach((m) => {
                m.resetWith(source);
            });
            this.sourceSetToken = false;
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
} 