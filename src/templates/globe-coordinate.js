"use strict"
import TemplateBaseClass from '../utilclasses/TemplateBaseClass.js';
//import Map from '../utilclasses/Map.js';

var instance;

/** Class TimeClass helps rendering time datatype values
 * @extends TemplateBaseClass
 *
 */
class GlobeCoordinateClass extends TemplateBaseClass.TemplateBaseClass {
  constructor() {
    console.log("loading Globe Coordinates Javascript");
    super();
    // Loading static Gallery which loads the necessary javascript only once
    //this.Map = Map.Map();
    this.points = [];
  }

  load(handlebars, utilclass = "Map", variant = "Leaflet") {
    var me = this;
    //  var parentpromise = super.load(handlebars, utilclass, variant);
    console.log("Registring Helper globecoordinates_PlotPoint");
    handlebars.registerHelper('globecoordinates_PlotPoint', this.HelperPlotPoint);

    return super.load(handlebars, utilclass, variant)
      .then(function(map) {
        me.Map = map;
      });
    /*    return new Promise(function(resolve, reject) {
          Promise.resolve(parentpromise)
            .then(function() {
              resolve(me.Map.load(handlebars));
            });
        });*/
  }

  /*postProcess() {
    var mymap = L.map('mapid').setView([51.505, -0.09], 13);
    console.log("Postprocessing time");
  }*/

  HelperPlotPoint(lat, lon, mapid, options) {
    var help = globecoordinate();
    return help.PlotPoint(lat, lon, mapid, options);
  }

  /**
   * @function that renders a Wikidata time value as a text
   * @param lat
   * @param lon
   * @param mapid
   * @returns Text to display to the user
   */
  PlotPoint(lat, lon, mapid, options) {
    this.points.push({
      'lat': lat,
      'lon': lon,
      'mapid': mapid
    });
  }

  postProcess() {
    var me = globecoordinate();
    var mypoints = me.points;
    try {
      // We dont know what to do at all, only this.Map does.
      for (var i in mypoints) {
        console.log("wanting to add a point");
        var point = mypoints[i];
        me.Map.addPoint(point.lat, point.lon, point.mapid);
      }
    } catch (e) {
      console.error("Woops not adding a point here", me);
      console.error("Woops not adding a point here", e);
    }
  }
}

function globecoordinate() {
  if (typeof instance === 'undefined') {
    instance = new GlobeCoordinateClass();
  }
  return instance;
}

export default {
  globecoordinate
};
