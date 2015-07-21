module.exports = function (grunt) {
    grunt.initConfig({
        typescript: {
            compile: {
                src: 'app.ts',
                options: {
                    target: 'es5',
                    sourceMap: true
                }
            }
        },
        less: {
            compile: {
                files: {
                    'style.css': ['style.less']
                },
                options: {
                    sourceMap: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.registerTask('default', ['typescript:compile', 'less:compile']);
};