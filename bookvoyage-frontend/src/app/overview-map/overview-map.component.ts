import { Component, OnInit } from '@angular/core';
import {environment} from "../../environments/environment";
import {ActivatedRoute} from "@angular/router";
import {HeaderService} from "../header/header.service";

// prevents Typescript errors with leaflet and jquery
declare let L: any;
declare var $: any;

// contains all book location items
let geoDataArray = [];

// class describing a single book location
// TODO: turn into class describing book instances rather than locations or solve otherwise
class GeoData {
  id: number;
  marker;
  holder;
  book_instance;

  constructor() {
    geoDataArray.push(this);
  }
}

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

@Component({
  selector: 'app-overview-map',
  templateUrl: './overview-map.component.html',
  styleUrls: ['./overview-map.component.css']
})
export class OverviewMapComponent implements OnInit {
  geoData;
  wrongCode = false;

  constructor(private route: ActivatedRoute,
              private headerService: HeaderService) { }

  ngOnInit() {
    this.headerService.showAccountButtons = true;
    this.route
        .queryParams
        .subscribe(params => {
          if (+params['codeError'] === 1) {
            this.wrongCode = true;
            alert("The code you entered was incorrect :( ")
          } else {
            this.wrongCode = false;
            // nothing happens
          }
          if (+params['loggedIn'] === 1) {
            this.wrongCode = true;
            alert("You are logged in now.")
          } else {
            this.wrongCode = false;
            // nothing happens
          }
        })

    // Define maximum map bounds (to avoid moving off the map)
    var bounds = new L.LatLngBounds(new L.LatLng(85, -180), new L.LatLng(-85, 180));

    // Initate Leaflet map, including initial location and scale
    var mainMap = L.map('mainMap', {
      worldCopyJump: true,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0
    }).setView([51.505, -0.09], 3);

    // Connect to the map tile provider and add tiles to the map
    var Stamen_Watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
      attribution: 'Map tiles by <a href="https://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: 'abcd',
      minZoom: 3,
      maxZoom: 16,
      ext: 'png',
    }).addTo(mainMap);

    // Loads geojson file, displays locations on map and
    // performs onEachFeature function on each
    $.ajax({
      dataType: "json",
      url: environment.apiUrl + "api/bookLocs.geojson",
      success: function(data) {

        // look at each book location provided by the api
        $.each(data.features, function(i, obj) {

          // create new class for the current book
          let geoData = new GeoData();

          // define icon for marker
          var blueIcon = L.icon({
            iconUrl:  environment.assetRoot +  'img/icons/marker-icon.png',
            shadowUrl: environment.assetRoot +  'img/icons/marker-shadow.png',

            //iconSize:     [38, 95], // size of the icon
            //shadowSize:   [50, 64], // size of the shadow
            iconAnchor:   [14, 40], // point of the icon which will correspond to marker's location
            //shadowAnchor: [4, 62],  // the same for the shadow
            //popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
          });

          var currentMarker = new L.marker([obj.geometry.coordinates[1], obj.geometry.coordinates[0]], {icon: blueIcon});

          // add message if available
          if (obj.properties.message) {
            currentMarker.bindPopup("<b>NAME PERSON</b><br>" + obj.properties.message + "<br>" + obj.properties.time );
          }

          geoData.marker = currentMarker;
          geoData.holder = obj.properties.holder;
          geoData.book_instance = obj.properties.book_instance;

          var newLayer = mainMap.addLayer(geoData.marker);

          // check if previous holding was of same book
          // if so, draw line between them
          if (i != 0 && geoDataArray[i].book_instance === geoDataArray[i-1].book_instance) {
            var latlngs = Array();
            latlngs.push(geoDataArray[i-1].marker.getLatLng());
            latlngs.push(geoDataArray[i].marker.getLatLng());
            var color = rainbow(geoDataArray[i].book_instance, 10);

            var polyline = L.polyline(latlngs, {color: color}).addTo(mainMap);

            // TODO: FUNCTION CURRENTLY NOT WORKING
            // var arrowHead = L.polylineDecorator(polyline, {
            //   patterns: [
            //     {
            //       offset: '50%',
            //       repeat: 0,
            //       symbol: L.Symbol.arrowHead({pixelSize: 15, polygon: false, pathOptions: {stroke: true, color: color}})
            //     }
            //   ]
            // }).addTo(mainMap);
          }
        });
      },
      error: function() {
        console.log("Error loading map :(");
      }
    });
  }
}
