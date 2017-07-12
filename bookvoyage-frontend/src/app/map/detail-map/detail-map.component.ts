import { Component, OnInit } from '@angular/core';
import {AddBookInstancesOptions, MapService, Coordinates} from "../map.service";
import {GeoLocationService} from "../geo-location.service";
import {AuthService} from "../../auth/auth.service";
import {Router} from "@angular/router";

function getOrdinal(n) {
  if((parseFloat(n) == parseInt(n)) && !isNaN(n)){
    var s=["th","st","nd","rd"],
      v=n%100;
    return n+(s[(v-20)%10]||s[v]||s[0]);
  }
  return n;
}

@Component({
  selector: 'app-detail-map',
  templateUrl: './detail-map.component.html',
  styleUrls: ['./detail-map.component.css'],
  providers: [GeoLocationService]
})
export class DetailMapComponent implements OnInit {
  mainMap;
  currentHolder = '';
  loading = false;
  locationPicked = false;
  webGeoWait = false;
  locationFinal = false;

  constructor(private mapService: MapService,
              private geoLocationService: GeoLocationService,
              private authService: AuthService,
              private router: Router) { }

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
    this.mapService.holdingAmount$.subscribe(
      (amount: number) => {
        this.currentHolder = getOrdinal(amount+1);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  markerByAddress() {
    this.loading = true;
    let address = window.prompt("Fill in the city you took the book to:","");
    if (address) {
      this.geoLocationService.addressToCoord(address).subscribe(
        (coordinates) => {
          this.loading = false;
          this.locationPicked = true;
          this.mapService.addCustomMarker(this.mainMap, coordinates, true);
        },
        (error) => {
          alert("Geolocation failed - did you type that correctly?");
          this.loading = false;
        }
      )
    } else {
      this.loading = false;
    }
  }

  markerByGeo() {
    if(navigator.geolocation){
      this.loading = true;
      this.webGeoWait = true;
      navigator.geolocation.getCurrentPosition(
        (location) => {
          let coordinates: Coordinates = {
            lat: location.coords.latitude,
            lng: location.coords.longitude
          };
          this.mapService.addCustomMarker(this.mainMap, coordinates, true);
          this.loading = false;
          this.webGeoWait = false;
          this.locationPicked = true;
        },
        (error) => {
          alert("Geolocation failed - please try again or locate by city.");
          this.loading = false;
          this.webGeoWait = false;
        }
      );
    }
  }

  reset() {
    this.loading = false;
    this.locationPicked = false;
    this.webGeoWait = false;
    this.mapService.resetCustomMarker(this.mainMap);
  }

  continue() {
    this.authService.setHoldingLocation(this.mapService.getCustomMarkerCoords(this.mainMap));
    this.locationFinal = true;

    // call final animation
    this.mapService.bookInstanceAddedAnimation(this.mainMap);
  }

  complete() {
    this.router.navigate(['/']);
  }
}
