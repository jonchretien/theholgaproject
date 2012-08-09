// thanks to dave desandro's grunt file for most of the inspiration below: https://github.com/desandro/v3.desandro.com

var childProcess = require('child_process');
var fs = require('fs');

module.exports = function(grunt) {
  
  var exec = require('child_process').exec;

  // Project configuration
  grunt.initConfig({
    lint: {
      files: [
        'js/base.js',
        'js/interfacebuilder.js',
        'js/filterhandler.js',
        'js/filesaver.js',
        'js/init.js'
      ]
    },
    jshint: {
      options: {
        asi: false,
        curly: true,
        devel: false,
        eqeqeq: true,
        forin: false,
        newcap: true,
        noempty: true,
        strict: true,
        undef: true,
        browser: true
      }
    },
    dirs: {
      dest: '_publish'
    }
  });

  var scriptFiles = [
    'js/base.js',
    'js/interfacebuilder.js',
    'js/filterhandler.js',
    'js/filesaver.js',
    'js/init.js'
  ];

  grunt.registerTask( 'removeSite', function() {
    var done = this.async();
    grunt.utils.spawn({
      cmd: 'rm',
      args: ['-rf', '_publish']
    }, function() {
      done();
    });
  });
  
  grunt.registerTask( 'makeDirectory', function() {
    grunt.file.mkdir('_publish')
  });

  function removeFile( patterns ) {
    var files = grunt.file.expandFiles( patterns );
    files.forEach( function( file ) {
      fs.unlinkSync( file );
    });
  }

  grunt.registerTask( 'buildjs', 'Minifies and concats JS', function( arg1 ) {
    removeFile('js/scripts.min*.js');
    var output = '';
    // timestamp destination js file
    var dest = 'js/scripts.min.' + grunt.template.today('yymmddhhmmss') + '.js';

    scriptFiles.forEach( function( fileSrc, i ) {
      var file = grunt.file.read( fileSrc );
      output  += '// ---- ' + fileSrc + ' ---- //\n\n';
      if ( arg1 === 'full' || fileSrc.indexOf('.min.js') !== -1 ) {
        // concat full file
        output += file;
      } else {
        // concat minified file
        output += grunt.helper( 'uglify', file );
      }
      output += '\n\n';
      grunt.file.write( dest, output );
    });
  });

  grunt.registerTask( 'js', function( arg1 ) {
    grunt.task.run( 'lint buildjs:' + ( arg1 || '') );
  });

  // http://iambot.net/building-a-javascript-project-using-node-dot-js-and-grunt.html
  grunt.registerTask('cssmin', 'Minifies CSS', function() {
    grunt.log.write('Minifying css using yuicompressor \n');
    removeFile('css/screen.min.*.css');
    var cmd = 'java -jar -Xss2048k '
      + '~/Sites/yui/yuicompressor-2.4.7.jar --type css '
      + grunt.template.process('css/screen.css') + ' -o '
      + grunt.template.process('<%=dirs.dest%>/css/screen.min.' + grunt.template.today('yymmddhhmmss') + '.css')
    exec(cmd, function(err, stdout, stderr) {
      if(err) throw err;
    });
  });

  grunt.registerTask( 'scriptsrc', 'Update script sources', function() {
    var script = grunt.file.expandFiles('js/scripts.min*.js')[0];
    var css = grunt.file.expandFiles('<%=dirs.dest%>/css/screen.min*.css')[0];
    var index = grunt.file.expandFiles('<%=dirs.dest%>/index.html')[0];
    var contents = grunt.file.read( index );
    // TODO: come up with a cleaner way to replace script files
    var revised = contents.replace( /css\/screen.css/, css.replace(/_publish/, '') ).replace( /js\/base.js/, script ).replace( /<script src="\js\/interfacebuilder.js"\><\/script>\n/, '' ).replace( /<script src="\js\/filterhandler.js"\><\/script>\n/, '' ).replace( /<script src="\js\/filesaver.js"\><\/script>\n/, '' ).replace( /<script src="\js\/init.js"\><\/script>\n/, '' );
    grunt.file.write( index, revised );
  });

  grunt.registerTask( 'build', 'removeSite makeDirectory js cssmin scriptsrc' );

};