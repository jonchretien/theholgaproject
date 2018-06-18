requirejs.config({

  paths: {
    // app
    'filesaver':          'app/filesaver',
    'init':               'app/init',
    'interfacebuilder':   'app/interfacebuilder',

    // vendor
    'requirejs':          'lib/require'
  }

});

// start the main app logic.
require([
  'requirejs',
  'init'
  ], function(requirejs, Initializer) {
  Initializer.init();
});
