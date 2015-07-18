module.exports = function (grunt) {
    require('create-grunt-tasks')(grunt, function (create) {
        var config = getConfig();

        //--------
        // RELEASE
        //--------

        create.task('build')

            //
            // TYPESCRIPT

            // Compile
            .sub('typescript', {
                // TODO: tsconfig.json doesn't work? Waiting for TS1.5 release?
                src: config.tsFiles,
                dest: 'build/xp/xp.js',
                options: { target: 'es5', sourceMap: false, declaration: true }
            })
            
            // Minify
            .sub('uglify', {
                src: 'build/xp/xp.js',
                dest: 'build/xp/xp.min.js',
                // files: {
                //     'build/xp/xp.min.js': ['build/xp/xp.js']
                // },
                options: {
                    mangle: {
                        except: [
                            'ObservableCollection', 'ObservableObject', 'Model',
                            'BindingManager', 'BindingCallManager', 'Scope',
                            'Expression', 'Element', 'Container', 'Stack',
                            'Button', 'CheckBox', 'ContextMenu', 'HBox', 'Html',
                            'Label', 'List', 'MessageBox', 'Modal', 'ModalTint',
                            'Placeholder', 'RadioButton', 'TextArea', 'TextBox',
                            'ToggleButton', 'VBox', 'Window', 'Modal', 'ModalTint',
                        ]
                    },
                    //banner: getBanner()
                }
            })

            // Move type definition
            .sub('copy', {
                expand: true, cwd: 'build/xp/',
                src: 'xp.d.ts',
                dest: 'build/xp/typing/'
            })
            .sub('clean', ['build/xp/xp.d.ts'])


            //
            // LESS

            // Concat controls' LESS into "_xp.less"
            .sub('concat', config.lessConcatConfig)

            // Copy concatenated LESS file
            .sub('copy', {
                expand: true, cwd: 'src/style/',
                src: '_xp.less',
                dest: 'build/xp/style/'
            })

            // Compile default style --and fallback style
            .sub('less', {
                files: {
                    'build/xp/style/defaultstyle.css': 'src/style/defaultstyle.less',
                    'build/xp/style/ie9-layout-fallback.css': 'src/style/ie9-layout-fallback.less',
                },
                options: {
                    paths: ['src/style/']
                }
            })

            // Copy variables
            .sub('copy', {
                expand: true, cwd: 'src/style/',
                src: '_variables.less',
                dest: 'build/xp/style/'
            });



        //------
        // DEBUG
        //------

        create.task('debug')
            .sub('typescript', {
                src: ['src/**/*.ts/'],
                options: {
                    target: 'es5',
                    sourceMap: true
                }
            })
            .sub('concat', config.lessConcatConfig)
            .sub('less', {
                files: {
                    'src/style/defaultstyle.css': 'src/style/defaultstyle.less',
                    'src/style/debug-style.css': 'src/style/debug-style.less',
                    'src/style/ie9-layout-fallback.css': 'src/style/ie9-layout-fallback.less',
                    'src/tests/todo/style/style.css': 'src/tests/todo/style/style.less'
                },
                options: {
                    paths: ['src/style/']
                }
            })
    });
};


function getConfig() {
    var cfg = {
        tsFiles: [
            'src/utils/dom.ts',
            'src/utils/log.ts',
            'src/utils/misc.ts',
            'src/utils/path.ts',

            'src/core/defs.ts',
            'src/core/dictionary.ts',
            'src/core/event.ts',

            'src/data/object.ts',
            'src/data/collection.ts',
            'src/data/observable.ts',
            'src/data/expression.ts',
            'src/data/manager.ts',
            'src/data/call_manager.ts',
            'src/data/model.ts',
            'src/data/scope.ts',
            'src/data/serialization.ts',

            'src/ui/uievent.ts',

            'src/ui/controls/element.ts',
            'src/ui/controls/button.ts',
            'src/ui/controls/checkbox.ts',
            'src/ui/controls/label.ts',
            'src/ui/controls/placeholder.ts',
            'src/ui/controls/radiobutton.ts',
            'src/ui/controls/togglebutton.ts',
            'src/ui/controls/textbox.ts',
            'src/ui/controls/textarea.ts',

            'src/ui/controls/html.ts',

            'src/ui/controls/container.ts',
            'src/ui/controls/stack.ts',
            'src/ui/controls/hbox.ts',
            'src/ui/controls/vbox.ts',
            'src/ui/controls/list.ts',
            'src/ui/controls/window.ts',
            'src/ui/controls/modal.ts',
            'src/ui/controls/messagebox.ts',
            'src/ui/controls/contextmenu.ts',

            'src/tests/assert.ts'
        ],

        lessConcatConfig: {
            src: [
                'src/style/_button.less',
                'src/style/_checkbox.less',
                'src/style/_contextmenu.less',
                'src/style/_hbox.less',
                'src/style/_label.less',
                'src/style/_modal.less',
                'src/style/_placeholder.less',
                'src/style/_radiobutton.less',
                'src/style/_scrollbar.less',
                'src/style/_textbox.less',
                'src/style/_togglebutton.less',
                'src/style/_vbox.less',
                'src/style/_window.less'
            ],
            dest: 'src/style/_xp.less',
            options: {
                // Remove multiple @import "_variables.less";
                process: function (src, filepath) {
                    if (filepath !== cfg.lessConcatConfig.src[0]) {
                        src = src.replace(/@import "_variables.less";[\r\n]{2}/g, '');
                    }
                    return src;
                }
            }
        }
    };
    return cfg;
}