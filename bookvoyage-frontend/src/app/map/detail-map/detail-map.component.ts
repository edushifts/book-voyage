import { Component, OnInit } from '@angular/core';
import {AddBookInstancesOptions, MapService, Coordinates} from "../map.service";

@Component({
  selector: 'app-detail-map',
  templateUrl: './detail-map.component.html',
  styleUrls: ['./detail-map.component.css']
})
export class DetailMapComponent implements OnInit {

  constructor(private mapService: MapService) { }

  ngOnInit() {
    // render basic map
    let mainMap = this.mapService.renderMap('mainMap');

    // create options array
    let bookInstanceOptions: AddBookInstancesOptions = {
      addHolders: true,
      addOwners: true,
      drawLines: true
    };
    // Loads book instance
    let bookInstance = this.mapService.addBookInstance(mainMap, 2, bookInstanceOptions);

    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        (location) => {
          let coordinates: Coordinates = {
            lat: location.coords.latitude,
            lon: location.coords.longitude
        };
          this.mapService.addCustomMarker(mainMap, coordinates, true);
        },
        (error) => {
          console.log("error");
          alert("Geolocation failed - please try again or add a location manually.");
        }
      );
    }
  }

}
