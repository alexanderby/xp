module.exports = function (grunt) {
	grunt.initConfig({
		typescript: {
			compile: {
				src: 'app.ts',
				options: {
					target: 'es5',
					experimentalDecorators: true
				}
			}
		},
		less: {
			compile: {
				files: {
					'style.css': ['style.less']
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-typescript');
	grunt.loadNpmTasks('grunt-contrib-less');

	grunt.registerTask('default', ['typescript:compile', 'less:compile']);
};