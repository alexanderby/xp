interface Array<T> {
    /**
     * Moves an item within an array.
     * @param from Item's current index.
     * @param to Target index.
     */
    move(from: number, to: number): Array<T>;
}
Array.prototype.move = function (from, to) {
    if (from < 0) {
        from = this.length - from;
    }
    if (to < 0) {
        to = this.length - to;
    }
    if (from > this.length - 1 || from < 0 || to < 0) {
        throw new Error('Index was out of range.');
    }

    var picked = this.splice(from, 1)[0];
    //this.splice(from < to ? to - 1 : to, 0, picked);
    this.splice(to, 0, picked); // As in .NET 
    return this;
};

module xp.Binding {

    // TODO: Support move.
    // Currently this seems not possible with Array interface.

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
        Move
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
     * Determines whether object implements ICollectionNotifier.
     * @param obj Object.
     */
    export function isCollectionNotifier(obj) {
        return obj && typeof obj === 'object' && 'onCollectionChanged' in obj;
    }


    /**
     * A collection which notifies of it's changes.
     */
    export class ObservableCollection<T> extends ObservableObject implements Array<T>, ICollectionNotifier, INotifier {
        protected __inner__: Array<T>;

        /**
         * Creates a collection which notifies of it's changes.
         * WARNING: The source's items-objects will be mutated replaced with observables.
         * @param [collection] Source collection.
         */
        constructor(collection?: Array<T>) {
            super(collection);
        }

        protected init(collection?: Array<T>) {
            if (collection && !Array.isArray(collection)) {
                throw new Error('Source must be an array.');
            }

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
            Object.defineProperty(this, '__inner__', {
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
            this.__inner__.splice(index, 0, item);
            this.appendIndexProperty();

            // Notify
            this.onCollectionChanged.invoke({
                action: CollectionChangeAction.Create,
                newIndex: index,
                newItem: item
            });
            this.onPropertyChanged.invoke('length');
            for (var i = index; i < this.__inner__.length; i++) {
                this.onPropertyChanged.invoke(i.toString());
            }
        }

        /**
         * Handles item's removal item from collection. 
         */
        protected remove(index): T {
            var item = this.__inner__.splice(index, 1)[0];
            this.deleteIndexProperty();

            // Notify
            this.onCollectionChanged.invoke({
                action: CollectionChangeAction.Delete,
                oldIndex: index,
                oldItem: item
            });
            this.onPropertyChanged.invoke('length');
            for (var i = index; i < this.__inner__.length + 1; i++) {
                this.onPropertyChanged.invoke(i.toString());
            }

            return item;
        }

        // Must be called after inner collection change.
        protected appendIndexProperty() {
            var index = this.__inner__.length - 1;
            Object.defineProperty(this, index.toString(), {
                get: () => this.__inner__[index],
                set: (value: T) => {
                    if (!isNotifier(value)) {
                        value = observable(value);
                    }

                    // Notify
                    this.onCollectionChanged.invoke({
                        action: CollectionChangeAction.Replace,
                        oldIndex: index,
                        newIndex: index,
                        oldItem: this.__inner__[index],
                        newItem: this.__inner__[index] = value
                    });
                    this.onPropertyChanged.invoke(index.toString());
                },
                enumerable: true,
                configurable: true
            });
        }

        // Must be called after inner collection change.
        protected deleteIndexProperty() {
            delete this[this.__inner__.length];
        }

        protected createNotifier(item): INotifier {
            if (Array.isArray(item)) {
                item = new ObservableCollection(<Array<any>><any>item);
            }
            else if (typeof item === 'object' && !isNotifier(item)) {
                item = new ObservableObject(item);
            }
            return item;
        }


        //-----------
        // Properties
        //-----------

        get length(): number {
            return this.__inner__.length;
        }


        //----------------
        // Mutator methods
        //----------------

        move(from: number, to: number): T[] {
            this.__inner__.move(from, to);
            // Notify
            this.onCollectionChanged.invoke({
                action: CollectionChangeAction.Move,
                oldIndex: from,
                newIndex: to,
                oldItem: this.__inner__[to],
                newItem: this.__inner__[to]
            });
            return this.__inner__;
        }

        pop(): T {
            var item = this.remove(this.__inner__.length - 1);
            return item;
        }

        push(...items: T[]): number {
            items.forEach((item) => {
                this.add(item, this.__inner__.length);
            });
            return this.__inner__.length;
        }

        reverse(): T[]{
            var length = this.__inner__.length;
            for (var i = 0; i < length - 1; i++) {
                this.move(0, length - 1 - i);
            }

            return this.__inner__;
        }

        shift(): T {
            var item = this.remove(0);
            return item;
        }

        sort(compareFn?: (a: T, b: T) => number): T[] {
            var unsorted = this.__inner__.slice();
            var sorted = unsorted.sort(compareFn);

            var indicies = unsorted.map((v, i) => {
                return {
                    old: i,
                    new: sorted.indexOf(v)
                };
            });
            indicies.sort((a, b) => b.new - a.new);
            for (var i = 0; i < indicies.length; i++) {
                for (var j = i + 1; j < indicies.length; j++) {
                    if (indicies[i].old > indicies[j].old) {
                        indicies[j].old--;
                    }
                }
            }
            indicies.forEach((i) => this.move(i.old, i.new));

            return this.__inner__;
        }

        splice(start: number): T[];
        splice(start: number, deleteCount: number, ...items: T[]);
        splice(start: number, deleteCount?: number, ...items: T[]): T[] {
            // TODO: Move.

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
            return this.__inner__.length;
        }


        //-----------------
        // Accessor methods
        //-----------------

        // TODO: Return new ObservableCollection?

        concat<U extends T[]>(...items: U[]): T[];
        concat(...items: T[]): T[] { return this.__inner__.concat(items); }

        join(separator?: string): string { return this.__inner__.join(separator); }

        slice(start?: number, end?: number): T[] { return this.__inner__.slice(start, end); }

        /**
         * Method called by JSON.stringify()
         */
        toJSON() {
            return this.__inner__;
        }

        //toString(): string { return this.inner.toString(); }
        toString(): string { return Object.prototype.toString.call(this); }
        //toString(): string { return '[object Array]'; }

        toLocaleString(): string { return this.__inner__.toLocaleString(); }

        indexOf(searchElement: T, fromIndex?: number): number { return this.__inner__.indexOf(searchElement, fromIndex); }

        lastIndexOf(searchElement: T, fromIndex?: number): number { return this.__inner__.lastIndexOf(searchElement, fromIndex); }


        //------------------
        // Iteration methods
        //------------------

        forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void { return this.__inner__.forEach(callbackfn, thisArg); }

        every(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): boolean { return this.__inner__.every(callbackfn, thisArg); }

        some(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): boolean { return this.__inner__.some(callbackfn, thisArg); }

        filter(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): T[] { return this.__inner__.filter(callbackfn, thisArg); }

        map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[] { return this.__inner__.map(callbackfn, thisArg); }

        reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
        reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue?: T): T { return this.__inner__.reduce(callbackfn, initialValue); }

        reduceRight<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
        reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue?: T): T { return this.__inner__.reduceRight(callbackfn, initialValue); }


        [n: number]: T;
    }
} 