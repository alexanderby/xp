module xp.Tests {

    /**
     * Throws an error if statement is not true.
     */
    export function assert(statement: boolean) {
        var t = typeof statement;
        if (t !== 'boolean')
            throw new Error('Assert statement must be boolean but not ' + t + '.');

        if (statement !== true) {
            throw new Error('Statement is wrong.');
        }
    }

    /**
     * Determines whether two objects are equal.
     * If not throws an error.
     */
    export function assertEqual(a, b) {
        if (a !== b) {
            throw new Error(`"${a}" is not equal to "${b}".`);
        }
    }
} 