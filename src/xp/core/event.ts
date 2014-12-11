module xp {
    /**
     * Event.
     * @param TEventArgs Type of event arguments object.
     */
    export class Event<TEventArgs>
    {
        private handlers: Subscription<TEventArgs>[] = [];

        /**
         * Adds event handler.
         * @param handler Function which will be called when event happens.
         * @param thisArg Context of handler.
         * @returns Subscription.
         */
        addHandler(handler: EventHandler<TEventArgs>, thisArg: any): Subscription<TEventArgs> {
            var subscription = {
                event: this,
                handler: handler,
                scope: thisArg
            };
            if (!this.handlers.filter((h) => h.handler === handler && h.scope === thisArg)[0]) {
                var stackTrace = xp.getStackTrace();
                var msg = xp.formatString('Warning: Duplicate subscription. {0}', stackTrace);
                console.log(msg);
            }
            this.handlers.push(subscription);
            return subscription;
        }

        /**
         * Removes event handler.
         * @param handler Function to remove.
         * @returns Removed handler.
         */
        removeHandler(handler: EventHandler<TEventArgs>): EventHandler<TEventArgs> {
            var found = null;
            var index = -1;
            this.handlers.every((current, i) => {
                if (current.handler === handler) {
                    index = i;
                    found = current.handler;
                    return false;
                }
                else {
                    return true;
                }
            });
            if (index >= 0) {
                this.handlers.splice(index, 1);
            }
            return found;
        }

        /**
         * Removes all event handlers.
         */
        removeAllHandlers() {
            this.handlers = [];
        }

        /**
         * Fires the event.
         * @param args Event arguments.
         */
        invoke(args: TEventArgs) {
            this.handlers.forEach((item) => {
                item.handler.call(item.scope, args);
            });
        }
    }

    /**
     * Function which handles an event.
     * @param TEventArgs Type of event arguments object.
     */
    export interface EventHandler<TEventArgs> {
        /**
         * @param args Event arguments object.
         */
        (args: TEventArgs): void;
    }

    /**
     * Simplifies subscription and especially unsubscription on events.
     */
    export class EventRegistar {
        private subscriptions: Subscription<any>[] = [];

        /**
         * Subscribes specified handlers on events.
         * @param event Event.
         * @param handler Event handler.
         * @param thisArg Handler's scope.
         * @returns Subscription.
         */
        subscribe<T>(event: Event<T>, handler: EventHandler<T>, thisArg: any): Subscription<T> {
            var subscription = event.addHandler(handler, thisArg);
            this.subscriptions.push(subscription);
            return subscription;
        }

        /**
         * Unsubscribes specified handlers on events.
         * @param predicate Function to filter subscriptions.
         */
        unsubscribe<T>(predicate: (s: Subscription<T>) => boolean) {
            var index: number;
            while ((index = this.subscriptions.indexOf(this.subscriptions.filter(predicate)[0])) >= 0) {
                this.subscriptions.splice(index, 1);
            }
        }

        /**
         * Unsubscribes all registered handlers.
         */
        unsubscribeAll() {
            this.subscriptions.forEach((s) => {
                s.event.removeHandler(s.handler);
            });
            this.subscriptions = [];
        }
    }

    /**
     * Contains info about event and it's handler.
     */
    export interface Subscription<T> {
        event: Event<T>;
        handler: EventHandler<T>;
        scope: any;
    }
} 