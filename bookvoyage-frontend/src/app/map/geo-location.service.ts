import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {Http, Response} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {map} from "rxjs/operator/map";

@Injectable()
export class GeoLocationService {

  constructor(private http: Http) { }

  addressToCoord(address) {
    // clean address first
    address = address.replace(/\s/g, '+');
    if (address !== "") {
      return this.http.get(environment.googleGeoBaseURL + address + "&key=" + environment.googleGeoAPI)
        .map(
          (response: Response) => {
            return response.json().results[0].geometry.location;
          }
        )
        .catch(
          (error: Response) => {
            return Observable.throw(error);
          });
    }
  }

}
