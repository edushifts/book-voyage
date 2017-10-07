import {Component, OnInit} from '@angular/core';
import {AddBookInstancesOptions, MapService} from "../map.service";
import {GeoLocationService} from "../geo-location.service";
import {ActivatedRoute, Params} from "@angular/router";
import {ShareButtonsService} from "ngx-sharebuttons";
import {MetaService} from "@ngx-meta/core";
import { TranslateService } from "@ngx-translate/core";

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
              private readonly meta: MetaService,
              private translate: TranslateService) { }

  ngOnInit() {
    this.route.params
      .subscribe(
        (params: Params) => {
          this.bookId = +params['id'];
          this.translate.get('FOLLOW_JOURNEY').subscribe(
            (message: string) => {
              this.meta.setTitle(message + this.bookId);
            }
          );

          // render basic map
          this.mainMap = this.mapService.renderMap('mainMap');

          // create options array
          let bookInstanceOptions: AddBookInstancesOptions = {
            addHolders: true,
            addOwners: true,
            drawLines: true,
            addBatch: true
          };

          // Loads book instance
          this.mapService.addBookInstance(this.mainMap, this.bookId, bookInstanceOptions);
        }
      );
  }
}
