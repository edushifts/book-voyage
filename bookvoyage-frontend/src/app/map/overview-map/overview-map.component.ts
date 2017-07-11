import { Component, OnInit } from '@angular/core';
import {environment} from "../../../environments/environment";
import {ActivatedRoute} from "@angular/router";
import {HeaderService} from "../../header/header.service";
import { Observable } from 'rxjs';
import {Http, Response} from "@angular/http";
import {BookService} from "../../book/book.service";
import {MapService, AddBookInstancesOptions} from "../map.service";

@Component({
  selector: 'app-overview-map',
  templateUrl: './overview-map.component.html',
  styleUrls: ['./overview-map.component.css'],
})
export class OverviewMapComponent implements OnInit {
  wrongCode = false;

  constructor(private route: ActivatedRoute,
              private headerService: HeaderService,
              private mapService: MapService) { }

  ngOnInit() {
    this.headerService.showAccountButtons = true;
    this.route
      .queryParams
      .subscribe(params => {
        if (+params['codeError'] === 1) {
          this.wrongCode = true;
          alert("The code you entered was incorrect :( ")
        } else {
          this.wrongCode = false;
          // nothing happens
        }
        if (+params['loggedIn'] === 1) {
          this.wrongCode = true;
          alert("You are logged in now.")
        } else {
          this.wrongCode = false;
          // nothing happens
        }
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
    }
    // Loads book instances
    this.mapService.addBookInstances(mainMap, bookInstanceOptions);
  }
}
