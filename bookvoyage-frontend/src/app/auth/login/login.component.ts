import { Component, OnInit } from '@angular/core';
import {AuthService} from "../auth.service";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {NgForm} from "@angular/forms";
import {Response} from "@angular/http";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  secretCode;
  subscribeLogin;

  constructor(private state: ActivatedRoute,
          private authService: AuthService,
          private router: Router) { }

  ngOnInit() {
    this.state.params
      .subscribe(
        (params: Params) => {
          this.secretCode = params['code'];
          // console.log(params); // debug
        }
      )
  }

  ngOnDestroy() {
    if (this.subscribeLogin) {
      this.subscribeLogin.unsubscribe();
    }
  }

  loginUser(form: NgForm) {
    const email = form.value.email;
    const password = form.value.password;

    this.subscribeLogin = this.authService.login(email, password).subscribe(
      (response: Response) => {

          // login successful if there's a jwt token in the response
          let token = response.json() && response.json().token;
          if (token) {
            // set token property
            this.authService.setToken(token);

            // store username and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('currentUser', JSON.stringify({username: email, token: token}));

            // return true to indicate successful login
            this.router.navigate(['/'], {queryParams: {loggedIn: 1 }});
          } else {
            // return false to indicate failed login
            return false;
          }
      }
    );
    // create account at backend

    // log user in and save token

    // reroute user to location page
  }

}
