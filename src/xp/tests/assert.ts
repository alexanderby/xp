module xp.Tests {

    /**
     * Determines whether two objects are equal.
     * If not throws an error.
     */
    export function assertEqual(a, b) {
        if (a !== b) {
            throw new Error(xp.formatString('"{0}" is not equal to "{1}".', a, b));
        }
    }
} 