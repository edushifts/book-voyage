// Initate Leaflet map, including initial location and scale
var mainMap = L.map('mainMap').setView([51.505, -0.09], 13);

// Connect to the map tile provider and add tiles to the map
var Stamen_Watercolor = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	subdomains: 'abcd',
	minZoom: 1,
	maxZoom: 16,
	ext: 'png'
}).addTo(mainMap);

// TEMPORARY - to be handled with Angular
// Add all book locations to the map without discrimination
var layer = L.geoJson();
mainMap.addLayer(layer);
$.getJSON("http://192.168.33.10:8000/api/bookLocs.geojson", function (data) {
    layer.addData(data);
    //console.log(bookLocations.features[1].id);
});