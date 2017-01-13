import HandleBarsWrapper from './HandleBarsWrapper.js';


/**
 * baseTypeTemplate - description
 *
 * @param  {type} template description
 * @param  {type} context  description 
 * @param  {type} config   description
 * @return {type}          description
 */
function baseTypeTemplate(template, context, config) {

  if (template != 'time') {
    //    return Promise.resolve("niks");
  }

  //console.log("Want to render a basetype: " + template);
  var myHandlebars = HandleBarsWrapper.HandleBarsWrapper();
  var me = this;
  var key = template;
  //import static stuff into the helpers
  return new Promise(function(resolve, fail) {
    //  console.log("going to promise... " + key);
    Promise.resolve(myHandlebars.getTemplate(key, true))
      .then(function(hbtemplate) {
        //      console.log("Going to render " + key, hbtemplate);
        Promise.resolve(hbtemplate(context))
          .then(function(result) {
            //          console.log("Rendered " + key);
            resolve(new Handlebars.SafeString(result));
          })
          .catch(function(err) {
            console.error("There was an error processing template " + key, err);
            resolve("There was an error processing this template");
          });
      })
      .catch(function(fail) {
        console.error("did not find template " + key, fail);
        if (typeof template === 'undefined') {
          template = "defaultText";
        }
        myHandlebars.getTemplate(template)
          .then(function(hbtemplate2) {
            console.error("If you see this one of the sub-modules or code is probably misbehaving:" + template,
              hbtemplate2);
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
  baseTypeTemplate
};
