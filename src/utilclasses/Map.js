/**
 * Copyright (c) 2016, Reinier Battenberg
 * All rights reserved.
 *
 * Source code can be found at:
 * https://github.com/batje/Wikidata.Infobox
 *
 * @license GPL 3.0
 * @module Util Classes
 */
"use strict"

var instance;
/**
 * @class BlueImp Gallery class that loads all things necessary for a BlueImp gallery
 *
 */
class MapClass {
  constructor() {
    console.log("loading leaflet javascript");
    // More layers at @ref http://maps.stamen.com/js/tile.stamen.js?v1.3.0
    // I am quite sure that stamen allows use of their tiles, since the demise of that other provider
    // ehm, the one whos name me already fails.
    // this.layers contains a list of possible layers. For future use
    var SUBDOMAINS = "a. b. c. d.".split(" ");
    this.layers = [];
    this.layers.stamenterrain = {
      "type": 'png',
      "subdomains": SUBDOMAINS.slice(),
      "minZoom": 1,
      "maxZoom": 20,
      "attribution": [
        'Map tiles by <a href="http://stamen.com/">Stamen Design</a>, ',
        'under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. ',
        'Data by <a href="http://openstreetmap.org/">OpenStreetMap</a>, '
      ].join("")
    };
    // List of maps managed
    this.maps = [];
    $.getScript(
      "../bower_components/leaflet/dist/leaflet.js");

    /*    $('body').append(
          '<div id="blueimp-gallery" class="blueimp-gallery blueimp-gallery-controls" ><div class="slides" ></div><h3 class="title"></h3><p class="description"></p><a class="prev">‹</a><a class="next">›</a><a class="close" >×</a><a class="play-pause"></a><ol class="indicator" ></ol></div>'
        );
    */
    $('<link>')
      .appendTo('head')
      .attr({
        type: 'text/css',
        rel: 'stylesheet'
      })
      .attr('href', '../bower_components/leaflet/dist/leaflet.css');


    // <!-- this only should happen once -->
    // <!-- The Gallery as lightbox dialog, should be a child element of the document body -->
    this.loader = new Promise(function(resolve, fail) {
      $.when(
        $.Deferred(function(deferred) {
          console.log("loaded leaflet javascript");
          $(deferred.resolve);
        })
      ).done(function() {
        console.log("Resolved leaflet javascript");
        L.Icon.Default.imagePath = "../bower_components/leaflet/dist/images";
        resolve();
      });
    });
  }

  load(handlebars) {
    this.handlebars = handlebars;
    this.loader.then(function() {
      console.log("Loading Map");
      return "Map";
    });
    return this.loader;
  }

  createMap(mapid, lat = 51.505, lon = -0.99) {
    var defaultlayer = this.layers.stamenterrain;
    var mymap = L.map(mapid).setView([lat, lon], 12);
    var layer = L.tileLayer("http://{s}tile.stamen.com/terrain/{z}/{x}/{y}.png", defaultlayer).addTo(mymap);
    console.log("Addded a layer", layer);
    this.maps[mapid] = mymap;
    console.log("Addded a map", this.maps[mapid]);
  };

  addPoint(lat, lon, mapid) {
    if (typeof this.maps[mapid] == 'undefined') {
      this.createMap(mapid, lat, lon);
    }
    console.log("Adding a point");

    var marker = L.marker([lat, lon]).addTo(this.maps[mapid]);
    console.log("Addded a point", marker);

  }
}

/**
 * @function ImageGallery
 * Factory function
 */
function Map() {
  if (typeof instance === 'undefined') {
    instance = new MapClass();
  }
  return instance;
}

export default {
  Map
};
