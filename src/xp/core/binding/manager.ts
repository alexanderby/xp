module xp.Binding {
    /**
     * Manages binding of source and target properties.
     * This manager is hold by target and exists until
     * target is disposed. Nested source properties are
     * not supposed to be always reachable.
     */
    export /*sealed*/ class BindingManager {
        private root;
        private sourcePropertyPath: string;
        private sourceProperty: string;
        private target/*: xp.Ui.Element*/;
        private targetProperty: string;
        private dafaultValue;
        private pathObjects: { obj: any; handler?: (name: string) => void; }[];
        private pathParts: string[];

        constructor(target/*: xp.Ui.Element*/, targetProperty: string, source, sourcePropertyPath: string, defaultValue?) {
            this.target = target;
            this.targetProperty = targetProperty;
            this.root = source;
            this.sourcePropertyPath = sourcePropertyPath;
            this.dafaultValue = defaultValue;
            this.pathParts = sourcePropertyPath.replace(/\[(.+)\]/g, '.$1').split('.');
            this.pathParts.forEach((part) => {
                if (part === '')
                    throw new Error(
                        xp.formatString('Binding for empty path is not supported. Path "{0}".', sourcePropertyPath));
            });
            this.sourceProperty = this.pathParts[this.pathParts.length - 1];

            // Subscribe for all path changes
            this.registerPathObjects();
            this.updateTarget();
        }

        /**
         * Resets binding with new binding source (with the same hierarchy).
         */
        resetWith(source) {
            console.log(xp.formatString('BM of "{0}.{1}": Reset with "{2}".', this.target['name'], this.targetProperty, source));
            this.root = source;
            this.registerPathObjects();
            this.updateTarget();
        }

        /**
         * Updates source property.
         */
        updateSource() {
            var source = this.getSource();
            if (source) {
                var value = this.target[this.targetProperty];
                console.log(xp.formatString('BM of "{0}.{1}": Update source "{2}.{3}" property with value "{4}".', this.target['name'], this.targetProperty, source, this.sourceProperty, value));
                if (this.sourceProperty === '')
                    source = value; // TODO: setPropertyByPath
                else
                    source[this.sourceProperty] = value;
            }
            else {
                console.warn(xp.formatString('BM of "{0}.{1}": Can\'t update source. Source "{2}" not found.', this.target['name'], this.targetProperty, source));
            }
        }

        /**
         * Updates target property.
         */
        updateTarget() {
            var source = this.getSource();
            if (source) {
                var value = xp.Path.getPropertyByPath(source, this.sourceProperty, false);
                console.log(xp.formatString('BM of "{0}.{1}": Update target with "{2}.{3}" property value "{4}".', this.target['name'], this.targetProperty, source, this.sourceProperty, value));
                this.target[this.targetProperty] = value !== void 0 ? value : this.dafaultValue;
            }
            else {
                this.target[this.targetProperty] = this.dafaultValue;
                console.warn(xp.formatString('BM of "{0}.{1}": Can\'t update target. Source "{2}" not found.', this.target['name'], this.targetProperty, source));
            }
        }

        /**
         * Removes binding.
         * Must be called when target is being disposed or property path changes.
         */
        unbind() {
            console.log(xp.formatString('BM of "{0}.{1}": Unbind.', this.target['name'], this.targetProperty));
            if (this.pathObjects) {
                var po = this.pathObjects;
                for (var i = 0; i < po.length - 1; i++) {
                    if (isNotifier(po[i].obj)) {
                        (<INotifier>po[i].obj).onPropertyChanged.removeHandler(po[i + 1].handler);
                    }
                }
            }
        }

        /**
         * Registers path objects' change handlers.
         * @param [startIndex=0] Path index to start re-initialization from.
         */
        private registerPathObjects(startIndex = 0) {
            //
            // Remove previous path objects' handlers

            if (this.pathObjects) {
                var po = this.pathObjects;
                for (var i = startIndex; i < po.length - 1; i++) {
                    if (isNotifier(po[i].obj)) {
                        (<INotifier>po[i].obj).onPropertyChanged.removeHandler(po[i + 1].handler);
                        console.log(xp.formatString('BM of "{0}.{1}": Removed handler of "{2}.{3}" property change. Property value is "{4}".', this.target['name'], this.targetProperty, po[i].obj, this.pathParts[i], po[i].obj[this.pathParts[i]]));
                    }
                }
            }

            //
            // Get all objects by path

            // TODO: Collections...
            var parts = this.pathParts;
            if (startIndex === 0) {
                this.pathObjects = [{ obj: this.root }];
            }
            var po = this.pathObjects;
            for (var i = startIndex - 1; i < parts.length; i++) {
                if (i >= 0) {
                    if (!po[i].obj) {
                        break;
                    }
                    // Set path object
                    po[i + 1] = {
                        obj: xp.Path.getPropertyByPath(po[i].obj, parts[i], false) || null
                    };
                    if (isNotifier(po[i].obj)) {
                        // Handle path object replacement
                        var handler: (prop: string) => void;

                        if (i == parts.length - 1) {
                            // Only updates target.
                            handler = ((propName) => {
                                return (prop: string) => {
                                    if (prop === propName) {
                                        this.updateTarget();
                                    }
                                };
                            })(parts[i]);
                        }
                        else {
                            // Re-registers lower path objects, updates target.
                            handler = ((index, propName) => {
                                return (prop: string) => {
                                    if (prop === propName) {
                                        this.registerPathObjects(index);
                                        this.updateTarget();
                                    }
                                };
                            })(i + 1, parts[i]);
                        }

                        (<INotifier>po[i].obj).onPropertyChanged.addHandler(handler, this);
                        po[i + 1].handler = handler;
                        console.log(xp.formatString('BM of "{0}.{1}": Added handler of "{2}.{3}" property change. Property value is "{4}".', this.target['name'], this.targetProperty, po[i].obj, this.pathParts[i], po[i].obj[this.pathParts[i]]));
                    }
                }
            }
        }

        private getSource() {
            var srcPath = xp.Path.getObjectPath(this.sourcePropertyPath);
            var src = xp.Path.getPropertyByPath(this.root, srcPath, false);
            return src;
        }
    }
} 