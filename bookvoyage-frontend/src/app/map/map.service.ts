import { BookService } from "../book/book.service";
import { environment } from "../../environments/environment";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { rainbow } from "../shared/rainbow.function";

// prevents Typescript errors with leaflet
declare let L: any;

export interface AddBookInstancesOptions {
  addHolders: boolean;
  addOwners: boolean;
  drawLines: boolean;
  addBatch: boolean;
}

export interface Coordinates {
  lng: number;
  lat: number;
}
/**
 * NOTE: order of map markers is determined by z-indices
 *
 * Z-INDICES IN USE:
 * Book ownings waiting: 5000
 * Holdings+ownings+polylines: 6000
 * Batches: 7000
 *
 */
@Injectable()
export class MapService {
  blueIcon;
  greenIcon;
  orangeIcon;
  purpleIcon;
  darkGreenIcon;

  customMarker;
  bookBounds;
  previousHolderCoords: Coordinates;

  holdingAmount$: Observable<number>;
  owningAmount$: Observable<number>;
  private holdingAmount = new Subject<number>();
  private owningAmount = new Subject<number>();

  clearCustomMarker() {
    this.customMarker = null;
  }

  constructor(private bookService: BookService) {
    // make holdingAmount observable
    this.holdingAmount$ = this.holdingAmount.asObservable();
    this.owningAmount$ = this.owningAmount.asObservable();

    let roundAchorSize = [21, 21];
    let roundIconAnchor = [10, 10];
    let roundPopupAnchor = [0, -14];

    // define icon for marker type 1
    this.blueIcon = L.icon({
      iconUrl:  environment.assetRoot +  'img/icons/marker-icon_round.png',
      // shadowUrl: environment.assetRoot +  'img/icons/marker-shadow.png',

      iconSize:     roundAchorSize, // size of the icon
      //shadowSize:   [50, 64], // size of the shadow
      iconAnchor:   roundIconAnchor, // point of the icon which will correspond to marker's location
      // shadowAnchor: [0, 0],  // the same for the shadow
      popupAnchor:  roundPopupAnchor // point from which the popup should open relative to the iconAnchor
    });

    // define icon for marker type 2
    this.greenIcon = L.icon({
      iconUrl:  environment.assetRoot +  'img/icons/marker-icon_green_round.png',
      // shadowUrl: environment.assetRoot +  'img/icons/marker-shadow.png',

      iconSize:     roundAchorSize, // size of the icon
      //shadowSize:   [50, 64], // size of the shadow
      iconAnchor:   roundIconAnchor, // point of the icon which will correspond to marker's location
      // shadowAnchor: [0, 0],  // the same for the shadow
      popupAnchor:  roundPopupAnchor // point from which the popup should open relative to the iconAnchor
    });

    // define icon for marker type 3
    this.orangeIcon = L.icon({
      iconUrl:  environment.assetRoot +  'img/icons/marker-icon_orange_round.png',
      // shadowUrl: environment.assetRoot +  'img/icons/marker-shadow.png',

      iconSize:     roundAchorSize, // size of the icon
      //shadowSize:   [50, 64], // size of the shadow
      iconAnchor:   roundIconAnchor, // point of the icon which will correspond to marker's location
      // shadowAnchor: [0, 0],  // the same for the shadow
      popupAnchor:  roundPopupAnchor // point from which the popup should open relative to the iconAnchor
    });

    // define icon for marker type 4
    this.purpleIcon = L.icon({
      iconUrl:  environment.assetRoot +  'img/icons/marker-icon_purple.png',
      shadowUrl: environment.assetRoot +  'img/icons/marker-shadow.png',

      //iconSize:     [38, 95], // size of the icon
      //shadowSize:   [50, 64], // size of the shadow
      iconAnchor:   [14, 40], // point of the icon which will correspond to marker's location
      //shadowAnchor: [4, 62],  // the same for the shadow
      //popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });

    // define icon for marker type 5
    this.darkGreenIcon = L.icon({
      iconUrl:  environment.assetRoot +  'img/icons/marker-icon_darkgreen_round.png',
      // shadowUrl: environment.assetRoot +  'img/icons/marker-shadow.png',

      iconSize:     roundAchorSize, // size of the icon
      //shadowSize:   [50, 64], // size of the shadow
      iconAnchor:   roundIconAnchor, // point of the icon which will correspond to marker's location
      // shadowAnchor: [0, 0],  // the same for the shadow
      popupAnchor:  roundPopupAnchor // point from which the popup should open relative to the iconAnchor
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
    }).setView([30, 0], 3);

    // Set zoom levels
    let minZoom = 2;
    let maxZoom = 14;

    // Connect to the map tile provider and add tiles to the map
    // To save resources, only on tileLayer is instantiated in one session
    L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
      attribution: 'Map tiles by <a href="https://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: 'abcd',
      minZoom: minZoom,
      maxZoom: maxZoom,
      ext: 'png',
    }).addTo(map);

    L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_only_labels/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://carto.com/attribution">CARTO</a>',
      // Also made possible by openstreetmap.org
      minZoom: minZoom,
      maxZoom: maxZoom
    }).addTo(map);

    return map;
  }

  addCustomMarker(map, coords: Coordinates, zoom: boolean) {
    this.customMarker = L.marker(coords, {icon: this.purpleIcon}).addTo(map);

    this.customMarker .bindPopup("This is you!");
    if (zoom) {
      map.flyTo(this.customMarker.getLatLng(), 12);
    }
  }

  resetCustomMarker(map) {
    this.customMarker.removeFrom(map);
    map.flyToBounds(this.bookBounds);
  }

  getCustomMarkerCoords<Coordinates>(map) {
    return this.customMarker._latlng;
  }

  addBookBatchMarkers(map) {
    this.bookService.getBookBatches().subscribe(
      (bookBatches) => {

        let batchMarkers = [];

        for (let bookBatch of bookBatches) {

          let batchLocation: Coordinates = {
            lng: bookBatch.location[0].coordinates[0],
            lat: bookBatch.location[0].coordinates[1]
          };

          // render marker
          let batchMarker = L.marker(batchLocation, {icon: this.orangeIcon});

          // add event details
          batchMarker.bindPopup("<b>Event: " + bookBatch.event + "</b><br>" + bookBatch.country + "<br>" + '<span class="popup-date">' + bookBatch.date + '</span>');

          batchMarkers.push(batchMarker);
        }
        L.layerGroup(batchMarkers).addTo(map);
      },
      (errorData) => {
        console.log("Error loading book locations: " + errorData);
      });
  }

  retrieveUnassignedOwningMarkers(map) {
    this.bookService.getUnassignedBookOwnings().subscribe(
      (ownings) => {

        let unassignedOwnings = [];

        for (let owning of ownings) {

          let owningLocation: Coordinates = {
            lng: owning.location[0].coordinates[0],
            lat: owning.location[0].coordinates[1]
          };

          // render marker
          let owningMarker = L.marker(owningLocation, {icon: this.darkGreenIcon, zIndexOffset: -1000});

          // add pop-up message
          let journeyLink = '';
          journeyLink = ' / waiting ';

          owningMarker.bindPopup("<b>" + owning.owner.first_name + " "
            + owning.owner.last_name + "</b><br>" + owning.message
            + "<br>" + '<span class="popup-date">' + owning.time + journeyLink + '</span>');

          unassignedOwnings.push(owningMarker);
        }
        L.layerGroup(unassignedOwnings).addTo(map);
      },
      (errorData) => {
        console.log("Error loading book locations: " + errorData);
      });
  }

  addBookInstances(map, options?: AddBookInstancesOptions) {
    // read optional options array and pass default values if lacking
    let addHolders = options && options.addHolders !== null ? options.addHolders : true;
    let addOwners = options && options.addOwners !== null ? options.addOwners : true;
    let drawLines = options && options.drawLines !== null ? options.drawLines : true;
    let addBatch = options && options.addBatch !== null ? options.addBatch : true;

    let overlayMaps = {};

    if (addBatch) {
      this.addBookBatchMarkers(map);
    }

    this.bookService.getBookInstances().subscribe(
      (bookInstances) => {

        // Look at each book location provided by the api
        for (let bookInstance of bookInstances) {

          // Define variables to store book instance features
          let bookHoldings = [];
          let bookLines = [];
          let bookOwnings = [];

          if (addHolders && bookInstance.holdings) {
            // place all holder data on map of this instance
            bookHoldings = this.addHolderMarkers(bookInstance, true);

            if (drawLines) {
              bookLines = this.drawHolderLines(bookInstance, bookHoldings);
            }
          }

          // place the (last) owner on the map of this instance
          if (addOwners) {
            let owningMarker = this.addLastOwnerMarkers(bookInstance, true);
            bookOwnings.push(owningMarker);
          }

          // create layer group for current book and add to map
          let bookLayer = bookHoldings.concat(bookOwnings).concat(bookLines);
          let bookLayerGroup = L.layerGroup(bookLayer);
          bookLayerGroup.addTo(map);
          overlayMaps["book #" + bookInstance.id] = bookLayerGroup;
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
    let addBatch = options && options.addBatch !== null ? options.addBatch : true;

    this.bookService.getBookInstance(id).subscribe(
      (bookInstance) => {

        // create variables to store book instance features
        let bookHoldings = [];
        let bookLines = [];
        let bookOwnings = [];
        let batch = [];

        // report the total amount of holders and owners
        let holdingAmount = bookInstance.holdings.length;
        this.holdingAmount.next(holdingAmount);
        let owningAmount = bookInstance.ownings.length;
        this.owningAmount.next(owningAmount);

        // render book instance batch location if available/desired
        if (addBatch && bookInstance.batch) {
          let batchLocation: Coordinates = {
            lng: bookInstance.batch.location[0].coordinates[0],
            lat: bookInstance.batch.location[0].coordinates[1],
          };
          let batchMarker = L.marker(batchLocation, {icon: this.orangeIcon});
          batch = batchMarker.bindPopup("<b>Event: " + bookInstance.batch.event + "</b><br>" + bookInstance.batch.country + "<br>" + '<span class="popup-date">' + bookInstance.batch.date + '</span>');
        }

        // place all holder data on map of this instance if available/desired
        if (addHolders && bookInstance.holdings) {

          bookHoldings = this.addHolderMarkers(bookInstance, false);

          if (holdingAmount !== 0) {
            // store the final holder coordinates for the final animation
            let previousHolder = bookInstance.holdings[holdingAmount - 1];
            this.previousHolderCoords = {
              lng: previousHolder.location[0].coordinates[0],
              lat: previousHolder.location[0].coordinates[1]
            };
          }

          if (drawLines) {
            bookLines = this.drawHolderLines(bookInstance, bookHoldings);
          }
        }

        // place the (last) owner on the map of this instance
        if (addOwners) {
          let owningMarker = this.addLastOwnerMarkers(bookInstance, false);
          bookOwnings.push(owningMarker);
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

  addHolderMarkers(bookInstance, addLink) {
    let journeyLink = '';
    if (addLink) {
      journeyLink = ' / <a href="/journey/' + bookInstance.id + '/">book #' + bookInstance.id + '</a>'
    }
    let bookHoldings = [];
    for (let bookHolding of bookInstance.holdings) {
      let holdingLocation: Coordinates = {
        lng: bookHolding.location[0].coordinates[0],
        lat: bookHolding.location[0].coordinates[1]
      };
      let holdingMarker = L.marker(holdingLocation, {icon: this.blueIcon});

      let socialButton;
      if (bookHolding.holder.url) {
        socialButton = '<a class="socialButtonLink" title="' + bookHolding.holder.url + '" href="' + bookHolding.holder.url + '"><i class="socialButton fa fa-info-circle" aria-hidden="true"></i></a>';
      } else {
        socialButton = "";
      }

      // add pop-up message
      holdingMarker.bindPopup("<b>" + bookHolding.holder.first_name + " " + bookHolding.holder.last_name +
        socialButton +
        "</b><br>" + bookHolding.message +
        "<br>" +
        '<span class="popup-date">' + bookHolding.time + journeyLink + '</span>');

      bookHoldings.push(holdingMarker);
    }
    return bookHoldings;
  }

  addLastOwnerMarkers(bookInstance, addLink) {
    // get amount of owners
    let bookOwningAmount = bookInstance.ownings.length;
    if (bookOwningAmount !== 0) {
      let currentOwning = bookInstance.ownings[bookOwningAmount - 1];
      let owningLocation: Coordinates = {
        lng: currentOwning.location[0].coordinates[0],
        lat: currentOwning.location[0].coordinates[1]
      };
      let owningMarker = L.marker(owningLocation, {icon: this.greenIcon});

      // add pop-up message
      let journeyLink = '';
      if (addLink && bookInstance.holdings) {
        journeyLink = ' / <a href="/journey/' + bookInstance.id + '/">book #' + bookInstance.id + '</a>'
      }

      let socialButton;
      if (currentOwning.owner.url) {
        socialButton = '<a class="socialButtonLink" title="' + currentOwning.owner.url + '" href="' + currentOwning.owner.url + '"><i class="socialButton fa fa-info-circle" aria-hidden="true"></i></a>';
      } else {
        socialButton = "";
      }

      owningMarker.bindPopup("<b>" + currentOwning.owner.first_name + " "
        + currentOwning.owner.last_name
        + socialButton + "</b><br>" + currentOwning.message
        + "<br>" + '<span class="popup-date">' + currentOwning.time + journeyLink + '</span>');
      return owningMarker;
    }
  }

  drawHolderLines(bookInstance, holdingMarkers) {
    let batchLocation: Coordinates[] = [];
    if (bookInstance.batch) {
      // console.log(bookInstance.batch); // DEBUG
      batchLocation = [{
        lng: bookInstance.batch.location[0].coordinates[0],
        lat: bookInstance.batch.location[0].coordinates[1]
      }]
    }

    let holdingLocations = batchLocation.concat(holdingMarkers.map(function(a) {return a._latlng;}));

    // define line color with book instance id and then draw it
    let lineColor = rainbow(bookInstance.id%200, 200);
    return L.polyline(holdingLocations, {color: lineColor});
  }
}
