"use strict"
//import wdk from "../bower_components/wikidata-sdk/build/wikidata-sdk.js";
import Config from './utilclasses/Config.js';

/** Class ToolTips*/
class ToolTips {


  /**
   * Create ToolTips
   *
   * @return {ToolTips}  returns a ToolTips
   */
  constructor() {
    var me = this;
    var config = {
      defaultlabeltemplate: 'linkedlabel'
    };
    this.config = new Config.Config(config, 'config.yaml');
    console.log("Log", this.config.getConfig());
    $.getScript(
      "../bower_components/jquery-ui/jquery-ui.min.js");

    this.loader = new Promise(function(resolve, fail) {
      $.when(
        $.Deferred(function(deferred) {
          console.log("jquery-ui");
          // Start the Tooltips
          $(function() {
            $("body").tooltip({
              items: ".wikidata-tooltip[data-wikidata]",
              content: function() {
                var element = $(this);
                if (element.is("[data-wikidata]")) {
                  var Q = element.data('wikidata');

                  var template = element.data('wikidatatemplate');
                  if (!template) {
                    template = "simple"
                  }

                  var result = $(
                    '<div style="width:100px; height:50px;" class="wikidata" data-wikidata="' + Q +
                    '" data-wikidatatemplate="' + template + '">');
                  var id = result.uniqueId()
                  var html = id[0].outerHTML;
                  return html;
                }
              }
            });
          });
          $(deferred.resolve);
        })
      ).done(function() {
        console.log("Resolved jquery-ui");
        resolve();
      });
    });

  }


  /**
   * returns Promise that resolves into the ToolTips instance itself.
   *
   *
   * @param  {HandleBarsWrapper} handlebars Global {@link HandleBarsWrapper} object
   * @return {Promise}            description
   */
  load(handlebars) {
    var me = this;
    this.handlebars = handlebars;
    this.loader.then(function() {
      console.log("Loaded ToolTips");
      return me;
    });
    return this.loader;
  }

}


export default {
  ToolTips
};
