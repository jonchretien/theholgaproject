requirejs.config({

  paths: {
    // app
    'app':        'app',

    // ui
    'buttons':    'ui/buttons',
    'canvas':     'ui/canvas',
    'heading':    'ui/heading',

    // vendor
    'requirejs':  'lib/require'
  }

});

// start the main app logic.
require(['requirejs', 'app'], function(requirejs, App) {
  App.init();
});
