import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { HeaderService } from "../../header/header.service";
import { MapService, AddBookInstancesOptions } from "../map.service";
import { environment } from "../../../environments/environment";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-overview-map',
  templateUrl: './overview-map.component.html',
  styleUrls: ['./overview-map.component.css'],
})
export class OverviewMapComponent implements OnInit {

  constructor(private route: ActivatedRoute,
              private headerService: HeaderService,
              private mapService: MapService,
              private translate: TranslateService) { }

  ngOnInit() {
    this.headerService.showAccountButtons = true;
    this.route
      .queryParams
      .subscribe(params => {
        if (+params['error'] === 1) {
          this.translate.get('ERROR_WRONG_CODE').subscribe(
            (message: string) => {
              alert(message);
            });
        } else if (+params['error'] === 2) {
          this.translate.get('ERROR_SESSION_EXPIRED').subscribe(
            (message: string) => {
              alert(message);
            });
        } else if (+params['error'] === 3) {
          this.translate.get('ERROR_JOURNEY_NOT_BEGUN').subscribe(
            (message: string) => {
              alert(message);
            });
        }

        if (+params['passwordReset'] === 1) {
          this.translate.get('CHECK_INBOX_RESET').subscribe(
            (message: string) => {
              alert(message);
            });
        }

        if (+params['changedEmail'] === 1) {
          this.translate.get('EMAIL_CHANGED').subscribe(
            (message: string) => {
              alert(message);
            });
        }
      });

    // render basic map
    let mainMap = this.mapService.renderMap('mainMap');

    // Add book batch markers to the map
    this.mapService.addBookBatchMarkers(mainMap);

    // create options array
    let bookInstanceOptions: AddBookInstancesOptions = {
      addHolders: true,
      addOwners: environment.showOwningsFrontpage,
      drawLines: true,
      addBatch: true
    };

    // Loads book instances
    this.mapService.addBookInstances(mainMap, bookInstanceOptions);

    // Load additional ownings
    if (environment.showUnassignedOwnings){
      this.mapService.retrieveUnassignedOwningMarkers(mainMap);
    }
  }
}
