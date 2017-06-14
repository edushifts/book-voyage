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

// Defines what happens when each location is loaded
function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.message) {
        layer.bindPopup("<b>NAME PERSON</b><br>" + feature.properties.message);
    }
}

// Loads geojson file, displays locations on map and
// performs onEachFeature function on each
$.ajax({
dataType: "json",
url: location.origin + "/api/bookLocs.geojson",
success: function(data) {
	L.geoJSON(data, {
	    onEachFeature: onEachFeature
	}).addTo(mainMap);
}
}).error(function() {});