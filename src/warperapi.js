var W_API = {
	api_url:    'http://localhost:3000',
	getMapInfo: function (map_id, callback ) {

		var query_url = W_API.api_url + "/maps/"+map_id;
		W_API.getJSON (query_url, callback);

	},

	getAllMaps: function (bounds, callback ) {
/* THis is from the real warper
http://warper.wmflabs.org/maps//geosearch?bbox=23.66816322271,59.310780993071,26.36530677729,61.084869071766&format=json&page=1&operation=intersect
*/
		var south_west = L.latLng(bounds.getSouthWest()).wrap();
		var north_east = L.latLng(bounds.getNorthEast()).wrap();
		var bbox = south_west.lng+','+south_west.lat+','+north_east.lng+','+north_east.lat;
		var query_url = W_API.api_url + "/maps/all/within/" + bbox;
		W_API.getJSON (query_url, callback);

	},

	geoSearch: function (bounds, callback ) {

	var south_west = L.latLng(bounds.getSouthWest()).wrap();
	var north_east = L.latLng(bounds.getNorthEast()).wrap();
	var bbox = south_west.lng+','+south_west.lat+','+north_east.lng+','+north_east.lat;
	var query_url = W_API.api_url + '/geosearch/within/' + bbox;
	W_API.getJSON (query_url, callback);

	},

	textSearch: function (bounds, callback ) {
		W_API.alert('negative', 'Text search not implemented yet!');
	},

	getJSON: function(url, callback) {
		var request = $.ajax({
		  url: url,
		  method: 'GET',
		  dataType: "json"
		});

		request.done(function(data) {
		  callback(data);
		});

		request.fail(function() {
		  W_API.alert('negative', 'The Warper seams to be offline.');
		});
	},

	alert: function(type, message) {
		var validAlertTypes = ['progressive', 'negative', 'default'];
		console.log(validAlertTypes.type);

		if ($.inArray(validAlertTypes, type)) {
			$('.alert-container').show();
			$('.alert-container').append('<div class="alert ' + type +'">' + message + '</div>');
			setTimeout(function() {
				$('.alert-container .alert').first().remove();
				$('.alert-container').hide();
			}, 6000);
		} else {
			console.log('invalid alert type');
		}
	  }

}
