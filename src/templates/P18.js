"use strict"
import TemplateBaseClass from '../utilclasses/TemplateBaseClass.js';

var instance;
/**
 *  Class that renders P18 image property
 *  {@link https://www.wikidata.org/wiki/Property:P18}
 * @extends TemplateBaseClass
 */
class P18Class extends TemplateBaseClass.TemplateBaseClass {
  constructor() {
    super();
    console.log("loading P18");
  }

  load(handlebars, utilclass = "ImageGallery", variant = "Blueimp") {
    return super.load(handlebars, utilclass, variant);
  }

  postProcess() {
    $('#P18').click(function(event) {
      event = event || window.event;
      var target = event.target || event.srcElement,
        link = target.src ? target.parentNode : target,
        options = {
          index: link,
          event: event
        },
        links = this.getElementsByTagName('a');
      blueimp.Gallery(links, options);
    });
  };
}

function P18() {
  if (typeof instance === 'undefined') {
    instance = new P18Class();
  }
  return instance;
}

export default {
  P18
};
