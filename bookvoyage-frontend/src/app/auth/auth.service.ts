import {OnInit} from '@angular/core';
import {Http, Response, Headers} from "@angular/http";
import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import {Router} from "@angular/router";

export interface CurrentUser {
  user: {
    email: string,
    first_name: string,
    last_name: string,
    pk: number,
    username: string
  },
  token: string
}

@Injectable()
export class AuthService implements OnInit {
  private currentUser: CurrentUser;

  // Sign-up classes
  private accessCode = '';
  private bookId: number;
  private holdingLocation: Coordinates;

  constructor(private http: Http,
              private router: Router) {
  }

  clearLocalBookData() {
    localStorage.removeItem("userBookId");
    localStorage.removeItem("accessCode");
    this.holdingLocation = null;
    this.bookId = null;
  }

  getBookId<Number>() {
    if (this.bookId) {
      return this.bookId;
    } else if (localStorage.getItem('userBookId')) {
      return +localStorage.getItem('userBookId');
    } else {
      return -1;
    }
  }

  setBookId(id:number) {
    localStorage.setItem('userBookId', "" + id);
    this.bookId= id;
  }

  setHoldingLocation(holdingLocation: Coordinates) {
    this.holdingLocation = holdingLocation;
  }

  setAccessCode(accessCode: string) {
    localStorage.setItem('accessCode', "" + accessCode);
    this.accessCode = accessCode;
  }

  getAccessCode<String>() {
    if (this.accessCode) {
      return this.accessCode;
    } else if (localStorage.getItem('accessCode')) {
      return localStorage.getItem('accessCode');
    } else {
      return "wrong";
    }
  }

  getToken() {
    if (this.getCurrentUser()) {
      return this.getCurrentUser().token;
    } else {
      return "";
    }
  }

  refreshToken() {
    // refresh token
    let tokenRequest = {
      "token": JSON.parse(localStorage.getItem('currentUser'))['token']
    };

    return this.http.post(environment.apiUrl + "api-auth/refresh/", tokenRequest).subscribe(
      (response: Response) => {
        let token = response.json()['token'];

        let currentUser: CurrentUser = JSON.parse(localStorage.getItem('currentUser'));
        currentUser = {
          user: currentUser.user,
          token: token
        };
        this.setCurrentUser(currentUser);
      },
      (error) => {
        this.logout(true);
      }
    )
  }

  setCurrentUser(currentUser: CurrentUser)  {
    // console.log(currentUser); // DEBUG
    this.currentUser = currentUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }
  getCurrentUser(): CurrentUser  {
    if (this.currentUser) {
      return this.currentUser
    } else {
      return JSON.parse(localStorage.getItem('currentUser'));
    }
  }

  ngOnInit() {
    // set token if saved in local storage
    this.getToken();
  }

  createAuthorizationHeader(headers: Headers) {
    // console.log(this.getToken()); // DEBUG
    headers.append('Authorization', 'JWT ' + this.getToken());
  }

  registerUser(username, password1, password2, email) {
    let newUser = {
      username: username.toLowerCase(),
      password1: password1,
      password2: password2,
      email: email.toLowerCase()
    };

    return this.http.post(environment.apiUrl + "api-auth/registration/", newUser)
      .map(
        (response: Response) => {
          // on success, return token
          // console.log(response.json().token);
          return response.json();
        }
      )
      .catch(
      (error: Response) => {
        return Observable.throw(error);
      });
  }

  resetPassword(token: string, uid: string, new_password1: string, new_password2: string) {
    let passwordReset = {
      token: token,
      uid: uid,
      new_password1: new_password1,
      new_password2: new_password2
    };

    return this.http.post(environment.apiUrl + "api-auth/password/reset/confirm/", passwordReset)
      .map(
        (response: Response) => {
          // on success, return token
          // console.log(response.json().token);
          return response.json();
        }
      )
      .catch(
        (error: Response) => {
          return Observable.throw(error);
        });
  }

  requestPasswordReset(email: string) {
    let passwordReset = {
      email: email
    };

    return this.http.post(environment.apiUrl + "api-auth/resetPassword/", passwordReset)
      .map(
        (response: Response) => {
          // on success, return token
          // console.log(response.json().token);
          return response.json();
        }
      )
      .catch(
        (error: Response) => {
          return Observable.throw(error.json());
        });
  }

  changeUserCredentials(userChange: {}) {
    // user data may contain one or more of the following:
    // first_name, last_name, username

    let token = this.getToken();
    // console.log(token); // DEBUG

    let headers = new Headers();
    this.createAuthorizationHeader(headers);

    return this.http.patch(environment.apiUrl + "api-auth/user/", userChange, { headers: headers })
      .map(
        (response: Response) => {
          // console.log(response.json()); // DEBUG
          let currentUser: CurrentUser = {
            user: response.json(),
            token: token
          };
          this.setCurrentUser(currentUser);
          return true;
        }
      )
      .catch(
        (error: Response) => {
          // console.log(error.json()); // DEBUG
          return Observable.throw(error);

        });
  }

  changeUserPassword(new_password1: string, new_password2: string, old_password) {
    let passwordChange = {
      new_password1: new_password1,
      new_password2: new_password2,
      old_password: old_password
    };

    let headers = new Headers();
    this.createAuthorizationHeader(headers);

    return this.http.post(environment.apiUrl + "api-auth/password/change/", passwordChange, { headers: headers })
      .map(
        (response: Response) => {
          // console.log(response.json()); // DEBUG
          return true;
        }
      )
      .catch(
        (error: Response) => {
          // console.log(error.json()); // DEBUG
          return Observable.throw(error);
        });
  }

  getUserPreferences() {
    let headers = new Headers();
    this.createAuthorizationHeader(headers);

    return this.http.get(environment.apiUrl + "api-auth/preferences/", { headers: headers })
      .map(
        (response: Response) => {
          // console.log(response.json()); // DEBUG
          return response;
        }
      )
      .catch(
        (error: Response) => {
          // console.log(error.json()); // DEBUG
          return Observable.throw(error);
        });
  }
  updateUserPreferences(anonymous: boolean, mail_updates: boolean, consentbox?: boolean, url?: string) {
    let preferences = {
      anonymous: anonymous,
      mail_updates: mail_updates
    };

    if (consentbox) {
      preferences['activated'] = consentbox;
    }
    if (url) {
      preferences['url'] = url;
    }

    let headers = new Headers();
    this.createAuthorizationHeader(headers);

    return this.http.patch(environment.apiUrl + "api-auth/preferences/", preferences, { headers: headers })
      .map(
        (response: Response) => {
          // console.log(response.json()); // DEBUG
          return response.json();
        }
      )
      .catch(
        (error: Response) => {
          // console.log(error.json()); // DEBUG
          return Observable.throw(error);
        });
  }


  login(username: string, password: string) {
    let user = {
      username: username,
      password: password
    };

    return this.http.post(environment.apiUrl + 'api-auth/login/', user);
  }

  logout(expired?: boolean): void {
    // clear token remove user from local storage to log user out

    if (expired) {

      this.clearLocalBookData();
      localStorage.removeItem("currentUser");
      this.router.navigate([''], {queryParams: {error: 2 }});

    } else {

      let headers = new Headers();
      this.createAuthorizationHeader(headers);

      let emptyPost = {};
      this.http.post(environment.apiUrl + "api-auth/logout/", emptyPost, { headers: headers })
        .map(
          (response: Response) => {
            // console.log("logged out via API"); // DEBUG
            this.clearLocalBookData();
            localStorage.removeItem("currentUser");
            }
        )
        .catch(
          (error: Response) => {
            // console.log("ERROR logging out via API"); // DEBUG
            return Observable.throw(error);

          }).subscribe();
      this.router.navigate(['']);

    }
  }

  isLoggedIn(): boolean {
    if (localStorage.getItem('currentUser')) {
      // logged in so return true
      return true;
    } else {
      return false;
    }
  }

  checkCode(accessCode: string) {
    let request = {
      accessCode: accessCode.toUpperCase(),
    };

    return this.http.post(environment.apiUrl + "api/codeExists/", request)
      .map(
        (response: Response) => {
          let bookCode = response.json();
          if(bookCode.valid) {
            this.setAccessCode(accessCode);
            this.setBookId(bookCode.book_id);
          }
          return bookCode.valid;
        }
      )
      .catch(
        (error: Response) => {
          return Observable.throw(error);
        });
  }
}
