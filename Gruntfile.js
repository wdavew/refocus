module.exports = function(grunt) {
	grunt.initConfig( {
		concat: {
			release: {
				src: ['js/delay.js', 'js/background.js'],
				dest: 'release/main.js'
			}
		},

		jasmine: {
			test: {
				src: ['js/background.js', 'js/delay.js'],
				options: {
					specs: 'test/*.js'
				}
			}
		},
		copy: {
			main: {
				files: [
					{ src: 'manifest.json', dest: 'release/manifest.json' },
					{ src: 'js/background.js', dest: 'release/background.js' },
					{ src: 'js/delay.js', dest: 'release/delay.js'}
				]
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			files: ['release/background.js', 'release/delay.js']
		},
		watch: {
			files: ['js/*.js', 'manifest.json'],
			tasks: ['default']
		},
		jsdoc: {
			dist: {
				src: ['js/*.js'],
				dest: 'doc'
			}
		}
	});

	//load plugins
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-jsdoc');
	//register tasks
	grunt.registerTask('default', ['jasmine', 'copy', 'jshint', 'jsdoc']);
};
