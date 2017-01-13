"use strict"
//import $ from 'jquery';
import jsyaml from '../../bower_components/js-yaml/dist/js-yaml.js';

var instance;
/**
 * Class Config class.
 * {@see Config.getdefaults} for the default config documentation.
 * Unlike a lot of other classes this is not a static class, you can create more than 1 config in your page.
 * Most likely you will not be creating the config Class yourself, but the InfoBox object will create one for you.
 * Config is 1 big object. When creating a config instance you may:
 * - not pass anything and load the default options
 * - pass an array in the first parameter that overrides the default object
 * - pass a filename of a yaml file that overrides the default + overrides from the array
 */
class Config {
  constructor(config = {}, filename = '') {
    console.log("loading config");

    this.config = this.getdefaults();
    this.config = $.extend(this.config, config);
    var me = this;
    this.loader = new Promise(function(resolve, fail) {
      if (filename.length > 0) {
        $.get(filename)
          .then(function(data) {
            console.log('File load complete', data);
            console.log(jsyaml.load(data));
            var fileconfig = jsyaml.load(data);
            var jsonString = JSON.stringify(data);
            console.log(jsonString);
            console.log($.parseJSON(jsonString));
            me.config = $.extend(me.config, fileconfig);
            console.log(me.config);
            //          $(deferred.resolve);
            resolve();
          });
      } else {
        resolve();
      }
    });
  }

  load() {
    var me = this;
    this.loader.then(function() {
      console.log("Loaded Config");
      return me;
    });
    return this.loader;
  }

  /**
   * getdefaults - description
   *
   * @return {ConfigObject} Object holding all default settings
   * @internal
   */
  getdefaults() {

    // @todo get the defaults from file (optionally)
    //
    //var script = document.currentScript;
    //var fullUrl = script.src;
    // cutoff script name and add config.yaml
    // @see https://developer.mozilla.org/en-US/docs/Web/API/Document/currentScript
    return {
      defaultlabeltemplate: 'label',
      P: {
        P18: {
          width: 500,
          thumbwidth: 100
        },
      },
      Q: {},
      BaseType: {
        url: {}
      },
      Util: {
        Image: {
          width: 500,
          thumbwidth: 100
        },
        Map: {

        }
      }
    };
  }

  getConfig() {
    //console.log("Yaml", jsyaml.safeDump(this.config));

    return this.config;
  }

}

export default {
  Config
};
