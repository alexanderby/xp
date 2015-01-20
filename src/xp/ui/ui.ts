module xp.UI {

    /**
     * "XML tag":"UI class" dictionary.
     */
    export var Tags: { [tag: string]: typeof Element } = {};

    /**
     * "XML tag":"List of dependencies types" dictionary.
     */
    //export var Dependencies: { [tag: string]: typeof Object [] } = {};

    /**
     * "XML tag":"Dependency name" dictionary.
     */
    export var Dependencies: { [tag: string]: string[] } = {};

    /**
     * "Dependency name":"Instance" dictionary.
     */
    export var Instances: { [depName: string]: any } = {};

    //export var TabIndex = 0;
}  