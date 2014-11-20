module xp.Ui {

    export interface Coordinates {
        x: number;
        y: number;
    }

    export interface EventArgs extends JQueryEventObject {
        targetUiControl: Element;
        elementX: number;
        elementY: number;
    }

    // TODO: How to use 'Event' interface?
    export function createEventArgs(control: Element, event: any/*Event*/): EventArgs {
        var e = <EventArgs>event;

        // Target element
        e.targetUiControl = control;

        // Location relatively element
        var offset = this.domElement.offset();
        e.elementX = e.pageX - offset.left;
        e.elementY = e.pageY - offset.top;

        return e;
    }

    export class UiEvent extends Event<EventArgs> { }
} 