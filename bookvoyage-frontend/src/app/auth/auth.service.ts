import { OnInit } from '@angular/core';
import {Http, Response} from "@angular/http";
import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';

@Injectable()
export class AuthService implements OnInit {
  accessCode = '';
  private token: string = '';

  constructor(private http: Http) {
  }

  ngOnInit() {
    // set token if saved in local storage
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
  }

  registerUser(username, password1, password2, email) {
    let newUser = {
      username: username,
      password1: password1,
      password2: password2,
      email: email
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
      accessCode: accessCode,
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
