import { Component, OnInit } from '@angular/core';
import {AddBookInstancesOptions, MapService} from "../map.service";
import {GeoLocationService} from "../geo-location.service";
import {ActivatedRoute, Params} from "@angular/router";
import {Title} from "@angular/platform-browser";
import {ShareButtonsService} from "ngx-sharebuttons";

@Component({
  selector: 'app-detail-map',
  templateUrl: './detail-map.component.html',
  styleUrls: ['./detail-map.component.css'],
  providers: [GeoLocationService, ShareButtonsService]
})
export class DetailMapComponent implements OnInit {
  bookId: number;
  mainMap;

  constructor(private mapService: MapService,
              private route: ActivatedRoute,
              private titleService: Title) { }

  ngOnInit() {
    this.route.params
      .subscribe(
        (params: Params) => {
          this.bookId = +params['id'];

          // render basic map
          this.mainMap = this.mapService.renderMap('mainMap');

          // create options array
          let bookInstanceOptions: AddBookInstancesOptions = {
            addHolders: true,
            addOwners: true,
            drawLines: true
          };

          // Loads book instance
          this.mapService.addBookInstance(this.mainMap, this.bookId, bookInstanceOptions);
        }
      );
    this.titleService.setTitle("EDUshifts Now | Journey " + this.bookId);
  }
}
