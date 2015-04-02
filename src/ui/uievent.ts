type gEvent = Event;

module xp.UI {

    export interface Coordinates {
        x: number;
        y: number;
    }

    export interface EventArgs<T extends gEvent> {
        element: Element;
        elementX?: number;
        elementY?: number;
        domEvent: T;
    }

    export function createEventArgs<T extends gEvent>(control: Element, domEventObject: T): EventArgs<T> {
        var rect = control.domElement.getBoundingClientRect();

        var e: EventArgs<T> = {
            domEvent: domEventObject,
            element: control
        };
        if ('pageX' in domEventObject) {
            e.elementX = (<any>domEventObject).pageX - rect.left;
        }
        if ('pageY' in domEventObject) {
            e.elementY = (<any>domEventObject).pageY - rect.top;
        }

        return e;
    }

    export class UIEvent<T extends gEvent> extends Event<EventArgs<T>> { }
} 