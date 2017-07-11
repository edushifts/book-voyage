import { Component, OnInit } from '@angular/core';
import {environment} from "../../environments/environment";
import {ActivatedRoute} from "@angular/router";
import {HeaderService} from "../header/header.service";
import { Observable } from 'rxjs';
import {Http, Response} from "@angular/http";

// prevents Typescript errors with leaflet
declare let L: any;

function rainbow(numOfSteps, step) {
  // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
  // Adam Cole, 2011-Sept-14
  // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
  let r, g, b;
  let h = step / numOfSteps;
  let i = ~~(h * 6);
  let f = h * 6 - i;
  let q = 1 - f;
  switch(i % 6){
    case 0: r = 1; g = f; b = 0; break;
    case 1: r = q; g = 1; b = 0; break;
    case 2: r = 0; g = 1; b = f; break;
    case 3: r = 0; g = q; b = 1; break;
    case 4: r = f; g = 0; b = 1; break;
    case 5: r = 1; g = 0; b = q; break;
  }
  let c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
  return (c);
}

@Component({
  selector: 'app-overview-map',
  templateUrl: './overview-map.component.html',
  styleUrls: ['./overview-map.component.css']
})
export class OverviewMapComponent implements OnInit {
  wrongCode = false;

  constructor(private route: ActivatedRoute,
              private headerService: HeaderService,
              private http: Http) { }

  getBookInstances() {
    return this.http.get(environment.apiUrl + "api/bookInstances/")
      .map(
        (response: Response) => {
          // on success, return all book instances
          return response.json();
        }
      )
      .catch(
        (error: Response) => {
          return Observable.throw(error);
        });
  }

  getBookInstance(id: number) {
    return this.http.get(environment.apiUrl + "api/bookInstances/")
      .map(
        (response: Response) => {
          // on success, return book instances with given id
          return response.json()[id];
        }
      )
      .catch(
        (error: Response) => {
          return Observable.throw(error);
        });
  }

  getBookBatches() {
    return this.http.get(environment.apiUrl + "api/bookBatches/")
      .map(
        (response: Response) => {
          return response.json();
        }
      )
      .catch(
        (error: Response) => {
          return Observable.throw(error);
        });
  }

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
        });

    // Define maximum map bounds (to avoid moving off the map)
    let bounds = new L.LatLngBounds(new L.LatLng(85, -180), new L.LatLng(-85, 180));

    // Initate Leaflet map, including initial location and scale
    let mainMap = L.map('mainMap', {
      worldCopyJump: true,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0
    }).setView([51.505, -0.09], 3);

    // Connect to the map tile provider and add tiles to the map
    let Stamen_Watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
      attribution: 'Map tiles by <a href="https://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: 'abcd',
      minZoom: 2,
      maxZoom: 16,
      ext: 'png',
    }).addTo(mainMap);

    this.getBookBatches().subscribe(
      (bookBatches) => {
        // define icon for marker
        let orangeIcon = L.icon({
          iconUrl:  environment.assetRoot +  'img/icons/marker-icon_orange.png',
          shadowUrl: environment.assetRoot +  'img/icons/marker-shadow.png',

          //iconSize:     [38, 95], // size of the icon
          //shadowSize:   [50, 64], // size of the shadow
          iconAnchor:   [14, 40], // point of the icon which will correspond to marker's location
          //shadowAnchor: [4, 62],  // the same for the shadow
          //popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
        });

        for (let bookBatch of bookBatches) {

          let batchLocation = bookBatch.location.map(a => a.coordinates)[0].reverse();

          // render marker
          let batchMarker = L.marker(batchLocation, {icon: orangeIcon}).addTo(mainMap);

          // add event details
          batchMarker.bindPopup("<b>Event: " + bookBatch.event + "</b><br>" + bookBatch.country + "<br>" + bookBatch.date);
        }
      },
      (errorData) => {
        console.log("Error loading book locations: " + errorData);
      });

    // Loads marker locations, displays locations on map and
    // performs onEachFeature function on each
    this.getBookInstances().subscribe(
      (bookInstances) => {

        let bookId = 0;
        // look at each book location provided by the api
        for (let bookInstance of bookInstances) {

          // define icon for marker
          let blueIcon = L.icon({
            iconUrl:  environment.assetRoot +  'img/icons/marker-icon.png',
            shadowUrl: environment.assetRoot +  'img/icons/marker-shadow.png',

            //iconSize:     [38, 95], // size of the icon
            //shadowSize:   [50, 64], // size of the shadow
            iconAnchor:   [14, 40], // point of the icon which will correspond to marker's location
            //shadowAnchor: [4, 62],  // the same for the shadow
            //popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
          });

          // define icon for marker
          let greenIcon = L.icon({
            iconUrl:  environment.assetRoot +  'img/icons/marker-icon_green.png',
            shadowUrl: environment.assetRoot +  'img/icons/marker-shadow.png',

            //iconSize:     [38, 95], // size of the icon
            //shadowSize:   [50, 64], // size of the shadow
            iconAnchor:   [14, 40], // point of the icon which will correspond to marker's location
            //shadowAnchor: [4, 62],  // the same for the shadow
            //popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
          });

          // store book instance batch location to draw lines later on
          let batchLocation = bookInstance.batch.location.map(a => a.coordinates)[0].reverse();

          // create array to hold marker locations to draw polyline between them
          let holdingLocations = [];

          // initiate with batch location
          holdingLocations.push(batchLocation);

          // place all holder data on map of this instance
          for (let bookHolding of bookInstance.holdings) {
            let holdingLocation = bookHolding.location.map(a => a.coordinates)[0].reverse();
            let holdingMarker = L.marker(holdingLocation, {icon: blueIcon}).addTo(mainMap);

            // add pop-up message
            // TODO: change requisites
            if (holdingLocation) {

              // TO-DO: check if anonymous
              holdingMarker.bindPopup("<b>" + bookHolding.holder.first_name + " " + bookHolding.holder.last_name + "</b><br>" + bookHolding.message + "<br>" + bookHolding.time);
            }
              holdingLocations.push(holdingLocation);
          }

          // place the (last) owner on the map of this instance
          // get amount of owners
          let bookOwningAmount = bookInstance.ownings.length;
          if (bookOwningAmount !== 0) {
            let currentOwning = bookInstance.ownings[bookOwningAmount-1];
            // console.log(currentOwning);
            let owningLocation = currentOwning.location.map(a => a.coordinates)[0].reverse();
            let owningMarker = L.marker(owningLocation, {icon: greenIcon}).addTo(mainMap);


            // add pop-up message
            // TODO: change requisites
            if (owningLocation) {
              // TO-DO: check if anonymous
              owningMarker.bindPopup("<b>" + currentOwning.owner.first_name + " " + currentOwning.owner.last_name + "</b><br>" + currentOwning.message + "<br>" + currentOwning.time);
            }
          }

          // define line color with book instance id and then draw it
          let lineColor = rainbow((bookId + 1)*10, 1);
          let polyline = L.polyline(holdingLocations, {color: lineColor}).addTo(mainMap);

          // TODO: Fix this; it has an import issue
          // // add directional arrow to polyline
          // L.polylineDecorator(polyline, {
          //   patterns: [
          //     {
          //       offset: '50%',
          //       repeat: 0,
          //       symbol: L.Symbol.arrowHead({pixelSize: 15, polygon: false, pathOptions: {stroke: true, color: lineColor}})
          //     }
          //   ]
          // }).addTo(mainMap);

          bookId++;
        }
      },
      (errorData) => {
        console.log("Error loading book locations: " + errorData);
      });
  }
}
