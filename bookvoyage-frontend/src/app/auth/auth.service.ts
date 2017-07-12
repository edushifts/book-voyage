import {OnInit} from '@angular/core';
import {Http, Response, Headers} from "@angular/http";
import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';

// Auxiliary function that parses names and capitalises them
// Not perfect at the moment.
// Adjusted from here: https://gist.github.com/jeffjohnson9046/9789876
function nameCase(input) {
  let smallWords = /^(de|van|der|den|te|ter|ten|a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;

  input = input.toLowerCase();

  // takes whole words divided by whitespace
  return input.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function(match, index, title) {

    // deal with words that should be lowercase
    if (index + match.length !== title.length && // index > 0 &&
      match.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
      (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
      title.charAt(index - 1).search(/[^\s-]/) < 0) {
      return match.toLowerCase();
    }

    if (match.substr(1).search(/[A-Z]|\../) > -1) {
      return match;
    }

    return match.charAt(0).toUpperCase() + match.substr(1);
  });
}

@Injectable()
export class AuthService implements OnInit {
  private token: string = '';

  // Sign-up classes
  private accessCode = '';
  private holdingLocation: Coordinates;

  setHoldingLocation(holdingLocation: Coordinates) {
    this.holdingLocation = holdingLocation;
  }

  setAccessCode(accessCode: string) {
    this.accessCode = accessCode;
  }

  getAccessCode() {
    return this.accessCode;
  }

  constructor(private http: Http) {
  }

  ngOnInit() {
    // set token if saved in local storage
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
  }

  createAuthorizationHeader(headers: Headers) {
    headers.append('Authorization', 'JWT ' +
      this.token);
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
          return response.json().token;
        }
      )
      .catch(
      (error: Response) => {
        return Observable.throw(error);
      });
  }

  setUserName(first_name, last_name) {
    let userChange = {
      first_name: nameCase(first_name),
      last_name: nameCase(last_name),
    };

    let headers = new Headers();
    this.createAuthorizationHeader(headers);

    return this.http.patch(environment.apiUrl + "api-auth/user/", userChange, { headers: headers })
      .map(
        (response: Response) => {
          // on success, return token
          // console.log(response.json().token);
          return true;
        }
      )
      .catch(
        (error: Response) => {
          return Observable.throw(error);
        });
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('currentUser', token);
  }

  login(username: string, password: string) {
    let user = {
      username: username,
      password: password
    };

    return this.http.post(environment.apiUrl + 'api-auth/login/', user);
  }

  logout(): void {
    // clear token remove user from local storage to log user out
    this.token = null;
    localStorage.removeItem('currentUser');
  }

  isLoggedIn() {
    if (localStorage.getItem('currentUser')) {
      // logged in so return true
      return true;
    } else {
      return false;
    }
  }

  checkCode(accessCode) {
    let request = {
      accessCode: accessCode.toUpperCase(),
    };

    return this.http.post(environment.apiUrl + "api/codeExists/", request)
      .map(
        (response: Response) => {
          // on success, return token
          // console.log(response.json().token);
          return response.json().valid;
        }
      )
      .catch(
        (error: Response) => {
          return Observable.throw(error);
        });
  }

}


// { withCredentials: true }
