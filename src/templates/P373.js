"use strict"
import WikiMediaImage from '../utilclasses/WikiMediaImage.js'
import TemplateBaseClass from '../utilclasses/TemplateBaseClass.js';

var instance;
/**
 *  Class that renders images for Commons Category.
 *  {@link https://www.wikidata.org/wiki/Property:P373}
 *  @extends TemplateBaseClass
 */
class P373Class extends TemplateBaseClass.TemplateBaseClass {
  constructor() {
    super();
    this.handlebars = "empty";
    console.log("loading P373");
  }

  load(handlebars, utilclass = "ImageGallery", variant = "Blueimp") {
    console.log("P373 Load setting Handlebars", handlebars);
    this.handlebars = handlebars;
    this.handlebars.registerHelper('P373_InsertImages', this.InsertImagesHelper);
    return super.load(handlebars, utilclass, variant);
  }

  /** @function InsertImagesHelper
   * @param gallery css Id of the gallery
   * This is a very tricky function that wraps the P373.InsertImages function. The reason for this is that
   * if we  do not do this, the helper function runs in the context of the handlebars helper. so this resolves
   * to the helper, not to the P373 object. That causes us not to be able to access this.handlebars which is
   * necessary to load more (sub) templates. I am not proud of this, but it works.
   * @todo Have to figure out a neat way to do this using the TemplateBaseClass.
   */
  InsertImagesHelper(gallery) {
    var help = P373();
    return help.InsertImages(gallery);
  }

  /** @function InsertImages
   * @param gallery css Id of the gallery
   * loads all images (only!) from a commons category and creates a gallery of them.
   */
  InsertImages(gallery) {
    var me = this;
    var galleryname = gallery.mainsnak.datavalue.value;
    this.loader = new Promise(function(resolve, reject) {
      var url =
        `https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtype=file&cmtitle=Category:${galleryname}&format=json`;
      console.log("Going to load images from url ", url);
      $.ajax({
          url: url,
          dataType: "jsonp"
        })
        .done(function(data) {
          var html = '';
          console.log("images", data);
          var imagePromises = [];
          var wikimediaimage = WikiMediaImage.WikiMediaImage(me.handlebars);
          data.query.categorymembers.forEach(function(image, index, images) {
            console.log("Going to render ", image);

            var title = image.title.substr(5); // Chop off 'File: '
            // We now have the title of the File. But we need to check if this is an image
            // The P18 property has a regexp attribute, which we hereby copy hardcoded so we
            // can do the filtering.
            // The original: (?i).+\.(jpg|jpeg|png|svg|tif|tiff|gif)
            var regexp = new RegExp('\.(jpg|jpeg|png|svg|tif|tiff|gif)', 'i');
            if (regexp.test(title)) {
              console.log("Adding Picture to gallery.", title);
              imagePromises.push(wikimediaimage.render(title, 'Image', galleryname));
            } else {
              console.log("Skipping non-Image from gallery.", title);
            }
          });
          console.log("Adding up all image promises");
          var FinalPromise = Promise.all(imagePromises).then(function(imagehtml) {
            var html = imagehtml.join('');
            console.log("P373 Total Images html", html);
            return new Handlebars.SafeString(html);
          });
          resolve(FinalPromise);
        })
        .catch(function(e) {
          console.error("error loading images from imagegallery " + imagegallery, e);
          reject("Error fetching images from gallery " + galleryname);
        });
    });

    return this.loader;
  }

  postProcess() {
    //debugger;
    $('#P373').click(function(event) {
      event = event || window.event;
      var target = event.target || event.srcElement,
        link = target.src ? target.parentNode : target,
        options = {
          hidePageScrollbars: false, // in my FF when I do not click the cross to close the gallery, they scrollbars do not appear. Blueimp Gallery does not seem to have an issue queue to post this to.
          index: link,
          event: event,
          onslide: function(index, slide) {
            var hiddendescription = $(this.list[index]).find('.hiddendescription')[0];
            if (typeof hiddendescription !== 'undefined') {
              var html = hiddendescription.innerHTML;
            } else {
              html = "";
            }
            $(this.container).find('.description')[0].innerHTML = html;
          }
        },
        // This line sucks. It means you can not have any links
        // in the gallery, like in the description field.
        // On top of that, it looks like the wikipedia fields contain invalid HTML
        // with for example closing </a> values where there is no opening <a>
        // As soon as the smarter templating in Image.hbs is enabled, the DOM goes
        // bezerk and stuff stops working. So, a raw list for now.
        links = this.getElementsByTagName('a');
      // We need to pass an array of items, the following array doesnt work well enough
      //        links = $(this.children).find('a.image').get();
      blueimp.Gallery(links, options);
    });
  };
}

function P373() {
  if (typeof instance === 'undefined') {
    instance = new P373Class();
  }
  return instance;
}

export default {
  P373
};
