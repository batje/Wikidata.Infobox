import JavaScriptFetcher from '../HandleBarsWrapper/JavaScriptFetcher.js';

"use strict"

/**
 * Class TemplateBaseClass
 * Base class that properties or baseType classes Implement
 *
 *
 */
class TemplateBaseClass {
  constructor() {
    console.log("TemplateBaseClass constructor");
    this.utilclasses = [];
  }

  /** @function load
   * @param handlebars an instance of @class HandleBarsWrapper
   * @returns Promise which promises the class is ready for usage
   * This function is also responsible for loading any Handlebar helpers that the template might need
   */
  load(handlebars, utilclass = false, variant = false) {
    this.handlebars = handlebars;
    var me = this;
    console.log("Loading TemplateBaseClass");

    if (utilclass) {
      this.JavaScriptFetcher = JavaScriptFetcher.JavaScriptFetcher();

      var classname = variant ? utilclass + variant : utilclass;
      utilclass = variant ? utilclass + "_" + variant : utilclass;

      /*      return System.import('../src/utilclasses/' + utilclass + '.js' + '?bust=' + (new Date()).getTime())
              .then(the_module => {
                console.log("UtilClass Loaded " + classname, the_module);
                var property = the_module.default[classname]();
                me[utilclass] = property;
                return property.load(handlebars);
              });
      */
      //return new Promise(function(resolve, fail) {

      return me.JavaScriptFetcher.fetchJavaScript(classname, handlebars);
      //        .then(function(jsObject) {
      //            console.log("Loaded Javascript for " + name, jsObject);
    }
    return Promise.resolve();
  }

  postProcess() {
    console.log("Postprocessing TemplateBaseClass");
  }

}

export default {
  TemplateBaseClass
};
