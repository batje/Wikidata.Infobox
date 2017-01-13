"use strict"
//import System from '../../bower_components/es6-module-loader/dist/es6-module-loader-dev.js'
// This blows our library up from 300k to 1.5M. So let's include traceur in html for now
// and see how we can precompile our modules later
//import traceur from '../../bower_components/traceur/traceur.js'
var instance;


/**
 * Class JavaScriptFetcherClass
 */
class JavaScriptFetcherClass {
  constructor() {
    this.modules = [];
    console.log("Fetcher Created");
  }

  fetchJavaScript(key, handlebars) {
    var me = this;
    return new Promise(function(resolve, reject) {
      if ((me.modules[key] !== false) && (typeof me.modules[key] == 'undefined')) {
        try {
          console.log("Going to load Javascript for " + key);
          me.modules[key] =
            System.import('../src/templates/' + key + '.js' + '?bust=' + (new Date()).getTime())
            .then(the_module => {
              console.log("Loaded Javascript for  " + key, handlebars);
              var cleankey = key.replace('-', '');
              console.log("Loaded Javascript for clean key  " + cleankey);
              var property = the_module.default[cleankey]();
              property.load(handlebars).then(function() {
                  console.log("Loaded Object " + key);
                  me.modules[key] = property;
                  // Return the Object for postpocessing
                  resolve(property);
                })
                .catch(err => {
                  console.error("Error loading load function for " + key, err);
                });
            })
            .catch(err => {
              // If not 404, log the error
              if (!(err.message.indexOf("404 Not Found") > 0)) {
                console.error("Error loading javascript for " + key, err);
              }
              me.modules[key] = false;
              // We are in catch, but we really dont care if there was an error.
              reject();
            });
        } catch (e) {
          console.error("Error loading Javascript for " + key, e);
          reject();
        }
      } else {
        if ((typeof me.modules[key] !== 'undefined') && (me.modules[key] !== false)) {
          //        console.error("Returning Promise on Javascript that is still loading ", me.modules[key]);
          Promise.resolve(me.modules[key]).then(function(property) {
            resolve(property);
          });
        } else {
          reject();
        }
      }
    });
  }
}

function JavaScriptFetcher() {
  if (typeof instance === 'undefined') {
    instance = new JavaScriptFetcherClass();
  }
  return instance;
}

export default {
  JavaScriptFetcher
};
