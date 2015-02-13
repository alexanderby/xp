module xp.Binding {

    /**
     * Defines a collection, which notifies of it's changes.
     */
    export interface ICollectionNotifier {
        /**
         * Is invoked when collection is changed.
         */
        onCollectionChanged: Event<CollectionChangeArgs>;
    }

    export enum CollectionChangeAction {
        Create,
        Replace,
        //Update?
        Delete,
        Reset,
        //move,
        //sort
    }

    export interface CollectionChangeArgs {
        action: CollectionChangeAction;
        //index?: number;
        newIndex?: number;
        oldIndex?: number;
        newItem?: any;
        oldItem?: any;
    }

    /**
     * A collection which notifies of it's changes.
     */
    export class ObservableCollection<T> implements Array<T>, ICollectionNotifier, INotifier {
        private inner: Array<T>;

        /**
         * Creates a collection which notifies of it's changes.
         * @param [collection] Source collection.
         */
        constructor(collection?: Array<T>) {
            //this.onPropertyChanged = new Event<string>();
            //this.onCollectionChanged = new Event<CollectionChangeArgs>();
            Object.defineProperty(this, 'onPropertyChanged', {
                configurable: true,
                enumerable: false,
                value: new Event<string>()
            });
            Object.defineProperty(this, 'onCollectionChanged', {
                configurable: true,
                enumerable: false,
                value: new Event<CollectionChangeArgs>()
            });
            Object.defineProperty(this, 'inner', {
                configurable: true,
                enumerable: false,
                value: []
            });

            //this.inner = [];
            if (collection) {
                // Copy collection
                collection.forEach((item, i) => {
                    this.add(item, i);
                });
            }
        }

        //-------
        // Events
        //-------

        onPropertyChanged: Event<string>;
        onCollectionChanged: Event<CollectionChangeArgs>;


        //--------------------
        // Handling operations
        //--------------------

        /**
         * Handles item's addition into collection.
         */
        protected add(item, index) {
            item = this.createNotifier(item);
            this.inner.splice(index, 0, item);
            this.appendIndexProperty();

            // Notify
            this.onCollectionChanged.invoke({
                action: CollectionChangeAction.Create,
                newIndex: index,
                newItem: item
            });
            this.onPropertyChanged.invoke('length');
            for (var i = index; i < this.inner.length; i++) {
                this.onPropertyChanged.invoke(i.toString());
            }
        }

        /**
         * Handles item's removal item from collection. 
         */
        protected remove(index): T {
            var item = this.inner.splice(index, 1)[0];
            this.deleteIndexProperty();

            // Notify
            this.onCollectionChanged.invoke({
                action: CollectionChangeAction.Delete,
                oldIndex: index,
                oldItem: item
            });
            this.onPropertyChanged.invoke('length');
            for (var i = index; i < this.inner.length + 1; i++) {
                this.onPropertyChanged.invoke(i.toString());
            }

            return item;
        }

        // Must be called after inner collection change.
        protected appendIndexProperty() {
            var index = this.inner.length - 1;
            Object.defineProperty(this, index.toString(), {
                get: () => this.inner[index],
                set: (value: T) => {
                    this.inner[index] = value;

                    // Notify
                    this.onCollectionChanged.invoke({
                        action: CollectionChangeAction.Replace,
                        oldIndex: index,
                        newIndex: index,
                        oldItem: this.inner[index],
                        newItem: this.inner[index] = value
                    });
                    this.onPropertyChanged.invoke(index.toString());
                },
                enumerable: true,
                configurable: true
            });
        }

        // Must be called after inner collection change.
        protected deleteIndexProperty() {
            delete this[this.inner.length];
        }

        protected createNotifier(item): INotifier {
            if (Array.isArray(item)) {
                item = new ObservableCollection(<Array<any>><any>item);
            }
            else if (typeof item === 'object' && !isNotifier(item)) {
                item = createNotifierFrom(item);
            }
            return item;
        }


        //-----------
        // Properties
        //-----------

        get length(): number {
            return this.inner.length;
        }


        //----------------
        // Mutator methods
        //----------------

        pop(): T {
            var item = this.remove(this.inner.length - 1);
            return item;
        }

        push(...items: T[]): number {
            items.forEach((item) => {
                this.add(item, this.inner.length);
            });
            return this.inner.length;
        }

        reverse(): T[] {
            this.inner.reverse();
            // Notify
            this.onCollectionChanged.invoke({
                action: CollectionChangeAction.Reset // TODO: move?
            });
            return this.inner;
        }

        shift(): T {
            var item = this.remove(0);
            return item;
        }

        sort(compareFn?: (a: T, b: T) => number): T[] {
            this.inner.sort(compareFn);
            // Notify
            this.onCollectionChanged.invoke({
                action: CollectionChangeAction.Reset // TODO: move?
            });
            return this.inner;
        }

        splice(start: number): T[];
        splice(start: number, deleteCount: number, ...items: T[]);
        splice(start: number, deleteCount?: number, ...items: T[]): T[] {
            // Delete
            var deleted = new Array<T>();
            for (var i = 0; i < deleteCount; i++) {
                var item = this.remove(start);
                deleted.push(item);
            }
            // Add
            var index = start;
            items.forEach((item) => {
                this.add(item, index);
                index++;
            })
            return deleted;
        }

        unshift(...items: T[]): number {
            for (var i = 0; i < items.length; i++) {
                this.add(items[i], i);
            }
            return this.inner.length;
        }


        //-----------------
        // Accessor methods
        //-----------------

        // TODO: Return new ObservableCollection?

        concat<U extends T[]>(...items: U[]): T[];
        concat(...items: T[]): T[] { return this.inner.concat(items); }

        join(separator?: string): string { return this.inner.join(separator); }

        slice(start?: number, end?: number): T[] { return this.inner.slice(start, end); }

        /**
         * Method called by JSON.stringify()
         */
        toJSON() {
            return this.inner;
        }

        //toString(): string { return this.inner.toString(); }
        toString(): string { return Object.prototype.toString.call(this); }
        //toString(): string { return '[object Array]'; }

        toLocaleString(): string { return this.inner.toLocaleString(); }

        indexOf(searchElement: T, fromIndex?: number): number { return this.inner.indexOf(searchElement, fromIndex); }

        lastIndexOf(searchElement: T, fromIndex?: number): number { return this.inner.lastIndexOf(searchElement, fromIndex); }


        //------------------
        // Iteration methods
        //------------------

        forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void { return this.inner.forEach(callbackfn, thisArg); }

        every(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): boolean { return this.inner.every(callbackfn, thisArg); }

        some(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): boolean { return this.inner.some(callbackfn, thisArg); }

        filter(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): T[] { return this.inner.filter(callbackfn, thisArg); }

        map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[] { return this.inner.map(callbackfn, thisArg); }

        reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
        reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue?: T): T { return this.inner.reduce(callbackfn, initialValue); }

        reduceRight<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
        reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue?: T): T { return this.inner.reduceRight(callbackfn, initialValue); }


        [n: number]: T;
    }

    /**
     * Determines whether object implements ICollectionNotifier.
     * @param obj Object.
     */
    export function isCollectionNotifier(obj) {
        return obj && typeof obj === 'object' && 'onCollectionChanged' in obj;
    }
} 