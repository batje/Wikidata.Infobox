/**
 * Copyright (c) 2016, Reinier Battenberg
 * All rights reserved.
 *
 * Source code can be found at:
 * https://github.com/batje/Wikidata.Infobox
 *
 * @license GPL 3.0
 * @module WikidataHelpers
 */
"use strict"
import TemplateBaseClass from '../utilclasses/TemplateBaseClass.js';
import ImageGallery from '../utilclasses/ImageGallery.js'
var instantiated = false;
var instance;
/* @class that renders images
 *
 */
class P18Class extends TemplateBaseClass.TemplateBaseClass {
    constructor() {
      super();
      // Loading static Gallery which loads the necessary javascript only once
      this.ImageGallery = ImageGallery.ImageGallery();
      console.log("loading P18");
    }

    load(value) {
      return this.ImageGallery.load(value);
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
    /**
     * TODO
     * Implement the Image API
     * https://www.mediawiki.org/wiki/API:Imageinfo
     * eg:
     * https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=extmetadata&titles=File%3aBrad_Pitt_at_Incirlik2.jpg&format=json (for Brad Pitt)
     */
  }
  //var P18 = new P18Class();

function P18() {
  if (typeof instance === 'undefined') {
    instance = new P18Class();
  }
  return instance;
}

export default {
  P18
};
