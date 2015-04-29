type domEvent = Event;
type domMouseEvent = MouseEvent;
type domKeyboardEvent = KeyboardEvent;

module xp {

    export interface UIEventArgs<T extends domEvent> {
        element: Element;
        elementX?: number;
        elementY?: number;
        domEvent: T;
    }

    export interface EventArgs extends UIEventArgs<domEvent> { }
    export interface MouseEventArgs extends UIEventArgs<domMouseEvent> { }
    export interface KeyboardEventArgs extends UIEventArgs<domKeyboardEvent> { }

    export function createEventArgs<T extends domEvent>(control: Element, domEventObject: T): UIEventArgs<T> {
        var rect = control.domElement.getBoundingClientRect();

        var e: UIEventArgs<T> = {
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

    //export interface Event {
    //    new (): xp.Event<EventArgs<domEvent>>;
    //};
    //declare var Event: typeof Event;
    //export interface MouseEvent {
    //    new (): xp.Event<EventArgs<domMouseEvent>>;
    //};
    //declare var MouseEvent: typeof MouseEvent;
    //export interface KeyboardEvent {
    //    new (): xp.Event<EventArgs<domKeyboardEvent>>;
    //};
    //declare var KeyboardEvent: typeof KeyboardEvent;

    //export class Event extends xp.Event<EventArgs<domEvent>> { }
    //export class MouseEvent extends xp.Event<EventArgs<domMouseEvent>> { }
    //export class KeyboardEvent extends xp.Event<EventArgs<domKeyboardEvent>> { }
} 