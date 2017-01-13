"use strict"

var instance;
/**
 * Class BlueImp Gallery class that loads all things necessary for a BlueImp gallery
 *
 */
class ImageGalleryBlueimpClass {
  constructor() {
    console.log("loading blueimp javascript");
    $.getScript(
      "../bower_components/blueimp-gallery/js/blueimp-gallery.js");

    // <!-- this only should happen once -->
    // <!-- The Gallery as lightbox dialog, should be a child element of the document body -->

    $('body').append(
      '<div id="blueimp-gallery" class="blueimp-gallery blueimp-gallery-controls" ><div class="slides" ></div><h3 class="title"></h3><p class="description"></p><a class="prev">‹</a><a class="next">›</a><a class="close" >×</a><a class="play-pause"></a><ol class="indicator" ></ol></div>'
    );

    $('<link>')
      .appendTo('head')
      .attr({
        type: 'text/css',
        rel: 'stylesheet'
      })
      .attr('href', '../bower_components/blueimp-gallery/css/blueimp-gallery.css');

    this.loader = new Promise(function(resolve, fail) {
      $.when(
        $.Deferred(function(deferred) {
          console.log("loaded blueimp javascript");
          // These scripts *must* have blueimp loaded, else they will fail
          $.getScript(
            "../bower_components/blueimp-gallery/js/blueimp-gallery-fullscreen.js");
          $.getScript(
            "../bower_components/blueimp-gallery/js/blueimp-gallery-indicator.js");
          $.getScript("../bower_components/blueimp-gallery/js/jquery.blueimp-gallery.js");
          $(deferred.resolve);
        })
      ).done(function() {
        console.log("Resolved blueimp javascript");
        resolve();
      });
    });
  }

  load(handlebars) {
    this.handlebars = handlebars;
    this.loader.then(function() {
      console.log("Loading Gallery");
      return "Gallery";
    });
    return this.loader;
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

/**
 * @function ImageGalleryBlueimp
 * Factory function
 */
function ImageGalleryBlueimp() {
  if (typeof instance === 'undefined') {
    instance = new ImageGalleryBlueimpClass();
  }
  return instance;
}

export default {
  ImageGalleryBlueimp
};
