module xp {
    /**
     * UI control's property bindable expression.
     */
    export class Expression implements Notifier {
        /**
         * Is invoked when expression result changes.
         */
        onPropertyChanged: Event<string>;
        private scope: Object;
        private func: Function;
        private propsPaths: string[];
        private managers: BindingManager[];
        private params: Notifier;
        // Holds change handlers for collection parameters.
        private collectionRegistrations: { [paramName: string]: EventRegistrar };

        /**
         * Creates control's property bindable expression.
         * @param expression Expression e.g. "{obj.a} * 2 + Math.round({b})".
         */
        constructor(expression: string, scope: any) {
            this.scope = scope;
            Object.defineProperty(this, 'onPropertyChanged', {
                value: new Event()
            });

            // Find paths
            var regex = /\{([^\s\(\)]+?)\}/g;
            var matches = expression.match(regex);
            var propsPaths: string[] = [];
            if (matches) {
                for (var i = 0; i < matches.length; i++) {
                    var path = matches[i].replace('{', '').replace('}', '');
                    if (path === '')
                        throw new Error('Empty path binding for expression is not supported. Expression: "' + expression + '"');
                    if (propsPaths.indexOf(path) < 0) {
                        propsPaths.push(path);
                    }
                }
            }
            this.propsPaths = propsPaths;

            // Create function
            var body = expression;
            var params: string[] = [];
            this.params = { onPropertyChanged: new Event<string>() };
            this.collectionRegistrations = {};
            propsPaths.forEach((p, i) => {
                var param = 'p' + i;
                //body = body.replace('{' + p + '}', param); // Doesn't replace all. Regexp?
                body = body.split('{' + p + '}').join(param);
                params.push(param);
                // Add param property
                var fieldName = '_' + param;
                this.params[fieldName] = null;
                Object.defineProperty(this.params, param, {
                    get: () => this.params[fieldName],
                    set: (value) => {
                        if (this.collectionRegistrations[param]) {
                            // Unsubscribe from collection changes
                            this.collectionRegistrations[param].unsubscribeAll();
                            delete this.collectionRegistrations[param];
                        }

                        if (value !== void 0 && isCollectionNotifier(value)) {
                            // Subscribe for collection changes
                            var registar = new EventRegistrar();
                            var cn = <CollectionNotifier<any>>value;
                            registar.subscribe(cn.onCollectionChanged, (args) => {
                                this.exec();
                            }, this);
                            this.collectionRegistrations[param] = registar
                        }

                        this.params[fieldName] = value;
                        // Execute function
                        if (!this.sourceSetToken) {
                            this.exec();
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
            });
            // NOTE: new Function() and eval() are forbidden in Chrome apps.
            //this.func = new Function(params.join(', '), 'return ' + body + ';');

            //
            // Parse expression

            this.func = function() {
                var scope = {};
                for (var i = 0; i < arguments.length; i++) {
                    scope['p' + i] = arguments[i];
                }
                var result = evaluate(body, scope);
                return result;
            };

            // Create managers
            this.managers = [];
            this.propsPaths.forEach((path, i) => {
                var manager = new BindingManager({
                    scope: this.params,
                    path: params[i],
                    setter: (v) => {
                        if (this.scope) {
                            Path.setPropertyByPath(this.scope, path, v);
                        }
                    }
                }/*this.params, params[i], this.scope, path*/);
                this.managers.push(manager);
            });

            // Execute
            this.exec();
        }

        /**
         * Gets expression evaluation result.
         */
        get result() {
            return this.resultField;
        }
        set result(value) {
            // TODO: Try set source values,
            this.resultField = value;
            this.onPropertyChanged.invoke('result');
        }
        private resultField;

        /**
         * Executes the expression.
         */
        exec() {
            // Get parameters
            var params = [];
            for (var key in this.params) {
                // TODO: Use "Object.defineProperty" with "enumerable:false"
                // for properties, which should not be listed.
                if (key[0] === 'p') {
                    var p = this.params[key];
                    if (p instanceof ObservableCollection) {
                        p = (<ObservableCollection<any>>p).slice();
                    }
                    params.push(p);
                }
            }
            try {
                // Execute
                this.resultField = this.func.apply(null, params);
            }
            catch (e) {
                Log.write(Log.HeatLevel.Warn, Log.Domain.Binding, 'Expression error: ' + e);
                this.resultField = null;
            }
            this.onPropertyChanged.invoke('result');
        }

        private sourceSetToken = false; // Prevents multiple evaluations on all bindings reset.

        /**
         * Resets source and causes expression evaluation.
         * @param scope Source.
         */
        resetWith(scope: Object) {
            this.sourceSetToken = true;
            this.scope = scope;
            this.managers.forEach((m) => {
                m.resetWith(scope);
            });
            this.sourceSetToken = false;
            this.exec();
        }

        /**
         * Removes binding.
         * Must be called when target is being disposed or property path changes.
         */
        unbind() {
            this.managers.forEach((m) => m.unbind());
            this.onPropertyChanged.removeAllHandlers();
        }
    }

    /**
     * Evaluates an expression.
     * Supports the next operators: ?:, ||, &&, !==, ===, !=, ==, >=, >, <=, <, -, +, /, *, typeof, !, ().
     * @param expression Expression string, eg. "x * (arr.indexOf(x) + 1)".
     * @param scope Object containing expression variables, eg. { x: 2, 
     */
    export function evaluate(expression: string, scope: Object): any {

        // TODO: Seems to be weird. Needs refactoring, should behave like eval().
        // Maybe replace with expression chain.

        var hideBrackets = (str: string): string=> {
            var prev: string;
            while (prev !== str) {
                prev = str;
                str = str.replace(/\([^\(\)]*\)/g, ($0) => new Array($0.length + 1).join(' '));
            }
            return str;
        };

        var splitLeftRight = function(expr: string) {
            // Replace strings with whitespaces
            var str = expr.replace(/((".*?")|('.*?'))/g, ($0, $1) => new Array($1.length + 1).join(' '));
            // Replace brackets with whitespaces
            str = hideBrackets(str);
            var index = str.indexOf(this.op);
            if (index < 0) {
                return null;
            }
            else {
                return [
                    expr.slice(0, index),
                    expr.slice(index + this.op.length, expr.length)
                ];
            }
        };
        var splitRight = function(expr: string) {
            // Replace strings with whitespaces
            var str = expr.replace(/((".*?")|('.*?'))/g, ($0, $1) => new Array($1.length + 1).join(' '));
            // Replace brackets with whitespaces
            str = hideBrackets(str);
            var index = str.indexOf(this.op);
            if (index < 0) {
                return null;
            }
            else {
                return [
                    expr.slice(index + this.op.length, expr.length)
                ];
            }
        };
        //var splitMiddle = function (expr: string) {
        //    if (this.op !== '[]' && this.op !== '()') {
        //        throw new Error('This split fn is not supported for operand "' + this.op + '".');
        //    }
        //    // Replace strings with whitespaces
        //    var str = expr.replace(/((".*?")|('.*?'))/g,($0, $1) => new Array($1.length + 1).join(' '));
        //    var regex = new RegExp('\\' + this.op[0] + '[^\\' + this.op[0] + '\\' + this.op[1] + ']*?\\' + this.op[1]);
        //    var match = str.match(regex);
        //    if (match && match[0]) {
        //        var index = str.indexOf(match[0]);
        //        return [
        //            expr.slice(index + 1, index + match[0].length - 1)
        //        ];
        //    }
        //    else {
        //        return null;
        //    }
        //};

        // Precedence
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence#Table
        var parsers: {
            op: string;
            fn: Function;
            split: (expr: string) => string[];
        }[] = [
                //{
                //    op: '()',
                //    fn: (a) => a,
                //    split: splitMiddle
                //},
                {
                    op: '?:',
                    fn: (a, b, c) => a ? b : c,
                    split: function(expr: string) {
                        // Replace strings with whitespaces
                        var str = expr.replace(/((".*?")|('.*?'))/g, ($0, $1) => new Array($1.length + 1).join(' '));
                        // Replace brackets with whitespaces
                        str = hideBrackets(str);
                        var index1 = str.indexOf(this.op[0]);
                        if (index1 < 0) {
                            return null;
                        }
                        else {
                            var index2 = str.indexOf(this.op[1], index1 + 1);
                            if (index2 < 0) {
                                return null;
                            }
                            else {
                                return [
                                    expr.slice(0, index1),
                                    expr.slice(index1 + 1, index2),
                                    expr.slice(index2 + 1, expr.length)
                                ];
                            }
                        }
                    }
                },
                {
                    op: '||',
                    fn: (a, b) => a || b,
                    split: splitLeftRight
                }, {
                    op: '&&',
                    fn: (a, b) => a && b,
                    split: splitLeftRight
                }, {
                    op: '!==',
                    fn: (a, b) => a !== b,
                    split: splitLeftRight
                }, {
                    op: '===',
                    fn: (a, b) => a === b,
                    split: splitLeftRight
                }, {
                    op: '!=',
                    fn: (a, b) => a != b,
                    split: splitLeftRight
                }, {
                    op: '==',
                    fn: (a, b) => a == b,
                    split: splitLeftRight
                }, {
                    op: '>=',
                    fn: (a, b) => a >= b,
                    split: splitLeftRight
                }, {
                    op: '>',
                    fn: (a, b) => a > b,
                    split: splitLeftRight
                }, {
                    op: '<=',
                    fn: (a, b) => a <= b,
                    split: splitLeftRight
                }, {
                    op: '<',
                    fn: (a, b) => a < b,
                    split: splitLeftRight
                }, {
                    op: '-',
                    fn: (a, b) => a - b,
                    split: splitLeftRight
                }, {
                    op: '+',
                    fn: (a, b) => a + b,
                    split: splitLeftRight
                }, {
                    op: '/',
                    fn: (a, b) => a / b,
                    split: splitLeftRight
                }, {
                    op: '*',
                    fn: (a, b) => a * b,
                    split: splitLeftRight
                }, {
                    op: 'typeof',
                    fn: (a) => typeof a,
                    split: splitRight
                }, {
                    op: '!',
                    fn: (a) => !a,
                    split: splitRight
                },
            ];

        var parse = (expr: string, level?: number): any => {
            expr = expr.trim();
            if (level === void (0)) {
                level = 0;
            }
            if (level === parsers.length) {
                if (expr[0] === '(' && expr[expr.length - 1] === ')') {
                    return parse(expr.slice(1, expr.length - 1), 0);
                }

                //
                // Return value

                // Boolean
                if (expr === 'true') {
                    return true;
                }
                if (expr === 'false') {
                    return false;
                }
                // Number
                var num = +expr;
                if (expr !== '' && !isNaN(num)) {
                    return num;
                }
                // String
                if (/^(".*")|('.*')$/.test(expr)) {
                    return expr.slice(1, expr.length - 1);
                }
                // Scope variable
                if (expr in scope) {
                    return scope[expr];
                }
                // Global scope variable
                if (expr in window) {
                    return window[expr];
                }

                // Get property
                var firstDotIndex = expr.indexOf('.');
                if (firstDotIndex >= 0) {
                    var varName = expr.slice(0, firstDotIndex);
                    if (!(varName in scope) && !(varName in window)) {
                        throw new Error('Expression scope doesn\'t contain "' + varName + '".');
                    }
                    var value = varName in scope ? scope[varName] : window[varName];
                    var propPath = expr.slice(firstDotIndex + 1, expr.length);
                    var objPath = Path.getObjectPath(propPath);
                    var lastObj = Path.getPropertyByPath(value, objPath, false);
                    if (typeof lastObj !== 'object' || lastObj === null) {
                        Log.write(Log.HeatLevel.Info, Log.Domain.Binding, 'Unable to execute expression: Item supposed to be an object.');
                        // TODO: Throw error?
                        return;
                    }
                    var propName = Path.getPropertyName(propPath);
                    var funcMatch = propName.match(/\((.*)\)$/);
                    if (funcMatch && funcMatch[1]) {
                        // Call function
                        propName = propName.slice(0, funcMatch.index);
                        var paramsStr = funcMatch[1];
                        var params = paramsStr.split(',').map((p) => parse(p));
                        return lastObj[propName].apply(lastObj, params);
                    }
                    else {
                        return lastObj[propName];
                    }
                }
                else {
                    // Is function?
                    var funcMatch = expr.match(/\((.*)\)$/);
                    if (funcMatch && funcMatch[1]) {
                        // Call function
                        var propName = expr.slice(0, funcMatch.index);
                        var paramsStr = funcMatch[1];
                        var params = paramsStr.split(',').map((p) => parse(p));
                        return lastObj[propName].apply(lastObj, params);
                    }
                }

                // Couldn't resolve
                throw new Error('Expression scope doesn\'t contain "' + expr + '".');
            }

            // Get parser at current level
            var parser = parsers[level];

            // Split expression
            var parts = parser.split(expr);
            if (!parts) {
                // Not found -> parse at next level
                return parse(expr, level + 1);
            }
            else {
                // Parse parts and evaluate
                var args = [];
                for (var i = 0; i < parts.length; i++) {
                    var arg = parse(parts[i], level);
                    args.push(arg);
                }
                return parser.fn.apply(null, args);
            }
        };

        var result = parse(expression);
        return result;
    }

    //class Operator {
    //    symbol: string;
    //    exec: Function;
    //    getParts(expr: string): string[]{

    //    }

    //}

    //
    // TODO: Parse complex expressions, parse into functions.


    ////----------
    //// Operators
    ////----------
    
    //// TODO: Support all operators.
    //// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators
    //class Expr {
    //    value;

    //    //take(x) {
    //    //    this.value = x;
    //    //    return this;
    //    //}

    //    constructor(value) {
    //        this.value = value;
    //    }

    //    static parse(expr: string) {
    //        // Precedence
    //        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence#Table
    //        var parts=expr.split('
    //    }

    //    member(x) {
    //        this.value = this.value[x];
    //        return this;
    //    }
    //    new(x, p) {
    //        this.value = xp.applyConstructor(x, p);
    //        return this;
    //    }
    //    call(x, p) {
    //        this.value = this.value[x].apply(this.value, p);
    //    }

    //    //
    //    // Assignment operators

    //    //
    //    // Comparison operators

    //    equal(x) {
    //        this.value = this.value == x;
    //        return this;
    //    }
    //    notEqual(x) {
    //        this.value = this.value != x;
    //        return this;
    //    }
    //    strictEqual(x) {
    //        this.value = this.value === x;
    //        return this;
    //    }
    //    strictNotEqual(x) {
    //        this.value = this.value !== x;
    //        return this;
    //    }
    //    greaterThan(x) {
    //        this.value = this.value > x;
    //        return this;
    //    }
    //    greaterThanOrEqual(x) {
    //        this.value = this.value >= x;
    //        return this;
    //    }
    //    lessThan(x) {
    //        this.value = this.value < x;
    //        return this;
    //    }
    //    lessThanOrEqual(x) {
    //        this.value = this.value <= x;
    //        return this;
    //    }

    //    //
    //    // Arithmetic operators

    //    add(x) {
    //        this.value = this.value + x;
    //        return this;
    //    }
    //    subtract(x) {
    //        this.value = this.value - x;
    //        return this;
    //    }
    //    multiply(x) {
    //        this.value = this.value * x;
    //        return this;
    //    }
    //    divide(x) {
    //        this.value = this.value / x;
    //        return this;
    //    }
    //    remainder(x) {
    //        this.value = this.value % x;
    //        return this;
    //    }
    //    preIncrement() {
    //        this.value = ++this.value;
    //        return this;
    //    }
    //    preDecrement() {
    //        this.value = --this.value;
    //        return this;
    //    }
    //    postIncrement() {
    //        this.value = this.value++;
    //        return this;
    //    }
    //    postDecrement() {
    //        this.value = this.value--;
    //        return this;
    //    }
    //    unaryNegation() {
    //        this.value = -this.value;
    //        return this;
    //    }
    //    unaryPlus() {
    //        this.value = +this.value;
    //        return this;
    //    }
          

    //    //
    //    // Bitwise operators

    //    bitwiseAnd(x) {
    //        this.value = this.value & x;
    //        return this;
    //    }
    //    bitwiseOr(x) {
    //        this.value = this.value | x;
    //        return this;
    //    }
    //    bitwiseXor(x) {
    //        this.value = this.value ^ x;
    //        return this;
    //    }
    //    bitwiseNot() {
    //        this.value = ~this.value;
    //        return this;
    //    }
    //    leftShift(x) {
    //        this.value = this.value << x;
    //        return this;
    //    }
    //    rightShift(x) {
    //        this.value = this.value >> x;
    //        return this;
    //    }
    //    zeroFillRightShift(x) {
    //        this.value = this.value >> x;
    //        return this;
    //    }

    //    //
    //    // Logical operators

    //    and(x) {
    //        this.value = this.value && x;
    //        return this;
    //    }
    //    or(x) {
    //        this.value = this.value || x;
    //        return this;
    //    }
    //    not() {
    //        this.value = !this.value;
    //        return this;
    //    }

    //    //
    //    // Conditional (ternary) operator

    //    condition(t, f) {
    //        this.value = this.value ? t : f;
    //        return this;
    //    }

    //    //
    //    // Comma operator

    //    comma(x) {
    //        this.value = x;
    //        return this;
    //    }

    //    //
    //    // Unary operators

    //    delete(x) {
    //        delete this.value[x];
    //        return this;
    //    }
    //    typeof() {
    //        this.value = typeof this.value;
    //        return this;
    //    }
    //    void() {
    //        this.value = void (this.value);
    //        return this;
    //    }

    //    //
    //    // Relational operators

    //    in(x) {
    //        this.value = x in this.value;
    //        return this;
    //    }
    //    instanceof(x) {
    //        this.value = this.value instanceof x;
    //        return this;
    //    }
    //}
} 