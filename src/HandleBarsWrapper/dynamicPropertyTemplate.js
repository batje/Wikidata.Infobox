import JavaScriptFetcher from './JavaScriptFetcher.js';
import TemplateFetcher from './TemplateFetcher.js';
import HandleBarsWrapper from './HandleBarsWrapper.js';

var myJavaScriptFetcher = JavaScriptFetcher.JavaScriptFetcher();
var myTemplateFetcher = TemplateFetcher.TemplateFetcher();


/**
 * dynamicPropertyTemplate - description
 *
 * @param  {type} key      description
 * @param  {type} template description
 * @param  {type} context  description
 * @param  {type} options  description
 * @param  {type} root     description
 * @return {type}          description
 */
function dynamicPropertyTemplate(key, template, context, options, root) {
  var myoptions, localoptions;
  // options is an optional parameter and root is added by handlebars, always
  if (typeof root === 'undefined') {
    root = options;
    options = "{}";
  }
  if (key == 'P18') {
    //debugger;

  }
  try {
    localoptions = $.parseJSON(options);
    myoptions = $.extend(root.data.root.config.P[key], localoptions);
  } catch (e) {
    console.error("These options are not valis JSON", options);
    myoptions = (typeof root.data.root.config.P[key] !== 'undefined') ? root.data.root.config.P[key] : {};
  }
  if (myoptions.variant) {
    template = template + "_" + variant;
  }
  context[0].options = myoptions;
  context['options'] = myoptions;
  console.log("context", context);

  var myHandlebars = HandleBarsWrapper.HandleBarsWrapper();
  var me = this;
  //import static stuff into the helpers
  return new Promise(function(resolve, fail) {
    //    console.log("going to promise... " + key);
    myHandlebars.getTemplate(key, true)
      .then(function(hbtemplate) {
        //      console.log("Going to render " + key);
        try {
          hbtemplate(context)
            .then(function(result) {
              //          console.log("Rendered " + key);
              resolve(new Handlebars.SafeString(result));
            })
            .catch(function(err) {
              resolve("There was an error processing this template", err);
            });
        } catch (e) {
          console.error("Error rendering template " + key, e);
        }
      })
      .catch(function(fail) {
        console.error("did not find template" + key, fail);
        if (typeof template === 'undefined') {
          template = "defaultText";
        }
        myHandlebars.getTemplate(template)
          .then(function(hbtemplate2) {
            //            console.error("If you see this one of the sub-modules or code is probably misbehaving:" + template,
            //                hbtemplate2);
            // resolve(me.PromisedHandlebars.SafeString(hbtemplate2(context)));
            try {
              hbtemplate2(context).then(function(result) {
                resolve(new Handlebars.SafeString(result));
              });
            } catch (e) {
              resolve("There was an error processing this template");
            }
            resolve(new Handlebars.SafeString("<td>default text</td>"));
          })
      });
  });
  console.error("what am i doing here?");
  return;
}

export default {
  dynamicPropertyTemplate
};
