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
        add,
        remove,
        //move,
        set, // TODO: 'set' vs 'onPropertyChanged'.
        reset
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
            this.onPropertyChanged = new Event<string>();
            this.onCollectionChanged = new Event<CollectionChangeArgs>();

            this.inner = [];
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
         * Handles addition item into collection.
         */
        protected add(item: T, index) {
            item = this.createNotifier(item);
            this.inner.splice(index, 0, item);
            this.appendIndexProperty();

            // Notify
            this.onCollectionChanged.invoke({
                action: CollectionChangeAction.add,
                newIndex: index,
                newItem: item
            });
            this.onPropertyChanged.invoke('length');
        }

        /**
         * Handles removal of item from collection. 
         */
        protected remove(index): T {
            var item = this.inner.splice(index, 1)[0];
            this.deleteIndexProperty();

            // Notify
            this.onCollectionChanged.invoke({
                action: CollectionChangeAction.remove,
                oldIndex: index,
                oldItem: item
            });
            this.onPropertyChanged.invoke('length');

            return item;
        }

        // Must be called after inner collection change.
        protected appendIndexProperty() {
            var index = this.inner.length - 1;
            Object.defineProperty(this, index.toString(), {
                get: () => this.inner[index],
                set: (value: T) => {
                    //this.inner[index] = value;

                    // Notify
                    this.onCollectionChanged.invoke({
                        action: CollectionChangeAction.set,
                        oldIndex: index,
                        newIndex: index,
                        oldItem: this.inner[index],
                        newItem: this.inner[index] = value
                    });
                    //this.onPropertyChanged.invoke(index.toString());
                },
                enumerable: true,
                configurable: true
            });
        }

        // Must be called after inner collection change.
        protected deleteIndexProperty() {
            delete this[this.inner.length];
        }

        protected createNotifier(item: T): T {
            if (typeof item === 'object' && !isNotifier(item)) {
                item = <T><any>createNotifierFrom(item);
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
                action: CollectionChangeAction.reset
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
                action: CollectionChangeAction.reset
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

        //toString(): string { return this.inner.toString(); }
        toString(): string { return Object.prototype.toString.call(this); }

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
} 