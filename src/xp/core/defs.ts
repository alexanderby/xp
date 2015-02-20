module xp {

    /**
     * Defines a constructor of type T instance.
     */
    export interface Constructor<T> {
        new (...args: any[]): T;
    }

}