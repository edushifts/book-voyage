import { Component, OnInit } from '@angular/core';
import {environment} from "../../../environments/environment";
import {ActivatedRoute} from "@angular/router";
import {HeaderService} from "../../header/header.service";
import { Observable } from 'rxjs';
import {Http, Response} from "@angular/http";
import {BookService} from "../../book/book.service";
import {MapService, AddBookInstancesOptions} from "../map.service";
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-overview-map',
  templateUrl: './overview-map.component.html',
  styleUrls: ['./overview-map.component.css'],
})
export class OverviewMapComponent implements OnInit {

  constructor(private route: ActivatedRoute,
              private headerService: HeaderService,
              private mapService: MapService,
              private titleService: Title) { }

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
        } else if (+params['error'] === 4) {
          alert("Your provided key was invalid. Please contact the platform owners.");
        } else {
          // nothing happens
        }
        if (+params['changedEmail'] === 1) {
          alert("Your email address has been changed. You can now log in again.");
        }

        // not good for user experience - disabled
        // if (+params['loggedIn'] === 1) {
        //   this.wrongCode = true;
        //   alert("You are logged in now.");
        //
        // } else {
        //   this.wrongCode = false;
        //   // nothing happens
        // }

        this.titleService.setTitle("EDUshifts Now | Book Voyage");
      });

    // render basic map
    let mainMap = this.mapService.renderMap('mainMap');

    // Add book batch markers to the map
    this.mapService.addBookBatchMarkers(mainMap);

    // create options array
    let bookInstanceOptions: AddBookInstancesOptions = {
      addHolders: true,
      addOwners: false,
      drawLines: true
    };

    // Loads book instances
    this.mapService.addBookInstances(mainMap, bookInstanceOptions);
  }
}
