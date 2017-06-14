var geoData = {};

// Define maximum map bounds (to avoid moving off the map)
bounds = new L.LatLngBounds(new L.LatLng(85, -180), new L.LatLng(-85, 180));

// Initate Leaflet map, including initial location and scale
var mainMap = L.map('mainMap', {
	worldCopyJump: true,
	maxBounds: bounds,
	maxBoundsViscosity: 1.0
}).setView([51.505, -0.09], 3);

// Connect to the map tile provider and add tiles to the map
var Stamen_Watercolor = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	subdomains: 'abcd',
	minZoom: 3,
	maxZoom: 16,
	ext: 'png',
}).addTo(mainMap);

// Loads geojson file, displays locations on map and
// performs onEachFeature function on each
// mainMap.addLayer(layer);
// $.getJSON(location.origin + "/api/bookLocs.geojson", function (data) {
//     layer.addData(data);
//     //console.log(bookLocations.features[1].id);
// });

$.ajax({
	dataType: "json",
	url: location.origin + "/api/bookLocs.geojson",
	success: function(data) {
		geoData.markers = [];
		geoData.holder = [];
		geoData.book_instance = [];
		$.each(data.features, function(i, obj) {
    		var currentMarker = new L.marker([obj.geometry.coordinates[1], obj.geometry.coordinates[0]]);
   			
   			// add message if available
		    if (obj.properties.message) {
		        currentMarker.bindPopup("<b>NAME PERSON</b><br>" + obj.properties.message + "<br>" + obj.properties.time );
		    }

   			geoData.markers.push(currentMarker);
   			geoData.holder.push(obj.properties.holder)
   			geoData.book_instance.push(obj.properties.book_instance)

    		var newLayer = mainMap.addLayer(geoData.markers[i]);




    		// check if previous holding was of same book
    		// if so, draw line between them
    		if (geoData.book_instance[i] == geoData.book_instance[i-1]) {
    			    var latlngs = Array();
    			    latlngs.push(geoData.markers[i-1].getLatLng());
    			    latlngs.push(geoData.markers[i].getLatLng());
    			    color=rainbow(geoData.book_instance[i], 10);

				    var polyline = L.polyline(latlngs, {color: color}).addTo(mainMap);
				    var arrowHead = L.polylineDecorator(polyline, {
					    patterns: [
					        {
					            offset: '50%',
					            repeat: 0,
					            symbol: L.Symbol.arrowHead({pixelSize: 15, polygon: false, pathOptions: {stroke: true, color: color}})
					        }
					    ]
					}).addTo(mainMap);
    		}
    	});
	}
});

function rainbow(numOfSteps, step) {
    // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
    // Adam Cole, 2011-Sept-14
    // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
    var r, g, b;
    var h = step / numOfSteps;
    var i = ~~(h * 6);
    var f = h * 6 - i;
    var q = 1 - f;
    switch(i % 6){
        case 0: r = 1; g = f; b = 0; break;
        case 1: r = q; g = 1; b = 0; break;
        case 2: r = 0; g = 1; b = f; break;
        case 3: r = 0; g = q; b = 1; break;
        case 4: r = f; g = 0; b = 1; break;
        case 5: r = 1; g = 0; b = q; break;
    }
    var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
    return (c);
}