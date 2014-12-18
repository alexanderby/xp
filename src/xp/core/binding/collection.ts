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
        move,
        set,
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
     * Defines a collection whick changes can be tracked.
     */
    export class ObservableCollection<T> {

    }
} 