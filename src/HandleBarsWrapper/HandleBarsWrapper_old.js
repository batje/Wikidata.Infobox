"use strict"
import * as promisedHandlebars from '../node_modules/promised-handlebars/index.js';
//import P18 from './templates/helpers/P18';
/*
Dynamic Loading
more her: http://exploringjs.com/es6/ch_modules.html
const moduleSpecifier = 'module_' + Math.random();
System.import(moduleSpecifier)
.then(the_module => {
    // Use the_module
})
*/

/** Class HandleBarsWrapper */
class HandleBarsWrapper {

  /**
   * Creates HandleBarsWrapper
   *
   * @return {HandleBarsWrapper}     HandleBarsWrapper instance
   */
  constructor() {
      this.postProcessFunctions = [];
      this.modules = [];

      //      var promisedHandlebars = require('promised-handlebars')
      //      var Q = require('q')
      //      var a = new Promise();
      this.PromisedHandlebars = promisedHandlebars.default(Handlebars);
      if (typeof this.PromisedHandlebars.partials === 'undefined') {
        this.PromisedHandlebars.partials = [];
      }
      var me = this;

      this.PromisedHandlebars.registerHelper('debug', this.debug);
      this.PromisedHandlebars.registerHelper('dynamictemplate', this.dynamictemplate);
      this.PromisedHandlebars.registerHelper('wikibasetemplate', this.wikibasetemplate);

      // This is so we can compile all partials + templates into 1 file
      if (typeof me.PromisedHandlebars.templates !== "undefined") {
        me.PromisedHandlebars.partials = me.PromisedHandlebars.templates;
      } else {
        // Or maybe not
        me.PromisedHandlebars.templates = {};
      }
    }
    //  get postProcessFunctions {
    //    return this.postProcessFunctions
    //  }
  debug(context, options) {
    console.log(
      'This : ', this);
    console.log(
      'Context : ', context
      //      'Variables referenced in this template: ',                     context.vars,
      //      'Partials/templates that this file directly depends on: ',     context.deps,
      //      'Helpers that this template directly depends on: ',            context.helpers,
      //      'The metadata object at the top of the file (if it exists): ', context.meta
    );
  }

  wikibasetemplate(key, template, context, opts) {
    console.log("looking for " + key);
  }

  dynamictemplate(key, template, context, opts) {
    //    console.log(key);
    var me = this;

    function isNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }
    if (isNumber(key)) {
      key = "Q" + key;
      me.modules[key] = false; // Dont use a template per statement we probably want to find the datatype here
      //  key = "wikibase-item";
    }
    return new Promise(function(resolve, fail) {
      me.fetchJavaScript(key).then(function() {
        var templatepromise = me.getTemplate(key)
          .then(function(hbtemplate) {
            //                console.log("Template:" + template, hbtemplate);
            //resolve(me.PromisedHandlebars.SafeString(hbtemplate(context)));
            var result = hbtemplate(context);
            resolve(new Handlebars.SafeString(result));
          })
          .catch(function(fail) {
            //            console.log("did not find template");
            if (typeof template === 'undefined') {
              template = "defaultText";
            }
            me.getTemplate(template)
              .then(function(hbtemplate2) {
                //                    console.log("Template2:" + template, hbtemplate2);
                // resolve(me.PromisedHandlebars.SafeString(hbtemplate2(context)));
                try {
                  var result = hbtemplate2(context);
                } catch (e) {
                  resolve("There was an error processing this template");
                }
                resolve(new Handlebars.SafeString("<td>default text</td>"));
                //                    resolve(hbtemplate2(context));
              })
              /*                  .catch(function(fail) {
                                  me.getTemplate("defaultText")
                                    .then(function(hbtemplate) {
                                      console.log("Template3:" + template);
                                      resolve(me.PromisedHandlebars.SafeString(hbtemplate(context)));
                                    })
                                });*/
          });
      });
    });
    console.log("what am i doing here?");
    return;

    //      me.postProcessFunctions.push(property.postProcess)
    /*        var f = me.PromisedHandlebars.partials[key];
            try {
              template.replace(/\//g, '_');
            } catch (e) {
              alert("nee" + opts);
            }
            console.log(opts);
            if (!f) {
              template = template.replace(/\//g, '_');
              var f = me.PromisedHandlebars.partials[template];
              if (!f) {
                return me.PromisedHandlebars.partials['defaultText'];
              }
            } else {

            }
            console.log("Template:" + template);
            return new me.PromisedHandlebars.SafeString(f(context));*/
  }


  fetchJavaScript(key) {
    return new Promise(function(resolve, fail) {
      if ((me.modules[key] !== false) && (typeof me.modules[key] == 'undefined')) {
        me.modules[key] = 'pending';
        System.import('../src/templates/helpers/' + key + '.js')
          .then(the_module => {
            console.error("Loaded Javascript for  " + key);
            var property = the_module.default.P18();
            property.load().then(function() {
              console.error("Bingo, Loaded Object " + key);
              me.modules[key] = property;
              me.postProcessFunctions.push(property.postProcess);
              resolve();
            });
          })
          .catch(err => {
            me.modules[key] = false;
            resolve();
          });
      } else {
        resolve();
      }
    });
  }



  addPartial(name) {

  }
  postProcess(element) {
    var element = $(element);
    this.postProcessFunctions.forEach(function(functionname) {
      console.log("postprocessing");

      functionname();
    });
  }
  getTemplate(name) {
    var me = this;
    //return Promise(function() {
    if (this.PromisedHandlebars.templates === undefined || this.PromisedHandlebars.templates[name] ===
      undefined) {
      //      if (me.PromisedHandlebars.templates === undefined) {
      //        me.PromisedHandlebars.templates = {};
      //      }
      //me.PromisedHandlebars.templates[name] = 'pending';
      return new Promise(function(resolve, reject) {
        $.ajax('templates/' + name + '.hbs')
          .done(function(data) {
            me.PromisedHandlebars.templates[name] = me.PromisedHandlebars.compile(data);
            //            console.log("Compiled template");
            resolve(me.PromisedHandlebars.templates[name]);
          })
          .catch(function(e) {
            resolve(me.PromisedHandlebars.templates['defaultText']);
          });
        //        console.log("Return Promise");
      });
    } else {
      return new Promise(me.PromisedHandlebars.templates[name]);
    }
    //};
  };
}

export default {
  HandleBarsWrapper
};
