﻿module xp.Binding {

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
        //set, // TODO: 'set' vs 'onPropertyChanged'.
        reset
    }

    export interface CollectionChangeArgs {
        change: CollectionChangeAction;
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
            if (collection) {
                // Copy collection
                this.inner = [];
                collection.forEach((item) => {
                    if (typeof item === 'object') {
                        item = <T><any>createNotifierFrom(item);
                    }
                    this.inner.push(item);
                    this.appendIndexProperty();
                });
            }
            else {
                this.inner = [];
            }

            // Create properties
            for (var i = 0; i < this.inner.length; i++) {
                this.appendIndexProperty();
            }

            this.onPropertyChanged = new Event<string>();
            this.onCollectionChanged = new Event<CollectionChangeArgs>();
        }

        //-------
        // Events
        //-------

        onPropertyChanged: Event<string>;
        onCollectionChanged: Event<CollectionChangeArgs>;


        //-----------
        // Properties
        //-----------

        get length(): number {
            return this.inner.length;
        }

        protected appendIndexProperty() {
            var index = this.inner.length - 1;
            Object.defineProperty(this, index.toString(), {
                get: () => this.inner[index],
                set: (value: T) => {
                    this.inner[index] = value;

                    // Notify
                    this.onPropertyChanged.invoke(index.toString());
                },
                enumerable: true,
                configurable: true
            });
        }

        protected deleteIndexProperty() {
            delete this[this.inner.length - 1];
        }


        //----------------
        // Mutator methods
        //----------------

        pop(): T {
            var item = this.inner.pop();
            this.deleteIndexProperty();

            // Notify
            this.onCollectionChanged.invoke({
                change: CollectionChangeAction.remove,
                oldIndex: this.inner.length,
                oldItem: item
            });
            this.onPropertyChanged.invoke('length');

            return item;
        }

        push(...items: T[]): number {
            items.forEach((item) => {
                var index = this.inner.push(item) - 1;
                this.appendIndexProperty();

                // Notify
                this.onCollectionChanged.invoke({
                    change: CollectionChangeAction.add,
                    newIndex: this.inner.length,
                    newItem: item
                });
                this.onPropertyChanged.invoke('length');
            });

            return this.inner.length;
        }

        reverse(): T[] { throw new Error('Not implemented.'); }

        shift(): T {
            var item = this.inner.shift();
            this.deleteIndexProperty();

            // Notify
            this.onCollectionChanged.invoke({
                change: CollectionChangeAction.remove,
                oldIndex: 0,
                oldItem: item
            });
            this.onPropertyChanged.invoke('length');

            return item;
        }

        sort(compareFn?: (a: T, b: T) => number): T[] {
            this.inner.sort(compareFn);

            // Notify
            this.onCollectionChanged.invoke({
                change: CollectionChangeAction.reset
            });

            return this.inner;
        }

        splice(start: number): T[];
        splice(start: number, deleteCount: number, ...items: T[]);
        splice(start: number, deleteCount?: number, ...items: T[]): T[] {
            //
            // Delete

            var deleted = new Array<T>();
            for (var i = 0; i < deleteCount; i++) {
                var item = this.inner.splice(start, 1)[0];
                deleted.push(item);
                this.deleteIndexProperty();

                // Notify
                this.onCollectionChanged.invoke({
                    change: CollectionChangeAction.remove,
                    oldIndex: start,
                    oldItem: item
                });
                this.onPropertyChanged.invoke('length');
            }

            //
            // Add

            var index = start;
            items.forEach((item) => {
                this.appendIndexProperty();

                // Notify
                this.onCollectionChanged.invoke({
                    change: CollectionChangeAction.add,
                    newIndex: index,
                    newItem: item
                });
                this.onPropertyChanged.invoke('length');

                index++;
            })

            return deleted;
        }

        unshift(...items: T[]): number {
            var index = 0;
            items.forEach((item) => {
                this.inner.splice(index, 0, item);
                this.appendIndexProperty();

                // Notify
                this.onCollectionChanged.invoke({
                    change: CollectionChangeAction.add,
                    newIndex: index,
                    newItem: item
                });
                this.onPropertyChanged.invoke('length');

                index++
            });

            return this.inner.length;
        }


        //-----------------
        // Accessor methods
        //-----------------

        concat<U extends T[]>(...items: U[]): T[];
        concat(...items: T[]): T[] { return this.inner.concat(items); }

        join(separator?: string): string { return this.inner.join(separator); }

        slice(start?: number, end?: number): T[] { return this.inner.slice(start, end); }

        toString(): string { return this.inner.toString(); }

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