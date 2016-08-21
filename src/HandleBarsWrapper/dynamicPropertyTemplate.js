import JavaScriptFetcher from './JavaScriptFetcher.js';
import TemplateFetcher from './TemplateFetcher.js';
import HandleBarsWrapper from './HandleBarsWrapper.js';

var myJavaScriptFetcher = JavaScriptFetcher.JavaScriptFetcher();
var myTemplateFetcher = TemplateFetcher.TemplateFetcher();

function dynamicPropertyTemplate(key, template, context, opts) {

  if (key == 'P18') {
    //  return Promise.resolve("later");
  }

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
