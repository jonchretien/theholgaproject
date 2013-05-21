module.exports = function(grunt) {

  // project configuration.
  grunt.initConfig({
    dirs: {
      dest: '_publish'
    },
    file: 'index.html',
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      minified: ['css/screen.min.*.css'],
      release: ['<%=dirs.dest%>'],
      uglified: ['js/main.min.*.js']
    },
    jshint: {
      files: ['Gruntfile.js', 'js/main.js', 'js/app.js', 'js/ui/*.js'],
      options: {
        globals: {
          asi: true,
          browser: true,
          curly: true,
          define: true,
          eqeqeq: true,
          forin: false,
          immed: false,
          newcap: true,
          noempty: true,
          strict: true,
          undef: true,
          sub: true
        }
      }
    },
    copy: {
      main: {
        files: [
          {
            src: ['.htaccess', 'robots.txt', '<%=file%>', 'css/**', 'js/**'],
            dest: '<%=dirs.dest%>/'
          }
        ]
      }
    },
    cssmin: {
      compress: {
        files: {
          'css/screen.min.<%= grunt.template.today("yymmddhhmmss") %>.css': ['css/screen.css']
        }
      }
    },
    requirejs: {
      compile: {
        options: {
          name: 'main',
          mainConfigFile: 'js/main.js',
          out: 'js/main.min.<%= grunt.template.today("yymmddhhmmss") %>.js'
        }
      }
    }
});

  // load grunt tasks from NPM packages
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  // creates a new directory
  grunt.registerTask('mkdir', grunt.file.mkdir);

  // opens a file and updates the href/src attributes for
  // CSS and JS files to point to the minified versions
  grunt.registerTask( 'update', 'Update file paths.', function(file) {
    var script = grunt.file.expand('js/main.min*.js')[0];
    var css = grunt.file.expand('css/screen.min*.css')[0];
    var index = grunt.file.expand( grunt.config.get('dirs.dest') + '/' + file)[0];
    var contents = grunt.file.read( index );
    var revised = contents.replace( /href\="css\/screen\.css"/, 'href="' + css + '"' ).replace( /data-main\="js\/main" src\="js\/lib\/require\.js"/, 'src="' + script + '"' );
    grunt.file.write( index, revised );
  });

  // default task(s).
  grunt.registerTask('build', [
    'clean',
    'cssmin',
    'jshint',
    'requirejs',
    'mkdir:' + grunt.config.get('dirs.dest'),
    'copy',
    'update:' + grunt.config.get('file')
  ]);

};
