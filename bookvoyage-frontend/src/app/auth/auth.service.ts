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
  private bookId: number;
  private holdingLocation: Coordinates;

  constructor(private http: Http) {
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
    if (this.token != "") {
      return this.token
    } else if (localStorage.getItem('currentUser')) {
      let currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.token = currentUser && currentUser.token;
      return this.token;
    } else {
      console.log("3");
      return "";
    }
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('currentUser', token);
  }

  ngOnInit() {
    // set token if saved in local storage
    this.getToken();
  }

  createAuthorizationHeader(headers: Headers) {
    headers.append('Authorization', 'JWT ' +
      this.getToken());
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

  login(username: string, password: string) {
    let user = {
      username: username,
      password: password
    };

    return this.http.post(environment.apiUrl + 'api-auth/login/', user);
  }

  logout(): void {
    // clear token remove user from local storage to log user out
    this.clearLocalBookData();
    localStorage.removeItem("currentUser");
    window.sessionStorage.clear();
  }

  isLoggedIn<Boolean>() {
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


// { withCredentials: true }
