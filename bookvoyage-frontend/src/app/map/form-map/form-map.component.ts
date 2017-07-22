import {Component, OnDestroy, OnInit} from '@angular/core';
import {AddBookInstancesOptions, MapService, Coordinates} from "../map.service";
import {GeoLocationService} from "../geo-location.service";
import {AuthService} from "../../auth/auth.service";
import {Router, ActivatedRoute, Params} from "@angular/router";
import {BookService} from "../../book/book.service";
import {NgForm} from "@angular/forms";
import {MetaService} from "@ngx-meta/core";
import {getOrdinal} from "../../shared/get-ordinal.function"

@Component({
  selector: 'app-detail-map',
  templateUrl: './form-map.component.html',
  styleUrls: ['../../shared/checkbox-style.css',
    './form-map.component.css',
    ]
})
export class FormMapComponent implements OnInit, OnDestroy {
  mainMap;

  // Counts
  currentHolder = '';
  owningAmount = -1;

  // Form state
  formPhase: number = 1;
  loading = false;
  webGeoWait = false;

  // Preferences
  alreadyActivated: boolean;
  anonymous: boolean;
  mail_updates: boolean;

  geoLocateSubscriber;
  userMessage: string = "";
  bookId: number;
  consentBox: boolean;
  preferenceError: string = '';



  // TODO: store preferences locally as well, to save calls
  initiateUserPreferences() {
    this.authService.getUserPreferences().subscribe(
      (response: Response) => {
        let preferences = response.json();
        this.mail_updates = preferences['mail_updates'];
        this.anonymous = preferences['anonymous'];
        if (preferences['activated']) {
          this.alreadyActivated = true;
          this.consentBox = true;
        }

      },
      (errorData) => {
        console.log(errorData);
      }
    )
  }

  constructor(private mapService: MapService,
              private geoLocationService: GeoLocationService,
              private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              private bookService: BookService,
              private readonly meta: MetaService) { }

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
      drawLines: true,
      addBatch: true
    };

    // get book instance id from params (not from auth service, to avoid number confusion)
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
          this.mapService.addBookInstance(this.mainMap, bookId, bookInstanceOptions);
          this.mapService.holdingAmount$.subscribe(
            (amount: number) => {
              this.currentHolder = getOrdinal(amount+1);
            },
            (error) => {
              console.log(error);
            }
          );
          this.mapService.owningAmount$.subscribe(
            (amount: number) => {
              this.owningAmount = amount;
            },
            (error) => {
              console.log(error);
            }
          );
        }
      );

    // Load user preferences
    this.initiateUserPreferences();
    this.meta.setTitle("Continue Journey #" + this.authService.getBookId());
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

  submitPreferences(form: NgForm) {
    this.authService.updateUserPreferences(this.anonymous, this.mail_updates, this.consentBox).subscribe(
      (preferences: Response) => {
        this.anonymous = preferences['anonymous'];
        this.mail_updates = preferences['mail_updates'];
      },
      (errorData) => {
        this.preferenceError = JSON.stringify(errorData);
        return;
      }
    );
    this.formPhase = 4;
  }

  submitMessage(form: NgForm) {
    this.userMessage = form.value['message'];

    let currentMarkerLocation = this.mapService.getCustomMarkerCoords(this.mainMap);
    this.bookService.postBookHolding(this.userMessage, currentMarkerLocation, this.authService.getBookId(), this.authService.getAccessCode()).subscribe(
      (success) => {
        this.formPhase = 5;
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
