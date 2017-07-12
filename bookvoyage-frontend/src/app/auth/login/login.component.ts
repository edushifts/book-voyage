import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from "../auth.service";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {NgForm} from "@angular/forms";
import {Response} from "@angular/http";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  secretCode;
  subscribeLogin;
  usernameError = '';
  passwordError = '';
  nonFieldError = '';

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
      },
      (errorData) => {
        // report on email errors
        let errors = errorData.json();
        console.log(errors);
        this.usernameError = '';
        if (errors.username) {
          for (let error of errors.username) {
            this.usernameError += error;
          }
          form.controls['email'].setErrors({'valid': false});
        }

        // report on password errors
        if (errors.password1) {

          this.passwordError = '';
          for (let error of errors.password1) {
            this.passwordError += error;
          }
          form.controls['password'].setErrors({'valid': false});
        }

        if (errors.non_field_errors) {
          for (let error of errors.non_field_errors) {
            this.nonFieldError += error;
          }
          form.controls['email'].setErrors({'valid': false});
          form.controls['password'].setErrors({'valid': false});
        }
      }
    );
    // create account at backend

    // log user in and save token

    // reroute user to location page
  }

}
