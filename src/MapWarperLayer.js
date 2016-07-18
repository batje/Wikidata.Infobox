module.exports = L.TileLayer.MapWarperLayer = L.TileLayer.Canvas.extend({

      options: {
        debug: true,
        base_url: 'http://warper.wmflabs.org',
        bounds_opacity: 0.5,
        bounds_color: 'blue',
        bounds_weight: 2,
        attr = '<a href="http://commons.wikimedia.org">Wikimedia Commons</a> contributors',
      },
      layers: {},
      markers: [],

      /*
      Where did the URL parameter go?
      */
      initialize: function(options) {
        // create the tile layer
        var url = W_LEAFLET.base_url + '/maps/tile/' + this.map_id + '/{z}/{x}/{y}.png';
        //    var attr = '<a href="http://commons.wikimedia.org">Wikimedia Commons</a> contributors';
        this._url = url;
        L.Util.setOptions(this, options);
      },

      onAdd: function(map) {
        var self = this;
        self.map = map;
        //    L.TileLayer.Canvas.prototype.onAdd.call(this, map);

        //  var mapOnClickCallback = function(e) {
        //    self._onClick(e);
        //  };

        //  map.on('click', mapOnClickCallback);

        /    var clusterLayer = L.markerClusterGroup({
        maxClusterRadius: clusterRadius
      });
    var featureLayer = L.layerGroup();
    var boundsLayer = L.layerGroup();
    var bigMapsLayer = L.layerGroup();

    this.clusterLayer = clusterLayer; this.featureLayer = featureLayer; this.boundsLayer = boundsLayer; this.bigMapsLayer =
    bigMapsLayer;

    if (this.clustering)
      this.map.addLayer(this.clusterLayer);

    if (this.bounds)
      this.map.addLayer(this.boundsLayer);

    this.map.addLayer(this.featureLayer); this.map.addLayer(this.bigMapsLayer);

    var me = this; this.map.on('popupclose', function() {
      me.map.removeLayer(W_LEAFLET.boundsMarker);
    });


    map.on("layerremove", function(e) {
      // check to see if the layer removed is this one
      // call a method to remove the child layers (the ones that actually have something drawn on them).
      if (e.layer._leaflet_id === self._leaflet_id && e.layer.removeChildLayers) {
        e.layer.removeChildLayers(map);
        map.off('click', mapOnClickCallback);

        if (me.clustering)
          me.map.removeLayer(me.clusterLayer);

        if (me.bounds)
          me.map.removeLayer(me.boundsLayer);

        me.map.remoeLayer(me.featureLayer);
        me.map.removeLayer(me.bigMapsLayer);
      }
    });

  },

  showMap: function(map_id, data) {
    this.data = data;
    var bbox = data.items.bbox.split(',');
    var bounds = new L.LatLngBounds([
      [bbox[1], bbox[0]],
      [bbox[3], bbox[2]]
    ]);
    this.map.fitBounds(bounds);

    this.map_id = map_id;

    // create the tile layer
    var url = W_LEAFLET.base_url + '/maps/tile/' + this.map_id + '/{z}/{x}/{y}.png';
    var attr = '<a href="http://commons.wikimedia.org">Wikimedia Commons</a> contributors';
    var old_map = new L.TileLayer(url, {
      minZoom: 3,
      maxZoom: 20,
      attribution: attr
    });
    this.layers['m' + map_id] = {
      'map_id': map_id,
      'layer': old_map,
      'url': url,
      'bounds': bounds
    };

    this.map.addLayer(old_map)
    this.updateZIndexes();
  },

  getCurrentMap: function() {
    return this.map_id;

  },
  toggleClustering: function() {
    console.log(W_LEAFLET.clustering);
    W_LEAFLET.clustering = !W_LEAFLET.clustering;
    console.log(W_LEAFLET.clustering);
    if (W_LEAFLET.clustering) {
      //W_LEAFLET.featureLayer.clearlayers();
      W_LEAFLET.map.removeLayer(W_LEAFLET.featureLayer);
      W_LEAFLET.map.addLayer(W_LEAFLET.clusterLayer);
      W_LEAFLET.createMapMarkers(W_LEAFLET.data);
    } else {
      W_LEAFLET.map.removeLayer(W_LEAFLET.clusterLayer);
      W_LEAFLET.map.addLayer(W_LEAFLET.featureLayer);
      W_LEAFLET.createMapMarkers(W_LEAFLET.data);
    }
  },

  toggleBounds: function() {
    W_LEAFLET.bounds = !W_LEAFLET.bounds;
    if (W_LEAFLET.bounds) {
      W_LEAFLET.map.addLayer(W_LEAFLET.boundsLayer);
    } else {
      W_LEAFLET.map.removeLayer(W_LEAFLET.boundsLayer);
    }
  },


  // update markers and popups for maps from json returned by warper
  createMapMarkers: function(data) {

    this.data = data;

    if (this.featureLayer) {
      this.featureLayer.eachLayer(function(layer) {
        W_LEAFLET.featureLayer.removeLayer(layer);
      });
    }
    if (this.clusterLayer) {
      this.clusterLayer.eachLayer(function(layer) {
        W_LEAFLET.clusterLayer.removeLayer(layer);
      });
    }
    if (this.bigMapsLayer) {
      this.bigMapsLayer.eachLayer(function(layer) {
        W_LEAFLET.bigMapsLayer.removeLayer(layer);
      });
    }
    for (var i = 0; i < data.items.length; i++) {
      if (this.clustering) {
        var area = getArea(data.items[i].bbox);
        if (area < 32.0)
          this.clusterLayer.addLayer(this.createMarker(data.items[i], blueIcon));
        else
          this.bigMapsLayer.addLayer(this.createMarker(data.items[i], redIcon));
      } else {
        this.featureLayer.addLayer(this.createMarker(data.items[i], blueIcon));
      }

    }
  },

  // update markers and popups for maps from json returned by warper
  updateMapMarkers: function(data) {

    this.data = data;

    if (this.clustering) {
      var currentLayer = this.clusterLayer;
    } else {
      var currentLayer = this.featureLayer;
    }

    var mapList = [];
    currentLayer.eachLayer(function(layer) {
      //console.log(layer.options.map_id)
      mapList.push(parseInt(layer.options.map_id));
    });

    // we want to keep existing markers and just add new ones when necessary
    for (var i = 0; i < data.items.length; i++) {
      if ($.inArray(parseInt(data.items[i].id), mapList) == -1) {
        //console.log('map ' + data.items[i].id + ' not found, creating marker');
        if (this.clustering) {
          var split = data.items[i].bbox.split(',');
          var x = split[0] - split[2];
          var y = split[1] - split[3];
          var area = x * y;
          if (area < 1.0)
            currentLayer.addLayer(this.createMarker(data.items[i]));
        } else {
          currentLayer.addLayer(this.createMarker(data.items[i]));
        }
      }
    }
  },

  createMarker: function(data, icon) {
    var description = 'None';
    var title = decodeURIComponent(data.title.replace(/_/g, ' '));
    if (data.description)
      description = decodeURIComponent(data.description.replace(/_/g, ' '));

    var bbox = data.bbox.split(',');
    var points = this.getBoundsPoints(bbox);

    var marker = L.marker(new L.LatLng(bbox[3], bbox[0]), {
      icon: icon,
      map_id: data.id,
      title: title,
      desc: description,
      points: points
    });
    marker.on('click', W_LEAFLET.markerClick);
    marker.bindPopup('<div data-map_id="' + data.id + '" ><img class="mapimg" src="' + W_LEAFLET.base_url +
      '/maps/thumb/' + data.id + '" /><div>' + title + '</div><p>' + description + '</p>');
    return marker;

  },

  // create map bounds from json returned by warper
  createMapBounds: function(data) {

    var currentLayer = this.boundsLayer;

    var mapList = [];
    currentLayer.eachLayer(function(layer) {
      mapList.push(parseInt(layer.options.map_id));
    });

    // we want to keep existing bounds and just add new ones when necessary
    for (var i = 0; i < data.items.length; i++) {
      if ($.inArray(parseInt(data.items[i].id), mapList) == -1) {
        //console.log('map ' +data.items[i].id + ' not found, creating bounds');
        currentLayer.addLayer(this.createBound(data.items[i]));
      }

    }
  },

  createBound: function(data) {

    var bbox = data.bbox.split(',');
    var points = this.getBoundsPoints(bbox);
    return L.polyline(points, {
      map_id: data.id,
      color: this.bounds_color,
      weight: this.bounds_weight,
      opacity: this.bounds_opacity
    });

  },

  markerClick: function(e) {

    if (W_LEAFLET.boundsMarker)
      W_LEAFLET.map.removeLayer(W_LEAFLET.boundsMarker);

    W_LEAFLET.boundsMarker = L.polyline(this.options.points, {});
    W_LEAFLET.map.addLayer(W_LEAFLET.boundsMarker);

    // if clustering is NOT enabled, then zoom to map bounds
    if (!W_LEAFLET.clustering) {
      W_LEAFLET.map.fitBounds(W_LEAFLET.boundsMarker.getBounds(), {
        'paddingTopLeft': [150, 350]
      });

    }
  },

  openMarker: function(map_id) {

    if (this.clustering) {
      var currentLayer = this.clusterLayer;
    } else {
      var currentLayer = this.featureLayer;
    }

    currentLayer.eachLayer(function(layer) {
      if (layer.options.map_id == map_id) {
        layer.openPopup();
        if (W_LEAFLET.boundsMarker)
          W_LEAFLET.map.removeLayer(W_LEAFLET.boundsMarker);

        W_LEAFLET.boundsMarker = L.polyline(layer.options.points, {});
        W_LEAFLET.map.addLayer(W_LEAFLET.boundsMarker);
        // if clustering is NOT enabled, then zoom to map bounds
        if (!W_LEAFLET.clustering) {
          W_LEAFLET.map.fitBounds(W_LEAFLET.boundsMarker.getBounds(), {
            'paddingTopLeft': [150, 350]
          });

        }
      }
    });

  },

  // set z-indexes of maps based on sortable layers div
  updateZIndexes: function() {
    var layer_order = $("#layer_list").sortable('toArray').reverse();
    for (i = 0; i < layer_order.length; i++) {
      var layer = W_LEAFLET.layers['m' + layer_order[i]];
      layer.layer.setZIndex(100 + i);

    }
  },

  getBoundsPoints: function(bbox) {

    var start = new L.LatLng(bbox[1], bbox[0]);
    var middle = new L.LatLng(bbox[3], bbox[0]);
    var end = new L.LatLng(bbox[3], bbox[2]);
    var points = [start, middle, end];
    return points;
  }
});
