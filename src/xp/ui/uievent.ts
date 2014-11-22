module xp.Ui {

    export interface Coordinates {
        x: number;
        y: number;
    }

    export interface UiEventArgs extends JQueryEventObject {
        targetUiControl: Element;
        elementX: number;
        elementY: number;
    }

    // TODO: How to use 'Event' interface?
    export function createEventArgs(control: Element, domEventObject: any/*Event*/): UiEventArgs {
        var e = <UiEventArgs>domEventObject;

        // Target element
        e.targetUiControl = control;

        // Location relatively element
        var offset = control.domElement.offset();
        e.elementX = e.pageX - offset.left;
        e.elementY = e.pageY - offset.top;

        return e;
    }

    export class UiEvent extends Event<UiEventArgs> { }
} 