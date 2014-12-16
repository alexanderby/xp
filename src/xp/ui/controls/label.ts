module xp.Ui {
    export class Label extends Element {

        //----
        // DOM
        //----

        protected getTemplate(): JQuery {
            //var template = $('<span class="label"><span class="text"></span></span>');
            //this.textElement = template.find('.text');
            //return template;
            return $('<span class="label"></span>');
        }

        protected textElement: JQuery;


        //-----------
        // PROPERTIES
        //-----------

        /**
         * Gets or sets label's text.
         */
        get text() {
            return this._text;
        }
        set text(text) {
            console.log('Set text: ' + text);
            this._text = text;

            // DOM
            //this.textElement.text(text);
            this.domElement.text(text);
        }
        protected _text: string;


        //------------------
        // ATTRIBUTE MAPPING
        //------------------

        /**
        * Defines the way of setting control's properties through the XML attributes.
        */
        protected getAttributeMap(): AttributeMap {
            return xp.extendObject(super.getAttributeMap(), {
                'text': {
                    '*': (value) => this.text = value
                },
            });
        }


        //--------
        // BINDING
        //--------

        //protected bind: BindableObject<any>;

        ///**
        // * Binds label to bindable object 
        // */
        //bindTo(bind: BindableObject<any>, objPropertyName: string) {
        //    this.bind = bind;
        //    this.text = bind.data[propertyName];
        //    bind.onPropertyChanged.addHandler((args) => {
        //        if (args.propertyName === propertyName) {
        //            this.text = args.newValue;
        //        }
        //    }, this);
        //}
    }
    Tags['label'] = Label;
} 