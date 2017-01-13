"use strict"
import HandleBarsWrapper from './HandleBarsWrapper/HandleBarsWrapper.js';
class InfoBoxSPARQL {

  constructor() {
    var me = this;
    this.handlebars = HandleBarsWrapper.HandleBarsWrapper();;
  }

  getentities(Q, languages) {
    var simplifiedClaims, labels, entity;

    //  var url = wdk.getEntities(ids, languages, properties, format)
    var url = wdk.getEntities(Q, languages);
    // This is an official example from the examples on query.wikidata.org
    // The problem with this one and the next is that only attributes that refer to another
    // wikidata item are included, but no hard values like date of birth and official website
    //
    url = wdk.sparqlQuery(
      `#Data of Douglas Adams
PREFIX entity: <http://www.wikidata.org/entity/>
#partial results

SELECT ?propUrl ?propLabel ?valUrl ?valLabel ?picture
WHERE
{
	hint:Query hint:optimizer 'None' .
	{	BIND(entity:Q42 AS ?valUrl) .
		BIND("N/A" AS ?propUrl ) .
		BIND("identity"@en AS ?propLabel ) .
	}
	UNION
	{	entity:Q42 ?propUrl ?valUrl .
		?property ?ref ?propUrl .
		?property a wikibase:Property .
		?property rdfs:label ?propLabel
	}

  	?valUrl rdfs:label ?valLabel
	FILTER (LANG(?valLabel) = 'en') .
	OPTIONAL{ ?valUrl wdt:P18 ?picture .}
	FILTER (lang(?propLabel) = 'en' )
}
ORDER BY ?propUrl ?valUrl
LIMIT 200`
    );

    url = wdk.sparqlQuery(
      `PREFIX entity: <http://www.wikidata.org/entity/>
      SELECT ?predicate ?predicateLabel ?object ?objectLabel ?relationship
      WHERE {
        entity:${Q} ?predicate ?object.
        ?property wikibase:directClaim ?predicate.
        ?property rdfs:label ?relationship.
        SERVICE wikibase:label {
          bd:serviceParam wikibase:language "nl,en".
        }
        ?object rdfs:label ?objectLabel.
        FILTER((LANG( ?objectLabel)) = "en")
        FILTER((LANG( ?relationship)) = "en")
      }
    LIMIT 100`
    );


    var me = this;
    $.ajax({
        //  dataType: "jsonp",
        url: url,
      })
      .done(function(data) {
        var results = data.results.bindings;
        var entity = data.entities[Q];
        var entities = wdk.parse.wd.entities;
        //  var entities = wdk.parse.wd.entities(data);
        var simplifiedClaims = wdk.simplifyClaims(entity.claims);
        //  alert(entities);

        //    We also want the attributes / wikidata items Q codes here!
        //        The Q values are in the simplifiedClaims as values
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
            me.handlebars.getTemplate('infobox').then(function(infobox) {
              console.log("fetched infoboxhbs", infobox);
              infobox(object).then(function(html) {
                console.log("fetched html");
                $('#infobox').html(html);
                me.handlebars.postProcess('#infobox');
              });
            });
          })
      })

    .fail(function(err) {
      alert("error");
    });
  }
}

export {
  InfoBoxSPARQL
};
