"use strict"

var instantiated = false;
var instance;

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
              var property = the_module.default[key]();
              property.load(handlebars).then(function() {
                console.log("Loaded Object " + key);
                me.modules[key] = property;
                // Return the Object for postpocessing
                resolve(property);
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
