/**
 * Copyright (c) 2016, Reinier Battenberg
 * All rights reserved.
 *
 * Source code can be found at:
 * https://github.com/batje/Wikidata.Infobox
 *
 * @license GPL 3.0
 */

"use strict"
import * as promisedHandlebars from '../../node_modules/promised-handlebars/index.js';
import JavaScriptFetcher from './JavaScriptFetcher.js';
import TemplateFetcher from './TemplateFetcher.js';
import baseTypeTemplate from './baseTypeTemplate.js';
import dynamicPropertyTemplate from './dynamicPropertyTemplate.js';

var instantiated = false;
var instance;

/** @class Static Class used to load additional HandleBars templates and Javascript and
 * allows Handlebar templates to be used as Promises.
 * @todo This class is only available as Static, which is good for loading things. I need to split off an async rendering Handlebars object so multiple popups can be activated at the same time.
 */
class HandleBarsWrapperClass {
  constructor() {
      this.postProcessFunctions = [];
      this.modules = [];
      this.PromisedHandlebars = promisedHandlebars.default(Handlebars);
      if (typeof this.PromisedHandlebars.partials === 'undefined') {
        this.PromisedHandlebars.partials = [];
      }
      if (typeof this.PromisedHandlebars.templates === 'undefined') {
        this.PromisedHandlebars.templates = [];
      }

      this.TemplateFetcher = TemplateFetcher.TemplateFetcher(this.PromisedHandlebars);
      this.JavaScriptFetcher = JavaScriptFetcher.JavaScriptFetcher();
      // The fallback template;
      this.getTemplate('defaultText');
      //      var promisedHandlebars = require('promised-handlebars')
      //      var Q = require('q')
      //      var a = new Promise();
      var me = this;

      this.PromisedHandlebars.registerHelper('debug', this.debug);
      this.PromisedHandlebars.registerHelper('dynamicPropertyTemplate', dynamicPropertyTemplate.dynamicPropertyTemplate);
      this.PromisedHandlebars.registerHelper('baseTypeTemplate', baseTypeTemplate.baseTypeTemplate);

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
    //  console.log("looking for " + key);

    function isNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }
    if (isNumber(key)) {
      key = "Q" + key;
      //me.modules[key] = false; // Dont use a template per statement we probably want to find the datatype here
      //  key = "wikibase-item";
    }
  }

  registerHelper(name, helperfunction) {
    this.PromisedHandlebars.registerHelper(name, helperfunction);
  }
  compile(template) {
    return this.PromisedHandlebars.compile(template);
  }
  postProcess(element) {
      console.log("postprocessing");
      var element = $(element);
      this.postProcessFunctions.forEach(function(functionname) {
        try {
          functionname();
        } catch (e) {
          console.error("Error in Postprocessing function ", functionname.toString());
        }
      });
    }
    /** Load a handlebars template and options javascript. Makes sure
     * to only load each template once.
     *
     * @param name The name of the template (without extention)
     * @param loadjs Should the function try to load a Javascript file too. defaults to false
     *
     * @returns A Promise that returns a compiled Handlebars template
     */
  getTemplate(name, loadjs, loadcss) {
    var me = this;
    if (loadjs) {
      return new Promise(function(resolve, fail) {
        me.JavaScriptFetcher.fetchJavaScript(name, me)
          .then(function(jsObject) {
            console.log("Loaded Javascript for " + name, jsObject);
            // we only run these events the first time (when jsObject is set)
            // the second run of this promise the object is undefined
            if (typeof jsObject !== 'undefined') {
              if (typeof jsObject.postProcess === 'function') {
                console.log("Registring PostProcess Function for " + name);
                me.postProcessFunctions.push(jsObject.postProcess);
              }
              if (typeof jsObject.registerHelpers === 'function') {
                console.log("Registring Helpers for " + name);
                jsObject.registerHelpers(me.PromisedHandlebars)
              }
            }
            //          console.log('Returning promise for ' + name);
            var myPromise = me.TemplateFetcher.getTemplate(name, me.PromisedHandlebars, loadcss);
            resolve(myPromise);
          })
          .catch(function(err) {
            //          console.log('Returning promise (failed javascript) for ' + name, err);
            var myPromise = me.TemplateFetcher.getTemplate(name, me.PromisedHandlebars, loadcss);
            resolve(myPromise);
          });
      });
    } else {
      var result = me.TemplateFetcher.getTemplate(name, me.PromisedHandlebars, loadcss);
      //      console.log('returning only promise for ' + name, result);
      return result;
    }
  }
}

function HandleBarsWrapper() {
  if (typeof instance === 'undefined') {
    instance = new HandleBarsWrapperClass();
  }
  return instance;
}

export default {
  HandleBarsWrapper
};
