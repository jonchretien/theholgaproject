#!/bin/bash

# minifies screen.css and app.js
# requires yui, nodejs, & uglifyjs

# minify css with YUI
java -jar ../YUI/yuicompressor.jar css/screen.css -o css/screen.min.css

# minify js with Uglify JS
IN=js/app.js
OUT=js/app.min.js
uglifyjs --no-copyright -o js/app.min.js js/app.js
echo "Minified" $IN "as" $OUT