module.exports = function(grunt) {

  // Needed modules
  grunt.loadNpmTasks('grunt-recess');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Default file encoding
  grunt.file.defaultEncoding = 'utf8';

  // ==========================================================================
  // TASKS
  // ==========================================================================
  grunt.registerMultiTask('requireToAlmond', 'Replace require.js by almond in html', function() {

    var cheerio = require('cheerio');
    var contents = String(grunt.file.read(this.data.src));
    var $ = cheerio.load(contents);

    if (this.data.removeAll) {
      $('script').remove();
    }

    $('body').append('<script src="'+this.data.appPath+'"></script>');

    // write out newly created file contents
    grunt.file.write(this.data.src, $.html(), 'utf-8');

    grunt.log.ok('Adapt '+this.data.src+' to almond');

  });

  grunt.registerMultiTask('cssToRecess', 'Add compiled css to html, remove others', function() {

    var cheerio = require('cheerio');
    var contents = String(grunt.file.read(this.data.src));
    var $ = cheerio.load(contents);

    if (this.data.removeAll) {
      $('link[rel="stylesheet"]').remove();
    }

    $('head').append('<link rel="stylesheet" href="'+this.data.cssPath+'">');


    // write out newly created file contents
    grunt.file.write(this.data.src, $.html(), 'utf-8');

    grunt.log.ok('Adapt '+this.data.src+' to compiled css');

  });

  // ==========================================================================
  // Project configuration
  // ==========================================================================

  grunt.initConfig({

    // Correct js file path
    requireToAlmond: {
      build: {
        src: 'build/www/index.html',
        appPath: './js/app.js',
        removeAll: true
      }
    },

    // Correct CSS file path
    cssToRecess : {
      build: {
        src: 'build/www/index.html',
        cssPath: './css/main.css',
        removeAll: true
      }
    },


    // Compile CSS
    recess: {
      build: {
        src: [
          "src/www/css/bootstrap.css",
          "src/www/css/main.css",
          "src/www/css/bootstrap-responsive.css"
        ],
        dest: 'build/www/css/main.css',
        options: {
          compile: true,
          compress: true
        }
      }
    },

    // Clean old build files
    clean: {
      build: ['build']
    },

    // Compile JS
    requirejs: {
      build: {
        options: {
          name: '../../../almond',
          include: 'app',
          mainConfigFile: 'src/www/js/app.js',
          baseUrl: "./src/www/js",
          out: 'build/www/js/app.js'
        }
      }
    },

    // Copy the files
    copy: {
      build: {
        files: [
          {
          expand: true,
          cwd: 'src',
          src: ['config.php', 'www/**', '!www/js/**', '!www/css/**', 'php/**'],
          dest: 'build/'
        }
        ]
      },
      dev: {
        files: [
          {
          expand: true,
          cwd: 'src',
          src: ['www/.htaccess'],
          dest: 'build/'
        },
        ]
      }
    }

  });

  // Build for prod
  grunt.registerTask('build', ['clean:build', 'copy:build', 'requirejs:build', 'recess:build', 'cssToRecess:build', 'requireToAlmond:build']);

  // Dev task
  grunt.registerTask('dev', ['copy:dev']);

  // Run build task
  grunt.registerTask('default', ['build']);
};
