import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from "../auth.service";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {NgForm} from "@angular/forms";
import {Response} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  subscribeLogin;
  usernameError = '';
  passwordError = '';
  nonFieldError = '';
  generalError = false;
  bookOwner = false;

  extraMessageOutput: string;

  extraMessage$: Observable<string>;
  private extraMessage = new Subject<string>();

  constructor(private route: ActivatedRoute,
          private authService: AuthService,
          private router: Router) { }

  ngOnInit() {
    this.extraMessage$ = this.extraMessage.asObservable();

    this.extraMessage$.subscribe(
      (message: string) => {
        this.extraMessageOutput = message;
      },
      (error) => {
        console.log(error);
      }
    );
    this.route.queryParams
      .subscribe(
        (params: Params) => {
          if (+params['accountActivated'] === 1) {
            this.extraMessage.next('Welcome to Book Voyage! After you login, we will take you to your book journeys.');
            this.bookOwner = true;
          } else {
            this.extraMessage.next('(sign-up requires a book)');
          }
        }
      )
  }

  ngOnDestroy() {
    if (this.subscribeLogin) {
      this.subscribeLogin.unsubscribe();
    }
  }

  generalErrorRecovery(form: NgForm) {
    this.generalError = false;
  }

  loginUser(form: NgForm) {
    const email = form.value.email;
    const password = form.value.password;

    this.subscribeLogin = this.authService.login(email, password).subscribe(
      (response: Response) => {

          // login successful if there's a jwt token in the response
          let token = response.json() && response.json().token;
          if (token) {

            // store username and jwt token in local storage to keep user logged in between page refreshes
            this.authService.setCurrentUser(response.json());

            // return true to indicate successful login
            // if no access code is known, route to front page
            if (this.bookOwner) {
              this.router.navigate(['journeys']);
            } else if (this.authService.getAccessCode() === "wrong") {
              this.router.navigate(['/'], {queryParams: {loggedIn: 1 }});
            } else { // if access code is known, route to book sign-up
              this.router.navigate(['journey', this.authService.getBookId(), 'continue']);
            }

          } else {
            // return false to indicate failed login
            return false;
          }
      },
      (errorData) => {
        // report on email errors
        let errors = errorData.json();
        //console.log(errors);

        this.usernameError = '';
        if (errors.username) {
          for (let error of errors.username) {
            this.usernameError += error;
          }
          form.controls['email'].setErrors({'valid': false});
        }

        this.passwordError = '';
        // report on password errors
        if (errors.password1) {

          this.passwordError = '';
          for (let error of errors.password1) {
            this.passwordError += error;
          }
          form.controls['password'].setErrors({'valid': false});
        }

        this.nonFieldError = '';
        if (errors.non_field_errors) {
          for (let error of errors.non_field_errors) {
            this.nonFieldError += error;
          }
          this.generalError = true;
        }
      }
    );
  }
}
