module xp.Ui {
    export class Expression {
        constructor(expression: string) {
            // Find matches
            var matches = expression.match(/\{(.+?)\}/g)[1];
            var props: string[] = [];
            for (var i = 0; i < matches.length; i++) {
                if (props.indexOf(matches[i]) < 0) {
                    props.push(matches[i]);
                }
            }

            // Create properties

            // Create managers
        }

        get source() {
            return this._source;
        }
        set source(source) {
            this._source = source;

            // Init managers or reset them
        }
        private _source;

        private func: () => any;

        private managers: Binding.BindingManager[];
    }
} 