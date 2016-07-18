"use strict"
import HandleBarsWrapper from './HandleBarsWrapper';

class InfoBox {
  constructor() {
    var me = this;

    var bar = new HandleBarsWrapper.HandleBarsWrapper();
    this.handlebars = bar;
  }

  getentities(Q, languages) {
    var simplifiedClaims, labels, entity;
    // Hallo
    //  var url = wdk.getEntities(ids, languages, properties, format)
    var url = wdk.getEntities(Q, languages);
    var me = this;
    $.ajax({
        dataType: "jsonp",
        url: url,
      })
      .done(function(data) {
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
            url: url2,
          })
          .done(function(labels) {

            //            _.each(labels.entities, function(label, key, labels) {
            //              entity.claims[key].label = label;
            //            });

            $('#infobox').append("<h2>" + entity.labels[Object.keys(entity.labels)[0]].value + "</h2>")
            $('#infobox').append("<i>" + entity.descriptions[Object.keys(entity.descriptions)[0]].value +
              "</i>")

            var object = {
              entity: entity,
              labels: labels,
              languages: languages
            }
            var infobox = me.handlebars.getTemplate('infobox');
            var html = infobox(object);
            $('#infobox').html(html);

          })
      })

    .fail(function(err) {
      alert("error");
    });



  }

}

//module.exports = Infobox;
//module.export.Infobox = Infobox;
export {
  InfoBox
};
