"use strict"

var instance;
/**
 * Class static Labels class that manages different templates for rendering labels
 *
 */
class LabelsClass {
  constructor(handlebars, config) {
    console.log("Loaded Labels Class");
    this.handlebars = handlebars;
    this.config = config;
    console.log("Registring Helper Labels_render");
    handlebars.registerHelper('Labels_render', this.renderhelper);
  }

  /** @function render Renders given label template or the default
   *
   **/
  renderhelper(property = '', language = 'en', template = '') {
      // handlebars always adds the context as the last argument
      // I want to be able to only pass in the property and nothing More
      // so we need to reset language && template
      language = (typeof language == 'object') ? language = 'en' : language;
      template = (typeof template == 'object') ? template = '' : template;
      var context = arguments[arguments.length - 1];
      var labels = Labels();
      return labels.render(labels, property, language, template, context);
    }
    /** @function render renders given label template or the default
     * @param labels the Labels Object
     * @param property The property for which to render the label. Used to lookup if the default label template might be overridded in the Config.
     * @param template If this value is set, this will be used as the template for rendering the label
     * @returns promise that returns the label text (or html)
     **/
  render(labels, property, language, template, context) {
    console.log('Labels', labels);
    console.log('property', property);
    console.log('Template', template);

    var config = labels.config.getConfig();
    if (template.length == 0) {
      template = (typeof config.defaultlabeltemplate !== 'undefined') ? config.defaultlabeltemplate :
        template;
      if ((property.length > 0) && ((typeof config[property] !== 'undefined'))) {
        template = (typeof config[property].labeltemplate !== 'undefined') ? config[property].labeltemplate :
          template;
      }
    }
    console.log('Template', template);
    var labelarray = {
      property: property,
      language: language,
      text: context.data._parent.root.labels.entities[property].labels[language].value,
      description: context.data._parent.root.labels.entities[property].descriptions[language].value,
      label: context.data._parent.root.labels.entities[property]
    }

    // I copied most of this code from baseTypeTemplate.js so I probably need a function somewhere
    var myHandlebars = this.handlebars;

    //import static stuff into the helpers
    return new Promise(function(resolve, fail) {
      console.log("going to promise... " + template);
      Promise.resolve(myHandlebars.getTemplate(template, false))
        .then(function(hbtemplate) {
          console.log("Going to render " + template, hbtemplate);
          Promise.resolve(hbtemplate(labelarray))
            .then(function(result) {
              console.log("Rendered " + template);
              resolve(new Handlebars.SafeString(result));
            })
            .catch(function(err) {
              console.error("There was an error processing template " + template, err);
              resolve("There was an error processing this template");
            });
        })
        .catch(function(fail) {
          console.error("did not find template " + template, fail);
          if (typeof template === 'undefined') {
            template = "label";
          }
          myHandlebars.getTemplate(template)
            .then(function(hbtemplate2) {
              console.error("If you see this one of the sub-modules or code is probably misbehaving:" +
                template,
                hbtemplate2);
              // resolve(me.PromisedHandlebars.SafeString(hbtemplate2(context)));
              try {
                hbtemplate2(context).then(function(result) {
                  resolve(new Handlebars.SafeString(result));
                });
              } catch (e) {
                resolve("There was an error processing this template");
              }
              console.log("Resolving Label to empty string");
              resolve(new Handlebars.SafeString(""));
            })
        });
    });

  }
}

/**
 * @function Map
 * Factory function
 */
function Labels(handlebars, config) {
  if (typeof instance === 'undefined') {
    instance = new LabelsClass(handlebars, config);
  }
  return instance;
}

export default {
  Labels
};
