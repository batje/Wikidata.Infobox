import babel from 'rollup-plugin-babel';
import sourcemaps from 'rollup-plugin-sourcemaps';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import bowerResolve from 'rollup-plugin-bower-resolve';
import string from 'rollup-plugin-string';
import filesize from 'rollup-plugin-filesize';
import inject from 'rollup-plugin-inject';

export default {
  banner: `/**
   * Copyright (c) 2016, Reinier Battenberg
   * All rights reserved.
   *
   * Source code can be found at:
   * https://github.com/batje/Wikidata.Infobox
   *
   * @license GPL 3.0
   */
`,
  footer: "/* You really read all code until the end? Thank you! */",
  entry: 'src/index.js',
  format: 'umd',
  sourceMap: true,
  plugins: [
    inject({
      // control which files this plugin applies to
      // with include/exclude
      include: [
        'src/**',
      ],
      exclude: 'node_modules/**',
      modules: {
        $: 'jquery',
        //    Promise: [ 'es6-promise', 'Promise' ],
      }
    }),
    babel({
      exclude: [
        "node_modules/**",
        "bower_components/**",
      ],
      include: [],
      presets: ["es2015-rollup"],
      runtimeHelpers: true,
      babelrc: false
        // plugins appears to be ignored. use .babelrc
    }),
    nodeResolve({
      extensions: ['.js'],
      jsnext: true,
      main: true,
      browser: true,
      preferBuiltins: false
    }),
    bowerResolve({
      // if there's something your bundle requires that you DON'T
      // want to include, add it to 'skip'
      skip: [
        //        'bower_components/wikidata-sdk/build/*',
      ], // Default: []

      // Override path to main file (relative to the module directory).
      override: {
        //  lodash: 'dist/lodash.js'
      }
    }),
    commonjs({
      // non-CommonJS modules will be ignored, but you can also
      // specifically include/exclude files
      include: [
        'bower_components/js-yaml/dist/js-yaml.js',
        'bower_components/wikidata-sdk/dist/wikidata-sdk.js',
        'node_modules/jquery/dist/jquery.js',
        //'bower_components/he/he.js',
        //        'bower_components/handlebars/handlebars.amd.js',
        //      'node_modules/q/q.js',
        //        'bower_components/handlebars/node_modules/source-map/lib/source-map/*',
        //        'bower_components/handlebars/node_modules/source-map/lib/source-map/source-map-consumer',
        //        'bower_components/handlebars/node_modules/source-map/lib/source-map/source-node',


        //        'node_modules/promised-handlebars/index.js',
        //        'node_modules/buffer/index.js',
        //        'node_modules/deep-aplus/index.js',
        'node_modules/lodash-es/isArray.js',
        //        'bower_components/spin.js/jquery.spin.js',
        //        'bower_components/spin.js/spin.js',
        // The following module makes rollup complain about fs not being available. But fs is not necessary
        // for our project so we are cool.
        //    'bower_components/es6-module-loader/dist/es6-module-loader-dev.js'
      ], // Default: undefined
      exclude: [
        //        'bower_components/wikidata-sdk/build/*',
        //,
        //    'node_modules/handlebars/node_modules/source-map/lib/source-map/source-map-generator',
        //    'node_modules/handlebars/node_modules/source-map/lib/source-map/source-map-consumer',
        //    'node_modules/handlebars/node_modules/source-map/lib/source-map/source-node',
      ], // Default: undefined

      // search for files other than .js files (must already
      // be transpiled by a previous plugin!)
      //      extensions: ['.js', '.coffee'], // Default: [ '.js' ]

      // if true then uses of `global` won't be dealt with by this plugin
      ignoreGlobal: false, // Default: false

      // if false then skip sourceMap generation for CommonJS modules
      sourceMap: true, // Default: true

      // explicitly specify unresolvable named exports
      // (see below for more details)
      namedExports: {
        //      'node_modules/handlebars/dist/handlebars.min.js': ['handlebars']
      }
    }),
    sourcemaps(),
    /*    string({

          include: '../templates/**\/*.hbs',


          exclude: ['**\/index.html']
        }),
        */
    filesize()
  ],
  dest: 'dist/Wikidata.Infobox.js',
  moduleName: 'Wikidata'
};
