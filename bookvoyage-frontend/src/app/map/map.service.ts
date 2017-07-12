import {BookService} from "../book/book.service";
import {environment} from "../../environments/environment";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";
import {Subject} from "rxjs/Subject";

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

export interface AddBookInstancesOptions {
  addHolders: boolean;
  addOwners: boolean;
  drawLines: boolean;
}

export interface Coordinates {
  lng: number;
  lat: number;
}

@Injectable()
export class MapService {
  blueIcon;
  greenIcon;
  orangeIcon;
  PurpleIcon;

  customMarker;
  bookBounds;
  previousHolderCoords;
  controlGroup;

  holdingAmount$: Observable<number>;
  private holdingAmount = new Subject<number>();

  getControlGroup() {
    return this.controlGroup;
  }

  constructor(private bookService: BookService) {
    // make holdingAmount observable
    this.holdingAmount$ = this.holdingAmount.asObservable();


    // define icon for marker type 1
    this.blueIcon = L.icon({
      iconUrl:  environment.assetRoot +  'img/icons/marker-icon.png',
      shadowUrl: environment.assetRoot +  'img/icons/marker-shadow.png',

      //iconSize:     [38, 95], // size of the icon
      //shadowSize:   [50, 64], // size of the shadow
      iconAnchor:   [14, 40], // point of the icon which will correspond to marker's location
      //shadowAnchor: [4, 62],  // the same for the shadow
      //popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });

    // define icon for marker type 2
    this.greenIcon = L.icon({
      iconUrl:  environment.assetRoot +  'img/icons/marker-icon_green.png',
      shadowUrl: environment.assetRoot +  'img/icons/marker-shadow.png',

      //iconSize:     [38, 95], // size of the icon
      //shadowSize:   [50, 64], // size of the shadow
      iconAnchor:   [14, 40], // point of the icon which will correspond to marker's location
      //shadowAnchor: [4, 62],  // the same for the shadow
      //popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });

    // define icon for marker type 3
    this.orangeIcon = L.icon({
      iconUrl:  environment.assetRoot +  'img/icons/marker-icon_orange.png',
      shadowUrl: environment.assetRoot +  'img/icons/marker-shadow.png',

      //iconSize:     [38, 95], // size of the icon
      //shadowSize:   [50, 64], // size of the shadow
      iconAnchor:   [14, 40], // point of the icon which will correspond to marker's location
      //shadowAnchor: [4, 62],  // the same for the shadow
      //popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });

    // define icon for marker type 4
    this.PurpleIcon = L.icon({
      iconUrl:  environment.assetRoot +  'img/icons/marker-icon_purple.png',
      shadowUrl: environment.assetRoot +  'img/icons/marker-shadow.png',

      //iconSize:     [38, 95], // size of the icon
      //shadowSize:   [50, 64], // size of the shadow
      iconAnchor:   [14, 40], // point of the icon which will correspond to marker's location
      //shadowAnchor: [4, 62],  // the same for the shadow
      //popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });
  }

  renderMap(mapId: string) {

    // Define maximum map bounds (to avoid moving off the map)
    let bounds = new L.LatLngBounds(new L.LatLng(85, -180), new L.LatLng(-85, 180));

    // Initiate Leaflet map, including initial location and scale
    let map = L.map(mapId, {
      worldCopyJump: true,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0
    }).setView([30, 0], 2);

    // Connect to the map tile provider and add tiles to the map
    // To save resources, only on tileLayer is instantiated in one session
    L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
      attribution: 'Map tiles by <a href="https://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: 'abcd',
      minZoom: 2,
      maxZoom: 9,
      ext: 'png',
    }).addTo(map);

    return map;
  }

  addCustomMarker(map, coords: Coordinates, zoom: boolean) {
    this.customMarker = L.marker(coords, {icon: this.PurpleIcon}).addTo(map);

    this.customMarker .bindPopup("This is you!");
    if (zoom) {
      map.flyTo(this.customMarker.getLatLng(), 9);
    }
  }

  resetCustomMarker(map) {
    this.customMarker.removeFrom(map);
    map.flyToBounds(this.bookBounds);
  }

  getCustomMarkerCoords<Coordinates>(map) {
    return this.customMarker._latlng;
  }

  addBookBatchMarkers(mainMap) {
    this.bookService.getBookBatches().subscribe(
      (bookBatches) => {

        let batchMarkers = [];

        for (let bookBatch of bookBatches) {

          let batchLocation = bookBatch.location.map(a => a.coordinates)[0].reverse();

          // render marker
          let batchMarker = L.marker(batchLocation, {icon: this.orangeIcon});

          // add event details
          batchMarker.bindPopup("<b>Event: " + bookBatch.event + "</b><br>" + bookBatch.country + "<br>" + '<span class="popup-date">' + bookBatch.date + '</span>');

          batchMarkers.push(batchMarker);
        }
        L.layerGroup(batchMarkers).addTo(mainMap);
      },
      (errorData) => {
        console.log("Error loading book locations: " + errorData);
      });
  }

  addBookInstances(mainMap, options?: AddBookInstancesOptions) {
    // read optional options array and pass default values if lacking
    let addHolders = options && options.addHolders !== null ? options.addHolders : true;
    let addOwners = options && options.addOwners !== null ? options.addOwners : true;
    let drawLines = options && options.drawLines !== null ? options.drawLines : true;

    let overlayMaps = {};

    this.bookService.getBookInstances().subscribe(
      (bookInstances) => {

        let bookId = 0;

        // look at each book location provided by the api
        for (let bookInstance of bookInstances) {

          // create variables to store book instance features
          let bookHoldings = [];
          let bookLines = [];
          let bookOwnings = [];

          if (addHolders) {
            // store book instance batch location to draw lines later on
            // create array to hold marker locations to draw polyline between them
            let holdingLocations = [];

            if (bookInstance.batch) {
              let batchLocation = bookInstance.batch.location.map(a => a.coordinates)[0].reverse();

              // initiate holdingLocations with batch location
              holdingLocations.push(batchLocation);
            }

            // place all holder data on map of this instance
            for (let bookHolding of bookInstance.holdings) {
              let holdingLocation = bookHolding.location.map(a => a.coordinates)[0].reverse();
              let holdingMarker = L.marker(holdingLocation, {icon: this.blueIcon});

              // add pop-up message
              if (holdingLocation) {

                holdingMarker.bindPopup("<b>" + bookHolding.holder.first_name + " " + bookHolding.holder.last_name + "</b><br>" + bookHolding.message + "<br>" + '<span class="popup-date">' + bookHolding.time + '</span>');
              }
              holdingLocations.push(holdingLocation);

              bookHoldings.push(holdingMarker);

            }

            if (drawLines) {
              // define line color with book instance id and then draw it
              let lineColor = rainbow((bookId + 1)*10, 1);
              let bookLine = L.polyline(holdingLocations, {color: lineColor});

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
              bookLines.push(bookLine);
            }
          }

          // place the (last) owner on the map of this instance
          // get amount of owners
          if (addOwners) {
            let bookOwningAmount = bookInstance.ownings.length;
            if (bookOwningAmount !== 0) {
              let currentOwning = bookInstance.ownings[bookOwningAmount - 1];
              // console.log(currentOwning);
              let owningLocation = currentOwning.location.map(a => a.coordinates)[0].reverse();
              let owningMarker = L.marker(owningLocation, {icon: this.greenIcon});

              // add pop-up message
              // TODO: change requisites
              if (owningLocation) {
                // TO-DO: check if anonymous
                owningMarker.bindPopup("<b>" + currentOwning.owner.first_name + " " + currentOwning.owner.last_name + "</b><br>" + currentOwning.message + "<br>" + '<span class="popup-date">' + currentOwning.time + '</span>');
              }
              bookOwnings.push(owningMarker);
            }
          }

          // create layer group for current book and add to map
          let bookLayer = bookHoldings.concat(bookOwnings).concat(bookLines);
          let bookLayerGroup = L.layerGroup(bookLayer);
          bookLayerGroup.addTo(mainMap);
          overlayMaps["book #" + bookInstance.id] = bookLayerGroup;

          bookId++;
        }
        // create layer controls for all books and add to the map
        // turned off for now
        // this.controlGroup = L.control.layers(overlayMaps).addTo(mainMap);
      },
      (errorData) => {
        console.log("Error loading book locations: " + errorData);
      });
  }

  addBookInstance(map, id, options?: AddBookInstancesOptions) {
    // read optional options array and pass default values if lacking
    let addHolders = options && options.addHolders !== null ? options.addHolders : true;
    let addOwners = options && options.addOwners !== null ? options.addOwners : true;
    let drawLines = options && options.drawLines !== null ? options.drawLines : true;

    this.bookService.getBookInstance(id).subscribe(
      (bookInstance) => {

        // create variables to store book instance features
        let bookHoldings = [];
        let bookLines = [];
        let bookOwnings = [];
        let batch;

        // report the total amount of holders
        let holdingAmount = bookInstance.holdings.length;
        this.holdingAmount.next(holdingAmount);

        if (addHolders) {
          // create array to hold marker locations to draw polyline between them
          let holdingLocations = [];

          // render book instance batch location if available
          if (bookInstance.batch) {
            let batchLocation = bookInstance.batch.location.map(a => a.coordinates)[0].reverse();
            let batchMarker = L.marker(batchLocation, {icon: this.orangeIcon}).addTo(map);
            batchMarker.bindPopup("<b>Event: " + bookInstance.batch.event + "</b><br>" + bookInstance.batch.country + "<br>" + '<span class="popup-date">' + bookInstance.batch.date + '</span>');
            batch = (batchMarker);

            // initiate holdingLocations with batch location
            holdingLocations.push(batchLocation);

            if (holdingAmount === 0) {
              // store the batch coordinates for the final animation
              let previousHolder = batchMarker;
              this.previousHolderCoords = {
                lat: previousHolder._latlng.lat,
                lng: previousHolder._latlng.lng
              };
            }
          }

          // check if user is first holder. If so, skip loading them
          if (holdingAmount !== 0) {
            // store the final holder coordinates for the final animation
            let previousHolder = bookInstance.holdings[holdingAmount - 1];
            this.previousHolderCoords = {
              lat: previousHolder.location[0].coordinates[1],
              lng: previousHolder.location[0].coordinates[0]
            };

            // place all holder data on map of this instance
            for (let bookHolding of bookInstance.holdings) {
              let holdingLocation = bookHolding.location.map(a => a.coordinates)[0].reverse();
              let holdingMarker = L.marker(holdingLocation, {icon: this.blueIcon}).addTo(map);

              // add pop-up message
              if (holdingLocation) {

                holdingMarker.bindPopup("<b>" + bookHolding.holder.first_name + " " + bookHolding.holder.last_name + "</b><br>" + bookHolding.message + "<br>" + '<span class="popup-date">' + bookHolding.time + '</span>');
              }
              holdingLocations.push(holdingLocation);

              bookHoldings.push(holdingMarker);
            }

            if (drawLines) {
              // define line color with book instance id and then draw it
              let lineColor = rainbow((id + 1) * 10, 1);
              let bookLine = L.polyline(holdingLocations, {color: lineColor}).addTo(map);

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
              bookLines.push(bookLine);
            }
          }
        }

        // place the (last) owner on the map of this instance
        // get amount of owners
        if (addOwners) {
          let bookOwningAmount = bookInstance.ownings.length;
          if (bookOwningAmount !== 0) {
            let currentOwning = bookInstance.ownings[bookOwningAmount - 1];
            // console.log(currentOwning);
            let owningLocation = currentOwning.location.map(a => a.coordinates)[0].reverse();
            let owningMarker = L.marker(owningLocation, {icon: this.greenIcon}).addTo(map);

            // add pop-up message
            // TODO: change requisites
            if (owningLocation) {
              // TO-DO: check if anonymous
              owningMarker.bindPopup("<b>" + currentOwning.owner.first_name + " " + currentOwning.owner.last_name + "</b><br>" + currentOwning.message + "<br>" + '<span class="popup-date">' + currentOwning.time + '</span>');
            }
            bookOwnings.push(owningMarker);
          }
        }

        // create layer group for current book and add to map
        let bookLayer = bookHoldings.concat(bookOwnings).concat(bookLines).concat(batch);

        if (bookLayer[0]) {
          let bookFeatureGroup = L.featureGroup(bookLayer);
          this.bookBounds = bookFeatureGroup.getBounds();
          map.flyToBounds(this.bookBounds);
          bookFeatureGroup.addTo(map);
        }
      },
      (errorData) => {
        console.log("Error loading book locations: " + errorData);
      });
  }

  bookInstanceAddedAnimation(map) {
    if (this.previousHolderCoords) {
      L.polyline([this.previousHolderCoords, this.customMarker._latlng], {color: "black"}).addTo(map);
      map.flyTo([20, 0], 2);
    }
  }
}
