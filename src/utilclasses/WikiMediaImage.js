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
var instance;

/* @class
 * Class renders Wikimedia Images including all their metadata
 * Am still not exactly sure if and how to make this extending @class TemplateBaseClass
 * For now it is on its own.
 */
class WikiMediaImageClass {
  constructor(handlebars) {
    this.handlebars = handlebars;
    this.css = [];
  }

  /** @function render
   * @param filename Name of the Image file from Commons to render. Without preceding 'Image:' or 'File:'
   * @param template Handlebars template to use, defaults to 'Image'
   * @param gallery Optional name of gallery to add to the image html in the template
   * @returns Promise that resolves to the HTML for the image
   */
  render(filename, template = 'Image', gallery = false) {
      console.log("This Image Handlebars", this.handlebars);
      var me = this;
      //      console.log("Image Handlebars", me.handlebars);
      var image;
      return new Promise(function(resolve, reject) {
        var url =
          `https://commons.wikimedia.org/w/api.php?action=query&titles=Image:${filename}&prop=imageinfo&iiprop=extmetadata&format=json`;
        console.log("Going to load image metadata from url ", url);
        try {
          $.ajax({
              url: url,
              dataType: "jsonp"
            })
            .done(function(data) {
              console.log("loaded image", data);
              try {
                image = data.query.pages[Object.keys(data.query.pages)[0]].imageinfo[0];
                image.filename = filename;
                if (gallery) {
                  image.gallery = gallery;
                }
              } catch (e) {
                console.log("Error in array", e);
              }
              console.log("Going to fetch template", template);
              me.handlebars.getTemplate(template, false, true)
                .then(function(hbtemplate) {
                  Promise.resolve(hbtemplate(image))
                    .then(function(html) {
                      console.log("Compiled result " + html);
                      resolve(html);
                    })
                    .catch(function(e) {
                      console.error("Can not generate image html", e);
                    })
                })
                .catch(function(e) {
                  console.error("Can not find Image template");
                });
            })
            .catch(function(e) {
              error.error("error fetching metadata for image " + filename, e);
            });
        } catch (e) {
          console.log("error fetching metadata", e);
        }
      })
    }
    /*  postProcess() {
        $('.links').click(function(event) {
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
      };*/
}

function WikiMediaImage(handlebars) {
  if (typeof instance === 'undefined') {
    instance = new WikiMediaImageClass(handlebars);
  }
  return instance;
}


export default {
  WikiMediaImage
};
