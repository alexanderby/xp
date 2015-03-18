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
            if (this.handlers.filter((h) => h.handler === handler/* && h.scope === thisArg*/)[0]) {
                throw new Error('Duplicate subscription.');
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
            var found = this.handlers.filter((h) => h.handler === handler)[0];
            if (!found) {
                throw new Error('Unable to remove event handler :\n' + handler.toString());
            }
            this.handlers.splice(this.handlers.indexOf(found), 1);
            return found.handler;
        }

        /**
         * Removes all event handlers.
         */
        removeAllHandlers() {
            this.handlers = [];
        }

        /**
         * Determines if the specified handler is already subscribed for an event.
         * @param handler Event handler.
         */
        hasHandler(handler: EventHandler<TEventArgs>): boolean {
            return this.handlers.filter((h) => h.handler === handler).length >= 0;
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
     * Simplifies subscription and especially unsubscription of events.
     */
    export class EventRegistrar {
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