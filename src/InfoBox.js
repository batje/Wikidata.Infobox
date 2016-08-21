/**
 * Copyright (c) 2016, Reinier Battenberg
 * All rights reserved.
 *
 * Source code can be found at:
 * https://github.com/batje/Wikidata.Infobox
 *
 * @license ISC
 */
"use strict"
import HandleBarsWrapper from './HandleBarsWrapper/HandleBarsWrapper.js';
//import P373 from './templates/helpers/P373.js';
/** InfoBox Class */
class InfoBox {

  constructor() {
    var me = this;
    this.handlebars = HandleBarsWrapper.HandleBarsWrapper();;
  }

  Populate(Id, Q, languages) {
    var simplifiedClaims, labels, entity;

    //  var url = wdk.getEntities(ids, languages, properties, format)
    var url = wdk.getEntities(Q, languages);
    var me = this;
    var result = new Promise(function(resolve, fail) {
      $.ajax({
          dataType: "jsonp",
          url: url,
        })
        .done(function(data) {
          var entity = data.entities[Q];
          var entities = wdk.parse.wd.entities;
          //  var entities = wdk.parse.wd.entities(data);
          var simplifiedClaims = wdk.simplifyClaims(entity.claims);
          //  alert(entities);

          //  We also want the attributes / wikidata items Q codes here!
          //    The Q values are in the simplifiedClaims as values
          var properties = Object.keys(simplifiedClaims);
          var url2 = wdk.getEntities(properties, languages);

          $.ajax({
              dataType: "jsonp",
              url: url2,
            })
            .done(function(labels) {

              //            _.each(labels.entities, function(label, key, labels) {
              //              entity.claims[key].label = label;
              //            });

              //        $('#infobox').append("<h2>" + entity.labels[Object.keys(entity.labels)[0]].value + "</h2>")
              //        $('#infobox').append("<i>" + entity.descriptions[Object.keys(entity.descriptions)[0]].value +
              //          "</i>")
              document.title = entity.labels[Object.keys(entity.labels)[0]].value;
              var object = {
                entity: entity,
                labels: labels,
                languages: languages
              }
              me.handlebars.getTemplate('infobox').then(function(infobox) {
                console.log("fetched infoboxhbs", infobox);
                infobox(object).then(function(html) {
                  console.log("fetched html");
                  $('#' + Id).append(html);
                  me.handlebars.postProcess('#' + Id);
                  resolve();
                });
              });
            })

        })
        .catch(function(err) {
          fail(err);
        });
    });
    return result;
  }
}

export {
  InfoBox
};
