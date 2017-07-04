import {ActivatedRoute, Params} from "@angular/router";
import {Http} from "@angular/http";
import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";

@Injectable()
export class AuthService{
  accessCode = '';

  constructor(private http: Http) {}

  registerUser(username, password1, password2, email) {
    let newUser = {
      username: username,
      password1: password1,
      password2: password2,
      email: email
    }

    return this.http.post(environment.apiUrl + "api-auth/registration/", newUser);
  }

}


// { withCredentials: true }
