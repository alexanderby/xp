//
// NOTE: Extend Array interface with move(), attach(),
// detach() methods to prevent bound DOM regeneration
// when moving items within or between collections or
// performing a sort.

interface Array<T> {
    /**
     * Moves an item within an array.
     * @param from Item's current index.
     * @param to Target index.
     */
    move(from: number, to: number): Array<T>;
    /**
     * Attaches an item to an array.
     * @param item Item.
     * @param index Target index.
     */
    attach(item: T, index: number): number;
    /**
     * Detaches an item from an array.
     * @param index Item's index.
     */
    detach(index: number): T;
}
Array.prototype.move = function (from, to) {
    if (from < 0) from = this.length + from;
    if (to < 0) to = this.length + to;
    if (from > this.length - 1 || to > this.length - 1 || from < 0 || to < 0) {
        throw new Error('Index was out of range.');
    }

    var picked = this.splice(from, 1)[0];
    this.splice(to, 0, picked);
    return this;
};
Array.prototype.attach = function (item, index) {
    this.splice(index, 0, item);
    return this.length;
};
Array.prototype.detach = function (index) {
    return this.splice(index, 1)[0];
};

module xp {

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
        Move,
        Attach,
        Detach
    }

    export interface CollectionChangeArgs {
        action: CollectionChangeAction;
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
        protected inner: Array<T>;

        /**
         * Creates a collection which notifies of it's changes.
         * @param [collection] Source collection.
         */
        constructor(collection?: Array<T>) {
            super(collection);
        }

        protected initProperties() {
            super.initProperties();

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
        }

        protected copySource(collection: Array<T>) {
            if (collection && (!Array.isArray(collection) || collection instanceof ObservableCollection)) {
                throw new Error('Source must be an array.');
            }

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

        private splicing = false; // Prevents multiple property change notifications while splicing

        /**
         * Handles item's addition into collection.
         */
        protected add(item, index, moving?: boolean) {
            item = this.createNotifierIfPossible(item);
            this.inner.splice(index, 0, item);
            this.appendIndexProperty();

            // Notify
            this.onCollectionChanged.invoke({
                action: moving ?
                    CollectionChangeAction.Attach
                    : CollectionChangeAction.Create,
                newIndex: index,
                newItem: item
            });
            this.onPropertyChanged.invoke('length');
            if (!this.splicing) {
                for (var i = index; i < this.inner.length; i++) {
                    this.onPropertyChanged.invoke(i.toString());
                }
            }
        }

        /**
         * Handles item's removal item from collection. 
         */
        protected remove(index, moving?: boolean): T {
            var item = this.inner.splice(index, 1)[0];
            this.deleteIndexProperty();

            // Notify
            this.onCollectionChanged.invoke({
                action: moving ?
                    CollectionChangeAction.Detach
                    : CollectionChangeAction.Delete,
                oldIndex: index,
                oldItem: item
            });
            this.onPropertyChanged.invoke('length');
            if (!this.splicing) {
                for (var i = index; i < this.inner.length + 1; i++) {
                    this.onPropertyChanged.invoke(i.toString());
                }
            }

            return item;
        }

        // Must be called after inner collection change.
        protected appendIndexProperty() {
            var index = this.inner.length - 1;
            Object.defineProperty(this, index.toString(), {
                get: () => this.inner[index],
                set: (value: T) => {
                    if (!isNotifier(value)) {
                        value = observable(value);
                    }

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

        protected createNotifierIfPossible(item): any {
            if (ObservableObject.isConvertable(item)) {
                item = observable(item);
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

        // Extension
        move(from: number, to: number): T[] {
            this.inner.move(from, to);

            // Notify
            this.onCollectionChanged.invoke({
                action: CollectionChangeAction.Move,
                oldIndex: from,
                newIndex: to,
                oldItem: this.inner[to],
                newItem: this.inner[to]
            });
            if (!this.sorting) {
                for (var i = Math.min(from, to); i <= Math.max(from, to); i++) {
                    this.onPropertyChanged.invoke(i.toString());
                }
            }

            return this.inner;
        }

        // Extension
        attach(item: T, index: number): number {
            var length = this.inner.attach(item, index);
            this.add(item, index, true);
            return length;
        }

        // Extension
        detach(index: number) {
            var item = this.remove(index, true);
            return item;
        }

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
            this.sorting = true;
            var length = this.inner.length;
            for (var i = 0; i < length - 1; i++) {
                this.move(0, length - 1 - i); // Collection notifications are inside move()
            }
            this.sorting = false;

            // Notify of properties changes
            for (var i = 0; i < length; i++) {
                // Middle item was not changed
                if (!(length % 2 === 1 && Math.floor(length / 2) === i)) {
                    this.onPropertyChanged.invoke(i.toString());
                }
            }

            return this.inner;
        }

        shift(): T {
            var item = this.remove(0);
            return item;
        }

        private sorting = false; // Prevents property changed notifications while sorting

        sort(compareFn?: (a: T, b: T) => number): T[] {
            var unsorted = this.inner.slice();
            var sorted = unsorted.slice().sort(compareFn);

            var indicies = unsorted.map((v, i) => {
                return {
                    old: i,
                    new: sorted.indexOf(v)
                };
            });
            indicies.sort((a, b) => b.new - a.new);
            for (var i = 0; i < indicies.length; i++) {
                for (var j = i + 1; j < indicies.length; j++) {
                    if (indicies[i].old < indicies[j].old) {
                        indicies[j].old--;
                    }
                }
            }
            this.sorting = true;
            indicies.forEach((i) => i.old !== i.new && this.move(i.old, i.new)); // Collection notifications are inside move()
            this.sorting = false;

            // Notify of properties changes
            indicies.forEach((i) => {
                if (i.new !== i.old) {
                    this.onPropertyChanged.invoke(i.new.toString());
                }
            });

            return this.inner;
        }

        splice(start: number): T[];
        splice(start: number, deleteCount: number, ...items: T[]);
        splice(start: number, deleteCount?: number, ...items: T[]): T[] {
            //
            // Check

            if (start === void 0/* || (items && items.length === 0)*//*TypeScript creates an empty Array*/) {
                throw new Error('The specified arguments may lead to unexpected result.');
            }

            if (start < 0)
                start = this.inner.length + start;

            if (start < 0 || start > this.inner.length || deleteCount < 0)
                throw new Error('Index was out of range.');

            deleteCount = isNaN(deleteCount) ? (this.inner.length - start) : deleteCount;

            //
            // Process

            var oldLength = this.inner.length;
            this.splicing = true;
            // Delete
            var deleted = new Array<T>();
            for (var i = 0; i < deleteCount; i++) {
                var item = this.remove(start);
                deleted.push(item);
            }
            if (items) {
                // Add
                var index = start;
                items.forEach((item) => {
                    this.add(item, index);
                    index++;
                })
            }
            this.splicing = false;

            // Notify of properties changes
            var addedCount = items ? items.length : 0;
            var newLength = this.inner.length;
            var end = deleteCount === addedCount ? start + addedCount : Math.max(newLength, oldLength);
            for (var i = start; i < end; i++) {
                this.onPropertyChanged.invoke(i.toString());
            }

            return deleted;
        }

        unshift(...items: T[]): number {
            this.splice(0, 0, items.length > 1 ? <any>items : items[0]);
            //for (var i = 0; i < items.length; i++) {
            //    this.add(items[i], i);
            //}
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
} 