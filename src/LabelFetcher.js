/**
 * Copyright (c) 2016, Reinier Battenberg
 * All rights reserved.
 *
 * Source code can be found at:
 * https://github.com/batje/Wikidata.Infobox
 *
 * @license ISC
 */
import difference from '../node_modules/lodash/difference.js';

"use strict"
var instance;
/** LabelFetcher Class
 * Static class
 */
class LabelFetcherClass {

  constructor(languages) {
    this.languages = (typeof languages === 'undefined') ? ['en'] : languages;
    this.labels = [];
    var me = this;
  }

  Monitor(Id) {
    var me = this;
    // configuration of the observer:
    var observerconfig = {
      attributes: false,
      childList: true,
      characterData: false
    };


    var labeltarget = document.getElementById(Id);

    // create an observer instance
    var labelobserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        console.log(mutation.type, mutation);
        if (mutation.addedNodes.length > 0) {
          //  var items = mutation.target.children.getElementsByClassName("wikidata-fetchlabel");
          me.Populate(mutation.target.id);
          //map.sidebarcontrols['rightsidebar'].enable('legendpane');
        } else {
          //          map.sidebarcontrols['rightsidebar'].disable('legendpane');
        }
      });
    });
    labelobserver.observe(labeltarget, observerconfig);

  }
  Populate(Id) {
    var labels = [];
    var labelelements = $('#' + Id + ' .wikidata-fetchlabel').get();
    console.log("Find all items to translate in " + Id, labelelements);
    if (labelelements.length == 0) {
      return Promise.resolve([]);
    }
    $('#' + Id + ' .wikidata-fetchlabel').addClass("wikidata-fetchlabel-processing").removeClass(
      "wikidata-fetchlabel");
    for (var i = 0; i < labelelements.length; i++) {
      console.log(labelelements[i].dataset.wikidata);
      labels.push(labelelements[i].dataset.wikidata);
    }
    // Deduplicate entries:
    var labels = labels.filter(function(elem, index, self) {
      return index == self.indexOf(elem);
    })
    console.log("Labels", labels);
    return this.getLabels(labels)
      .then(function(labeltext) {
        for (var Q in labeltext) {
          $(`[data-wikidata="${Q}"]`).text(labeltext[Q].label);
          $(`[data-wikidata="${Q}"]`).prop('title', labeltext[Q].description);
          $(`[data-wikidata="${Q}"]`).removeClass("wikidata-fetchlabel-processing").addClass(
            "wikidata-fetchlabel-processed");
        }
      });
  }

  getLabels(Qs) {
    var me = this;
    var simplifiedClaims, labels, entity, url;
    var langs = this.languages.join(',');

    var QsDelta = difference(Qs, Object.keys(this.labels));
    if (QsDelta.length == 0) {
      var returnlabels = this.findLabels(Qs);
      // figurethemout
      return Promise.resolve(returnlabels);
    }
    var SELECT = "SELECT ";
    var WHERE = " WHERE {";
    QsDelta.forEach(function(Q) {
      SELECT += `?${Q}Label ?${Q}Description `;
      WHERE += `BIND(entity:${Q} AS ?${Q}) . `;
    });

    WHERE += `SERVICE wikibase:label {
              bd:serviceParam wikibase:language "${langs}".
              } }`;
    var url = wdk.sparqlQuery("PREFIX entity: <http://www.wikidata.org/entity/> " + SELECT + WHERE);


    return new Promise(function(resolve, reject) {
      $.ajax({
          //  dataType: "jsonp",
          url: url,
        })
        .done(function(data) {
          var values = data.results.bindings[0];
          //var returnlabels = [];
          var keys = Object.keys(values);
          keys.forEach(function(fullkey) {

            var key = fullkey.indexOf('Description') > 0 ? fullkey.substr(0, fullkey.indexOf('Description')) :
              fullkey.substr(0, fullkey.indexOf('Label'));
            if (typeof me.labels[key] === 'undefined') {
              me.labels[key] = [];
            }
            if (fullkey.indexOf('Label') > 0) {
              me.labels[key].label = values[fullkey].value;
            } else {
              me.labels[key].description = values[fullkey].value;
            }
          });


          var returnlabels = me.findLabels(Qs);
          resolve(returnlabels);
        })
        .fail(function(err) {
          alert("error");
        });
    });
  }
  findLabels(Qs) {
    var me = this;
    // There is probably a lodash function for this. No clue which one.
    var result = [];
    Qs.forEach(function(Q) {
      result[Q] = me.labels[Q];
    });
    return result;
  }
}


function LabelFetcher(languages) {
  if (typeof instance === 'undefined') {
    instance = new LabelFetcherClass(languages);
  }
  return instance;
}

export {
  LabelFetcher
};
