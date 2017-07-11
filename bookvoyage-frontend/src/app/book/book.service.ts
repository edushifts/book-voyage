import {environment} from "../../environments/environment";
import {Observable} from "rxjs/Observable";
import {Http, Response} from "@angular/http";
import {Injectable} from "@angular/core";
import 'rxjs/add/operator/map';

@Injectable()
export class BookService {
  // TODO: allow (persistent) storage of downloaded data
  // bookInstances;
  // bookBatches;

  constructor(private http: Http) {}

  getBookInstances() {
    // if (!this.bookInstances) {
      return this.updateBookInstances();
    // } else {
    //   return this.bookInstances;
    // }
  }

  getBookInstance(id: number) {
    // if (!this.bookInstances) {
      return this.updateBookInstance(id);
    // } else {
    //   return this.bookInstances[id];
    // }
  }

  updateBookInstances() {
    return this.http.get(environment.apiUrl + "api/bookInstances/")
      .map(
        (response: Response) => {
          // on success, return all book instances
          return response.json();
        }
      )
      .catch(
        (error: Response) => {
          return Observable.throw(error);
        });
  }

  updateBookInstance(id) {
    return this.http.get(environment.apiUrl + "api/bookInstances/" + id + "/")
      .map(
        (response: Response) => {
          // on success, return specified book instance
          return response.json();
        }
      )
      .catch(
        (error: Response) => {
          return Observable.throw(error);
        });
  }

  getBookBatches() {
    // if (!this.bookBatches) {
      return this.updateBookBatches();
    // } else {
    //   return this.bookBatches;
    // }
  }

  getBookBatch(id: number) {
    // if (!this.bookBatches) {
      return this.updateBookBatches()[id];
    // } else {
    //   return this.bookBatches[id];
    // }
  }

  updateBookBatches() {
    return this.http.get(environment.apiUrl + "api/bookBatches/")
      .map(
        (response: Response) => {
          return response.json();
        }
      )
      .catch(
        (error: Response) => {
          return Observable.throw(error);
        });
  }
}
