import { Component, OnInit } from '@angular/core';
import {AddBookInstancesOptions, MapService, Coordinates} from "../map.service";
import {GeoLocationService} from "../geo-location.service";

@Component({
  selector: 'app-detail-map',
  templateUrl: './detail-map.component.html',
  styleUrls: ['./detail-map.component.css'],
  providers: [GeoLocationService]
})
export class DetailMapComponent implements OnInit {
  mainMap;

  constructor(private mapService: MapService,
              private geoLocationService: GeoLocationService) { }

  ngOnInit() {
    // render basic map
    this.mainMap = this.mapService.renderMap('mainMap');

    // create options array
    let bookInstanceOptions: AddBookInstancesOptions = {
      addHolders: true,
      addOwners: true,
      drawLines: true
    };
    // Loads book instance
    let bookInstance = this.mapService.addBookInstance(this.mainMap, 2, bookInstanceOptions);

    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        (location) => {
          let coordinates: Coordinates = {
            lat: location.coords.latitude,
            lon: location.coords.longitude
        };
          this.mapService.addCustomMarker(this.mainMap, coordinates, true);
        },
        (error) => {
          console.log("error");
          alert("Geolocation failed - please try again or add a location manually.");
        }
      );
    }
  }

  markerByAddress() {
    this.geoLocationService.addressToCoord("Utrecht").subscribe(
      (coordinates) => {
        this.mapService.addCustomMarker(this.mainMap, coordinates, true);
      },
      (error) => {
        console.log(error);
      }
    )
  }

}
