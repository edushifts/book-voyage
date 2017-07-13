import {Component, OnDestroy, OnInit} from '@angular/core';
import {AddBookInstancesOptions, MapService, Coordinates} from "../map.service";
import {GeoLocationService} from "../geo-location.service";
import {AuthService} from "../../auth/auth.service";
import {Router, ActivatedRoute, Params} from "@angular/router";
import {BookService} from "../../book/book.service";
import {NgForm} from "@angular/forms";

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
  templateUrl: './form-map.component.html',
  styleUrls: ['./form-map.component.css'],
  providers: [GeoLocationService]
})
export class FormMapComponent implements OnInit, OnDestroy {
  mainMap;
  currentHolder = '';
  loading = false;
  webGeoWait = false;
  formPhase: number = 1;
  geoLocateSubscriber;
  userMessage: string = "";
  bookId: number;

  constructor(private mapService: MapService,
              private geoLocationService: GeoLocationService,
              private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              private bookService: BookService) { }

  ngOnDestroy() {
    if (this.geoLocateSubscriber) {
      this.geoLocateSubscriber.unsubscribe();
    }
  }

  ngOnInit() {
    // render basic map
    this.mainMap = this.mapService.renderMap('mainMap');

    // create options array
    let bookInstanceOptions: AddBookInstancesOptions = {
      addHolders: true,
      addOwners: true,
      drawLines: true
    };

    // get book instance id from auth service
    //let bookId = this.authService.getBookId();
    this.route.params
      .subscribe(
        (params: Params) => {
          let bookId = +params['id'];

          // check if bookId fits user access code
          let accessCode = this.authService.getAccessCode();

          if (accessCode !== "wrong") {
            let codeValidity = this.authService.checkCode(accessCode);
            if (!codeValidity) {
              // wrong code
              this.router.navigate([''], {queryParams: {error: 1 }});
            }
          } else {
            // no code
            this.router.navigate([''], {queryParams: {error: 2 }});
          }

          // Loads book instance
          let bookInstance = this.mapService.addBookInstance(this.mainMap, bookId, bookInstanceOptions);
          this.mapService.holdingAmount$.subscribe(
            (amount: number) => {
              this.currentHolder = getOrdinal(amount+1);
            },
            (error) => {
              console.log(error);
            }
          );
        }
      )
  }

  markerByAddress() {
    this.loading = true;
    let address = window.prompt("Fill in the city you took the book to:","");
    if (address) {
      this.geoLocateSubscriber = this.geoLocationService.addressToCoord(address).subscribe(
        (coordinates) => {
          this.loading = false;
          this.formPhase= 2;
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
          this.formPhase= 2;
        },
        (error) => {
          alert("Geolocation failed - please try again or locate by city.");
          this.loading = false;
          this.webGeoWait = false;
        }
      );
    }
  }

  submitMessage(form: NgForm) {
    this.userMessage = form.value['message'];

    let currentMarkerLocation = this.mapService.getCustomMarkerCoords(this.mainMap);
    this.bookService.postBookHolding(this.userMessage, currentMarkerLocation, this.authService.getBookId(), this.authService.getAccessCode()).subscribe(
      (success) => {
        this.formPhase = 4;
        // call final animation
        this.mapService.bookInstanceAddedAnimation(this.mainMap);

        // before removal, save book id for final link
        this.bookId = this.authService.getBookId();
        // remove the book session and local data
        this.authService.clearLocalBookData();
        this.mapService.clearCustomMarker();
      },
      (error) => {
        console.log(error);
      }
    );
  }

  reset() {
    this.loading = false;
    this.formPhase= 1;
    this.webGeoWait = false;
    this.mapService.resetCustomMarker(this.mainMap);
  }

  submitLocation() {
    this.authService.setHoldingLocation(this.mapService.getCustomMarkerCoords(this.mainMap));
    this.formPhase = 3;
  }

  complete() {
    this.router.navigate(['journey', this.bookId]);
  }
}
