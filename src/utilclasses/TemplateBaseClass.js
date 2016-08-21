/**
 * Copyright (c) 2016, Reinier Battenberg
 * All rights reserved.
 *
 * Source code can be found at:
 * https://github.com/batje/Wikidata.Infobox
 *
 * @license GPL 3.0
 * @module Util Classes
 */
"use strict"

/**
 * @class TemplateBaseClass
 * Base class that properties or baseType classes Implement
 *
 *
 */
class TemplateBaseClass {
  constructor() {
    console.log("TemplateBaseClass constructor");
  }

  /** @function load
   * @param handlebars an instance of @class HandleBarsWrapper
   * @returns Promise which promises the class is ready for usage
   * This function is also responsible for loading any Handlebar helpers that the template might need
   */
  load(handlebars) {
    this.handlebars = handlebars;
    console.log("Loading TemplateBaseClass");
    return Promise.resolve();
  }

  postProcess() {
    console.log("Postprocessing TemplateBaseClass");
  }

  registerHelpers() {
    console.log("Registring Helper TemplateBaseClass");
  }
}

export default {
  TemplateBaseClass
};
