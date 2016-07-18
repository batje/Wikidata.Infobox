"use strict"

class HandleBarsWrapper {
  constructor() {

    var me = this;

    function debug(context, options) {
      console.log(
        'This : ', this);
      console.log(
        'Context : ', context
        //      'Variables referenced in this template: ',                     context.vars,
        //      'Partials/templates that this file directly depends on: ',     context.deps,
        //      'Helpers that this template directly depends on: ',            context.helpers,
        //      'The metadata object at the top of the file (if it exists): ', context.meta
      );
    }
    Handlebars.registerHelper('debug', debug);

    function dynamictemplate(key, template, context, opts) {
      var f = Handlebars.partials[key];
      if (!f) {
        template = template.replace(/\//g, '_');
        var f = Handlebars.partials[template];
        if (!f) {
          return "defaultText";
        }
      }
      return new Handlebars.SafeString(f(context));
    }

    Handlebars.registerHelper('dynamictemplate', dynamictemplate);
    // This is so we can compile all partials + templates into 1 file
    Handlebars.partials = Handlebars.templates;

  }

  addPartial(name) {

  }

  getTemplate(name) {
    if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
      $.ajax({
        url: 'templates/' + name + '.hbs',
        success: function(data) {
          if (Handlebars.templates === undefined) {
            Handlebars.templates = {};
          }
          Handlebars.templates[name] = Handlebars.compile(data);
        },
        async: false
      });
    }
    return Handlebars.templates[name];
  };
}

export default {
  HandleBarsWrapper
};
