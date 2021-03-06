#!/usr/bin/env node

// module dependencies
const fs = require('fs');

// assign variables.
const DIST_PATH = 'dist';
const timestamp = Date.now();
const minifiedCSS = `bundle.min.${timestamp}.css`;
const minifiedJS = `bundle.min.${timestamp}.js`;
const original = `${DIST_PATH}/index.html`;

let page = null;
let revised = null;

// rename static files
fs.renameSync(
  `${DIST_PATH}/css/bundle.min.css`,
  `${DIST_PATH}/css/${minifiedCSS}`
);
fs.renameSync(`${DIST_PATH}/js/bundle.min.js`, `${DIST_PATH}/js/${minifiedJS}`);

// read file contents and update file paths
page = fs.readFileSync(original, 'utf8');
revised = page
  .replace('\/css\/bundle.css', `/css/${minifiedCSS}`)
  .replace('\/js\/bundle.js', `/js/${minifiedJS}`);

// write new contents to file
fs.writeFileSync(original, revised);
