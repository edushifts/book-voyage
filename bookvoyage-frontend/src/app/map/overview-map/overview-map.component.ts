import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { HeaderService } from "../../header/header.service";
import { MapService, AddBookInstancesOptions } from "../map.service";
import { environment } from "../../../environments/environment";

@Component({
  selector: 'app-overview-map',
  templateUrl: './overview-map.component.html',
  styleUrls: ['./overview-map.component.css'],
})
export class OverviewMapComponent implements OnInit {

  constructor(private route: ActivatedRoute,
              private headerService: HeaderService,
              private mapService: MapService) { }

  ngOnInit() {
    this.headerService.showAccountButtons = true;
    this.route
      .queryParams
      .subscribe(params => {
        if (+params['error'] === 1) {
          alert("The code you entered was incorrect. Please double-check it.");
        } else if (+params['error'] === 2) {
          alert("Your session has expired. Please login again.");
        } else if (+params['error'] === 3) {
          alert("The journey you looked up has not yet begun.");
        }

        if (+params['passwordReset'] === 1) {
          alert("Please check your inbox for your reset link.");
        }

        if (+params['changedEmail'] === 1) {
          alert("Your email address has been changed. You can now log in again.");
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
