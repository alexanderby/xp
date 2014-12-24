//module xp {
//    export var Controllers: { [controllerName: string]: Controller/*<any>*/} = {};

//    /**
//     * Controller base.
//     */
//    export class Controller/*<TApp extends Application>*/ {

//        //protected app: TApp;

//        ///**
//        // * Creates the controller.
//        // */
//        //constructor(app: TApp) {
//        //    this.app = app;
//        //}

//        /**
//         * Binds given UI element to the controller.
//         * @param element UI element. 
//         */
//        registerPresentation(element: UI.Element) {
//            // Set root
//            this.root = element;

//            // Set named controls
//            if (this.root instanceof UI.Container) {
//                var names: string[] = [];
//                (<UI.Container>this.root).cascadeBy((el) => {
//                    if (el.name) {
//                        this[el.name] = el;
//                    }
//                    return false;
//                });
//            }

//            // Create and set data context
//            var context = this.createDataContext();
//            if (context) {
//                this.root.context = context;
//            }
//        }



//        /**
//         * Initializes data context. Must be overriden to create and pass context to UI.
//         */
//        protected /*virtual*/ createDataContext(): any { }

//        /**
//         * Root UI element.
//         */
//        protected root: UI.Element;
//    }
//} 