/* global module:false */
module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib');
    grunt.loadNpmTasks('grunt-requirejs');
    grunt.loadNpmTasks('grunt-recess');

    // ==========================================================================
    // TASKS
    // ==========================================================================
    grunt.registerMultiTask('requireToAlmond', 'Replace require.js by almond in html', function() {
        // this.target === the name of the target
        // this.data === the target's value in the config object
        // this.name === the task name
        // this.args === an array of args specified after the target on the command-line
        // this.flags === a map of flags specified after the target on the command-line
        // this.file === file-specific .src and .dest properties

        var cheerio = require('cheerio');
        var contents = String(grunt.file.read(this.file.src, 'utf-8'));
        var $ = cheerio.load(contents);

        if (this.data.removeAll) {
            $('script').remove();
        }

        $('body').append('<script src="'+this.data.appPath+'"></script>');


        // write out newly created file contents
        grunt.file.write(this.file.src, $.html(), 'utf-8');

        grunt.log.ok('Adapt '+this.file.src+' to almond');

    });

    grunt.registerMultiTask('cssToRecess', 'Add compiled css to html remove others', function() {
        // this.target === the name of the target
        // this.data === the target's value in the config object
        // this.name === the task name
        // this.args === an array of args specified after the target on the command-line
        // this.flags === a map of flags specified after the target on the command-line
        // this.file === file-specific .src and .dest properties

        var cheerio = require('cheerio');
        var contents = String(grunt.file.read(this.file.src, 'utf-8'));
        var $ = cheerio.load(contents);

        if (this.data.removeAll) {
            $('link[rel="stylesheet"]').remove();
        }

        $('head').append('<link rel="stylesheet" href="'+this.data.cssPath+'">');


        // write out newly created file contents
        grunt.file.write(this.file.src, $.html(), 'utf-8');

        grunt.log.ok('Adapt '+this.file.src+' to compiled css');

    });

    // ==========================================================================
    // Project configuration
    // ==========================================================================

    grunt.initConfig({

        requireToAlmond: {
            build: {
                src: 'build/www/index.html',
                appPath: './js/app.js',
                removeAll: true,
            },
        },

        cssToRecess : {
            build: {
                src: 'build/www/index.html',
                cssPath: './css/main.css',
                removeAll: true,
            },
        },


        //CSS
        recess: {
            build: {
                src: [
                    "src/www/css/main.css",
                    "src/www/css/bootstrap-responsive.css",
                    "src/www/css/bootstrap.css",
                ],
                dest: 'build/www/css/main.css',
                options: {
                    compile: true,
                    compress: true
                }
            }
        },

        clean: {
            build: ['build'],
        },

        requirejs: {
            name: '../../../almond',
            include: 'app',
            mainConfigFile: 'src/www/js/app.js',
            baseUrl: "./src/www/js",
            out: 'build/www/js/app.js',
        },

        copy: {
          build: {
            files: {
              "build/php": "src/php/**",
              "build/": "src/config.php-dist",
              "build/script": "src/script/*",
              "build/www": "src/www/*",
              "build/www/img": "src/www/img/**",
              "build/www/media": "src/www/media/**",
              "build/www/": "src/www/.htaccess",
            }
          },
          dev: {
              files: {
                  "build": ["src/config.php","src/test.db"]
              }
          }
        }

    });

    // build task
    grunt.registerTask('build', 'clean:build copy:build requirejs recess:build cssToRecess:build requireToAlmond:build');

    // devbuild task
    grunt.registerTask('devbuild', 'build copy:dev');

    // default build task
    grunt.registerTask('default', 'build');

};
