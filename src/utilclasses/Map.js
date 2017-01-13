"use strict"

var instance;
/**
 * Class Map
 * class that loads all things necessary for a Leaflet Map
 *
 */
class Map {
  constructor() {
    console.log("loading Map Baseclass. Do not forget to set this.loader as a promise.");
  }

  load(handlebars) {
    this.handlebars = handlebars;
    this.loader.then(function() {
      console.log("Loading Map");
      return "Map";
    });
    return this.loader;
  }

  // You must override these functions in your map
  createMap(mapid, lat = 51.505, lon = -0.99) {
    console.log("Createmap not implemented");
  };

  addPoint(lat, lon, mapid) {
    console.log("addPoint not implemented");
  }

  /** @function addKML Add KML to the current Map.
   * @param kml raw KML data
   * @see https://tools.wmflabs.org/wp-world/googlmaps-proxy.php?page=http%3A%2F%2Fen.wikipedia.org%2Fw%2Findex.php%3Ftitle=Template%3AAttached_KML/Interstate_20%26action%3Draw&output=classic
   * And @see https://www.wikidata.org/wiki/Q93881
   **/
  addKML(kml) {
    console.log("addKML not implemented");
  }
}

export default {
  Map
};
