(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.Wikidata = global.Wikidata || {})));
}(this, function (exports) { 'use strict';

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var HandleBarsWrapper = function () {
    function HandleBarsWrapper() {
      classCallCheck(this, HandleBarsWrapper);


      var me = this;

      function debug(context, options) {
        console.log('This : ', this);
        console.log('Context : ', context
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

    createClass(HandleBarsWrapper, [{
      key: 'addPartial',
      value: function addPartial(name) {}
    }, {
      key: 'getTemplate',
      value: function getTemplate(name) {
        if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
          $.ajax({
            url: 'templates/' + name + '.hbs',
            success: function success(data) {
              if (Handlebars.templates === undefined) {
                Handlebars.templates = {};
              }
              Handlebars.templates[name] = Handlebars.compile(data);
            },
            async: false
          });
        }
        return Handlebars.templates[name];
      }
    }]);
    return HandleBarsWrapper;
  }();

  var HandleBarsWrapper$1 = {
    HandleBarsWrapper: HandleBarsWrapper
  };

  var InfoBox = function () {
    function InfoBox() {
      classCallCheck(this, InfoBox);

      var me = this;

      var bar = new HandleBarsWrapper$1.HandleBarsWrapper();
      this.handlebars = bar;
    }

    createClass(InfoBox, [{
      key: "getentities",
      value: function getentities(Q, languages) {
        var simplifiedClaims, labels, entity;
        // Hallo
        //  var url = wdk.getEntities(ids, languages, properties, format)
        var url = wdk.getEntities(Q, languages);
        var me = this;
        $.ajax({
          dataType: "jsonp",
          url: url
        }).done(function (data) {
          entity = data.entities[Q];
          var entities = wdk.parse.wd.entities;
          //  var entities = wdk.parse.wd.entities(data);
          simplifiedClaims = wdk.simplifyClaims(entity.claims);
          //  alert(entities);
          var properties = Object.keys(simplifiedClaims);
          var url2 = wdk.getEntities(properties, languages);
          //alert("done");
          //request(url2 ....
          $.ajax({
            dataType: "jsonp",
            url: url2
          }).done(function (labels) {

            //            _.each(labels.entities, function(label, key, labels) {
            //              entity.claims[key].label = label;
            //            });

            $('#infobox').append("<h2>" + entity.labels[Object.keys(entity.labels)[0]].value + "</h2>");
            $('#infobox').append("<i>" + entity.descriptions[Object.keys(entity.descriptions)[0]].value + "</i>");

            var object = {
              entity: entity,
              labels: labels,
              languages: languages
            };
            var infobox = me.handlebars.getTemplate('infobox');
            var html = infobox(object);
            $('#infobox').html(html);

            ///            $("#legend .marker").click(function() {
            //              console.log("Moving Map");
            //            });
          });
        }).fail(function (err) {
          alert("error");
        });
      }
    }]);
    return InfoBox;
  }();

  exports.InfoBox = InfoBox;

  Object.defineProperty(exports, '__esModule', { value: true });

}));