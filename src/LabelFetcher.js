"use strict"
import wdk from "../bower_components/wikidata-sdk/dist/wikidata-sdk.js";
import difference from '../node_modules/lodash-es/difference.js';
import Config from './utilclasses/Config.js';


/** CLass LabelFetcher
 * Static class that monitors the dome for labels that need to be translated
 */
class LabelFetcher {

  /**
   * Create a LabelFetcher
   *
   * @param  {Array.String} languages: ['en'] Array of languages.
   * @return {type}                   {@link LabelFetcher}
   */
  constructor(languages = ['en']) {
    this.languages = (typeof languages === 'undefined') ? ['en'] : languages;
    this.labels = [];
    var me = this;
  }

  /**
   * Monitor a part of the DOM and all children for insertion of a wikida labels.
   *
   * @param  {string} Id = 'body' css identifier of elements that need to be monitored.
   * @return {type}             nothing yet
   */
  Monitor(Id = 'body') {
    var me = this;
    // configuration of the observer:
    var observerconfig = {
      attributes: false,
      childList: true,
      characterData: false
    };

    var labeltarget = $(Id)[0];

    // create an observer instance
    var labelobserver = new MutationObserver(function(mutations) {
      console.log("There was a mutation!");
      mutations.forEach(function(mutation) {
        console.log(mutation.type, mutation);
        if (mutation.addedNodes.length > 0) {
          console.log("going to populate label " + Id); //+ mutation.target.id);
          me.Populate(Id);
        } else {
          //          map.sidebarcontrols['rightsidebar'].disable('legendpane');
        }
      });
    });
    console.log("going to monitor this label " + Id, labeltarget);
    labelobserver.observe(labeltarget, observerconfig);

  }

  /**
   * Populates all wikidata labels under the dom element of id
   *
   * @param  {string} Id css identifier that holds wikidata labels
   * @return {type}    nothing
   */
  Populate(Id) {
    var labels = [];
    var labelelements = $(Id + ' .wikidata-fetchlabel[data-wikidata]').get();
    console.log("Find all items to translate in " + Id, labelelements);
    if (labelelements.length == 0) {
      return Promise.resolve([]);
    }
    for (var i = 0; i < labelelements.length; i++) {
      console.log("Wikidata" + labelelements[i].dataset.wikidata, labelelements[i]);
      if ((!labelelements[i].dataset.wikidata) || (labelelements[i].dataset.wikidata.length > 0)) {
        labels.push(labelelements[i].dataset.wikidata);
      } else {
        console.error("You inserted an empty wikidata data attribute. This will break things.");
      }
    }
    // Deduplicate entries:
    var labels = labels.filter(function(elem, index, self) {
      return index == self.indexOf(elem);
    })
    console.log("Labels", labels);

    $(Id + ' .wikidata-fetchlabel').addClass("wikidata-fetchlabel-processing").removeClass(
      "wikidata-fetchlabel");
    return this.getLabels(labels)
      .then(function(labeltext) {
        for (var Q in labeltext) {
          $(`.wikidata-fetchlabel-processing[data-wikidata="${Q}"]`).text(labeltext[Q].label);
          $(`.wikidata-fetchlabel-processing[data-wikidata="${Q}"]`).prop('title', labeltext[Q].description);
          $(`.wikidata-fetchlabel-processing[data-wikidata="${Q}"]`).removeClass("wikidata-fetchlabel-processing")
            .addClass(
              "wikidata-fetchlabel-processed");
        }
      });
  }

  /**
   * fetches label texts for wikidata Q items in defined languages.
   *
   * @param  {Array.String} Qs Array of Wikidata Q items
   * @return {Promise}    Returns Promise that resolves into the labels.
   */
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
          console.error("Error fetching labels", err);
          //alert("error");
        });
    });
  }

  /**
   * Flattens label fetching results
   *
   * @param  {Array} Qs Array of resolved Qs from Wikidata API
   * @return {Object}    Object of labels where Q is the key.
   */
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

export {
  LabelFetcher
};
