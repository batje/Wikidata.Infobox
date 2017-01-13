"use strict"
//import wdk from "../bower_components/wikidata-sdk/build/wikidata-sdk.js";
import Config from './utilclasses/Config.js';
import HandleBarsWrapper from './HandleBarsWrapper/HandleBarsWrapper.js';
import ToolTips from './ToolTips.js';
import LabelFetcher from './LabelFetcher.js';
import Spinner from "../bower_components/spin.js/spin.js";;

/** Class generating an embedded infobox */
class InfoBox {

  /**
   * create an Infobox
   *
   */
  constructor() {
    var me = this;
    var config = {
      defaultlabeltemplate: 'linkedlabel'
    };
    this.config = new Config.Config(config, 'config.yaml');
    console.log("Log", this.config.getConfig());
    this.handlebars = HandleBarsWrapper.HandleBarsWrapper(this.config);
    this.tooltips = new Tooltips.ToolTips();
    this.labelfetcher = new LabelFetcher.LabelFetcher(this.config.languages);
    this.labelfetcher.Monitor();

  }

  /**
   * Populate an html element with the infobox html
   *
   * @param  {string} Id                   id of the html element (including the #)
   * @param  {string} Q                    Q value of the wikidata item
   * @param  {string} template = 'infobox' handlebars template to be used
   * @param  {Array.String} languages = ['en']   languages to be loaded. first language is default, others are fallback if default language is not available
   * @return {type}                      returns nothing
   */
  Populate(Id, Q, template = 'infobox', languages = ['en']) {
    var simplifiedClaims, labels, entity;

    var boxelements = $(Id + '.wikidata').get();
    console.log("Find all items to fill in " + Id, boxelements);
    if (boxelements.length == 0) {
      return Promise.resolve([]);
    }
    $(Id + ' .wikidata-fetchlabel[data-wikidata]').addClass("wikidata-processing").removeClass(
      "wikidata");


    if ((typeof $(Id)[0].dataset !== 'undefined')) {
      // If html data template is set, then that gets preference
      template = (typeof $(Id)[0].dataset.wikidatatemplate !== 'undefined') ? $(Id)[0].dataset.wikidatatemplate :
        template;
      // If html data Q/wikidata is set, then that gets preference
      Q = (typeof $(Id)[0].dataset.wikidata !== 'undefined') ? $(Id)[0].dataset.wikidata : Q;
    }

    // This has to go to config.yaml
    var opts = {
      lines: 13 // The number of lines to draw
        ,
      length: 11 // The length of each line
        ,
      width: 11 // The line thickness
        ,
      radius: 2 // The radius of the inner circle
        ,
      scale: 1 // Scales overall size of the spinner
        ,
      corners: 1 // Corner roundness (0..1)
        ,
      color: '#000' // #rgb or #rrggbb or array of colors
        ,
      opacity: 0.25 // Opacity of the lines
        ,
      rotate: 0 // The rotation offset
        ,
      direction: 1 // 1: clockwise, -1: counterclockwise
        ,
      speed: 1 // Rounds per second
        ,
      trail: 60 // Afterglow percentage
        ,
      fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
        ,
      zIndex: 2e9 // The z-index (defaults to 2000000000)
        ,
      className: 'spinner' // The CSS class to assign to the spinner
        ,
      top: '50%' // Top position relative to parent
        ,
      left: '50%' // Left position relative to parent
        ,
      shadow: false // Whether to render a shadow
        ,
      hwaccel: false // Whether to use hardware acceleration
        ,
      position: 'absolute' // Element positioning
    };
    //$(Id).width(100);
    var spinner = new Spinner(opts).spin($(Id)[0]);


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

              document.title = entity.labels[Object.keys(entity.labels)[0]].value;
              var config = me.config.getConfig();
              var object = {
                entity: entity,
                labels: labels,
                languages: languages,
                config: config
              }
              me.handlebars.getTemplate(template).then(function(infobox) {
                console.log("fetched infoboxhbs", infobox);

                infobox(object)
                  .then(function(html) {
                    console.log("fetched html");
                    $(Id).append(html);
                    me.handlebars.postProcess(Id);
                    $(Id + '.wikidata-processing[data-wikidata]').addClass("wikidata-processed").removeClass(
                      "wikidata-processing");
                    resolve();
                  })
                  .catch(function(err) {
                    console.error("Error generating infobox template " + template, err);
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


  /**
   * Monitor a part of the DOM and all children for insertion of a wikida infobox html item.
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
      mutations.forEach(function(mutation) {
        console.log(mutation.type, mutation);
        if (mutation.addedNodes.length > 0) {
          var labels = [];
          var labelelements = $(Id + ' .wikidata').get();
          console.log("Find all items to fill in " + Id, labelelements);
          if (labelelements.length > 0) {

            for (var i = 0; i < labelelements.length; i++) {
              console.log(labelelements[i].dataset.wikidata);
              // No id, then you can not fill this element.
              // This also solves issues with jquery-toolbar that inserts the tooltip div
              // 4 more times without an Id.
              if ((labelelements[i].id) && (labelelements[i].dataset.wikidata.length > 0)) {
                me.Populate("#" + labelelements[i].id, labelelements[i].dataset.wikidata);
                //                labels.push(labelelements[i].dataset.wikidata);
              }
            }
          }
        }
      });
    });
    labelobserver.observe(labeltarget, observerconfig);

    // And after initializing the observer, process the element as it might already need to be populated
    var labels = [];
    var labelelements = $(Id + ' .wikidata').get();
    console.log("Find all items to translate in " + Id, labelelements);
    if (labelelements.length > 0) {

      for (var i = 0; i < labelelements.length; i++) {
        console.log(labelelements[i].dataset.wikidata);
        if (labelelements[i].dataset.wikidata.length > 0) {
          me.Populate("#" + labelelements[i].id, labelelements[i].dataset.wikidata);
          //                labels.push(labelelements[i].dataset.wikidata);
        }
      }
    }
  }
}


export {
  InfoBox
};
