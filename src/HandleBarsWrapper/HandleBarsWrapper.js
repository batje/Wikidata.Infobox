"use strict"
// Importing Handlebars does not work (yet). Because we compile templates dynamically, we need to
// include handlebars.js (not handlebars.runtime.js) which gives dependency issues with  source-map-consumer.js  source-map-generator.js  source-node.js. (besides that, like jquery, websites might want to include handlebars in the html anyways)
//import Handlebars from "../../bower_components/handlebars/handlebars.amd.js";
import * as promisedHandlebars from '../../node_modules/promised-handlebars/index.js';
import JavaScriptFetcher from './JavaScriptFetcher.js';
import TemplateFetcher from './TemplateFetcher.js';
import baseTypeTemplate from './baseTypeTemplate.js';
import dynamicPropertyTemplate from './dynamicPropertyTemplate.js';
import Labels from '../utilclasses/Labels.js';
//import he from '../../bower_components/he/he.js';
//import {
//  encode, decode
//}
//from '../../node_modules/uuencode/indexes6.js';

var instance;

/** class Static Class used to load additional HandleBars templates and Javascript and
 * allows Handlebar templates to be used as Promises.
 * @todo This class is only available as Static, which is good for loading things. I need to split off an async rendering Handlebars object so multiple popups can be activated at the same time.
 */
class HandleBarsWrapperClass {
  constructor(config) {
      this.postProcessFunctions = [];
      this.modules = [];
      //  this.he = he;
      this.config = config;

      this.PromisedHandlebars = promisedHandlebars.default(Handlebars);
      if (typeof this.PromisedHandlebars.partials === 'undefined') {
        this.PromisedHandlebars.partials = [];
      }
      if (typeof this.PromisedHandlebars.templates === 'undefined') {
        this.PromisedHandlebars.templates = [];
      }

      this.TemplateFetcher = TemplateFetcher.TemplateFetcher(this.PromisedHandlebars);
      this.JavaScriptFetcher = JavaScriptFetcher.JavaScriptFetcher();
      this.Labels = Labels.Labels(this, config);
      // The fallback template;
      this.getTemplate('defaultText');
      //      var promisedHandlebars = require('promised-handlebars')
      //      var Q = require('q')
      //      var a = new Promise();
      var me = this;

      this.PromisedHandlebars.registerHelper('debug', this.debug);
      this.PromisedHandlebars.registerHelper('safestring', this.safestring);
      this.PromisedHandlebars.registerHelper('encodeURIComponent', this.encodeURIComponent);
      this.PromisedHandlebars.registerHelper('stripHTML', this.stripHTML);
      //    this.PromisedHandlebars.registerHelper('encode', this.encode);
      //    this.PromisedHandlebars.registerHelper('escape', this.escape);
      //    this.PromisedHandlebars.registerHelper('decode', this.decode);

      this.PromisedHandlebars.registerHelper('dynamicPropertyTemplate', dynamicPropertyTemplate.dynamicPropertyTemplate);
      this.PromisedHandlebars.registerHelper('baseTypeTemplate', baseTypeTemplate.baseTypeTemplate);
      //this.PromisedHandlebars.registerHelper('wikibasetemplate', this.wikibasetemplate);
      this.PromisedHandlebars.registerHelper('labeltemplate', this.labeltemplate);

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

  /**
   * @function safestring HandleBars helper that marks a value as a safestring
   * @param text Text
   * @returns safe text
   * @see http://handlebarsjs.com/#html-escaping
   */
  safestring(text) {
    try {
      return new Handlebars.SafeString(text);
    } catch (e) {
      console.error("Error while safestringing " + text, e);
      return text;
    }
  }

  /**
   * @function encodeURIComponent helper to encode part of a URI, for example ImageAPI filenames as parameters
   * @param text Text that should be part of a URL
   * @returns encoded text
   * @see https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
   */
  encodeURIComponent(text) {
    try {
      //      var uencode = require('../../node_modules/uuencode/uuencode.js');
      return encodeURIComponent(text);
    } catch (e) {
      console.error("Error while uuencoding " + text, e);
      return text;
    }
  }

  /**
   * @function escape HandleBars helper that escapes text that needs escaping like HTML
   * @param text Text
   * @returns escaped text
   * @see http://handlebarsjs.com/#html-escaping
   */
  escape(text) {
    return Handlebars.Utils.escapeExpression(text);
  }

  /**
   * @function encode helper that encodes html (such as html returned by imageAPI)
   * @param text Text
   * @returns encoded text
   * @see https://github.com/mathiasbynens/he
   */
  encode(text) {
    try {
      return he.encode(text);
    } catch (e) {
      console.error("Error while encoding " + text, e);
      return text;
    }
  }

  /**
   * @function decode helper that decodes encoded html (such as html returned by imageAPI)
   * @param text Text
   * @returns decoded text
   * @see https://github.com/mathiasbynens/he
   */
  /*  decode(text) {
      try {
        console.log('decode', he.decode(text));

        return he.decode(text);
      } catch (e) {
        console.error("Error while decoding " + text, e);
        return text;
      }
    }
  */
  /**
   * @function striHTML helper that removes html tags from text. ImageAPI for example returns HTML where you would expect plain text
   * @param html HTML Text
   * @returns plain text
   */
  stripHTML(html) {
    try {
      console.log('stripHTML', $("<p>").html(html).text());

      return $("<p>").html(html).text();
    } catch (e) {
      console.error("Error while decoding " + html, e);
      return html;
    }
  }

  /*
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
  */

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
          functionname(element);
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

function HandleBarsWrapper(config) {
  if (typeof instance === 'undefined') {
    instance = new HandleBarsWrapperClass(config);
  }
  return instance;
}

export default {
  HandleBarsWrapper
};
