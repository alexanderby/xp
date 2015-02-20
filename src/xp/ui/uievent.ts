type gEvent = Event;

module xp.UI {

    export interface Coordinates {
        x: number;
        y: number;
    }

    export interface UIEventArgs extends JQueryEventObject {
        targetUIControl: Element;
        elementX: number;
        elementY: number;
    }

    export function createEventArgs(control: Element, domEventObject: gEvent): UIEventArgs {
        var e = <UIEventArgs>domEventObject;

        // Target element
        e.targetUIControl = control;

        // Location relatively element
        var offset = control.domElement.offset();
        e.elementX = e.pageX - offset.left;
        e.elementY = e.pageY - offset.top;

        return e;
    }

    export class UIEvent extends Event<UIEventArgs> { }
} 