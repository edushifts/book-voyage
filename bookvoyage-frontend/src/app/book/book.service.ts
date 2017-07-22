import {environment} from "../../environments/environment";
import {Observable} from "rxjs/Observable";
import {Http, Response, Headers} from "@angular/http";
import {Injectable} from "@angular/core";
import 'rxjs/add/operator/map';
import {Router} from "@angular/router";
import {AuthService} from "app/auth/auth.service";

@Injectable()
export class BookService {
  // TODO: allow (persistent) storage of downloaded data
  // bookInstances;
  // bookBatches;

  constructor(private http: Http,
              private router: Router,
              private authService: AuthService) {}

  getBookInstances() {
    // Does not use caching at the moment
    // if (!this.bookInstances) {
      return this.updateBookInstances();
    // } else {
    //   return this.bookInstances;
    // }
  }

  private updateBookInstances() {
    // return this.http.get(environment.apiUrl + "api/bookInstances/") // would return all books
    return this.http.get(environment.apiUrl + "api/bookInstancesActive/")
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

  getBookInstance(id: number) {
    // Does not use caching at the moment
    // if (!this.bookInstances) {
    return this.updateBookInstance(id);
    // } else {
    //   return this.bookInstances[id];
    // }
  }

  private updateBookInstance(id: number) {
    return this.http.get(environment.apiUrl + "api/bookInstances/" + id + "/")
      .map(
        (response: Response) => {
          // on success, return specified book instance
          return response.json();
        }
      )
      .catch(
        (error: Response) => {
          this.router.navigate([''], {queryParams: {error: 3 }});
          return Observable.throw(error);
        });
  }

  postBookHolding(message: string, location: Coordinates, book_instance: number, book_code: string) {
    let newBookHolding = {
      message: message,
      location: {
        type: "Point",
        coordinates: [location['lng'], location['lat']]
      },
      book_instance: book_instance,
      book_code: book_code,
    };

    //console.log(newBookHolding); // DEBUG

    let headers = new Headers();
    this.authService.createAuthorizationHeader(headers);

    return this.http.post(environment.apiUrl + "api/bookHoldings/", newBookHolding, { headers: headers})
      .map(
        (response: Response) => {
          // on success, return specified book instance
          return true;
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

  private updateBookBatches() {
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


  getUnassignedBookOwnings() {
    return this.updateUnassignedBookOwnings();
  }

  private updateUnassignedBookOwnings() {
    return this.http.get(environment.apiUrl + "api/unassignedOwnings/")
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

  /**
   * Returns the current users' ownings
   */
  getMyBookOwnings() {
    let headers = new Headers();
    this.authService.createAuthorizationHeader(headers);

    return this.http.get(environment.apiUrl + "api/myBookOwnings/", { headers: headers })
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

  /**
   * Returns the current users' holdings
   */
  getMyBookHoldings() {
    let headers = new Headers();
    this.authService.createAuthorizationHeader(headers);

    return this.http.get(environment.apiUrl + "api/myBookHoldings/", { headers: headers })
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
}
