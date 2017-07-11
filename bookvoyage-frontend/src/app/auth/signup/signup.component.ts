import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {AuthService} from "../auth.service";
import {NgForm} from "@angular/forms";
import {Response} from "@angular/http";
import {HeaderService} from "../../header/header.service";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  // default is false, turns true if password do not match at
  // submit click
  passwordMismatch = false;
  subscribeSignUp;
  error = '';
  usernameError= '';
  passwordError = '';
  passwordConfirmError = '';

  secretCode;

  constructor(private state: ActivatedRoute,
              private authService: AuthService,
              private router: Router,
              private headerService: HeaderService) { }

  ngOnInit() {
    this.secretCode = this.authService.accessCode;

    // check if code is valid
    if (this.secretCode.length != 9) {
      this.router.navigate([''], {queryParams: {codeError: 1 }});
    }

    // remove buttons from header
    this.headerService.showAccountButtons = false;

    // check if code exists in book database
    // if not, reroute to denial page

    // if exists, put in form and continue rendering
  }

  ngOnDestroy() {
    if (this.subscribeSignUp) {
      this.subscribeSignUp.unsubscribe();
    }
  }

  createAccount(form: NgForm) {
    const email = form.value.email;
    const password = form.value.password;
    const passwordConfirm = form.value.passwordConfirm;

    // check if confirmed password is correct
    // if not, block rest of function
    if (password !== passwordConfirm) {
      this.passwordMismatch = true;
      this.passwordConfirmError = "Your password did not match";
      form.controls['passwordConfirm'].setErrors({'valid': false});
      return;
    }
    // create account at backend
    this.subscribeSignUp = this.authService.registerUser(email, password, passwordConfirm, email).subscribe(
      (token) => {
        // login
        this.authService.setToken(token);
        this.router.navigate(['/'], {queryParams: {loggedIn: 1 }});
        },
      (errorData) => {
        // report on email errors
        let errors = errorData.json();
        this.usernameError = '';
        if (errors.username) {
          for (let error of errors.username) {
            this.usernameError += error;
          }
          form.controls['email'].setErrors({'valid': false});
        }
        if (errors.email) {
          for (let error of errors.email) {
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

        if (errors.password2) {
          this.passwordConfirmError = '';
          for (let error of errors.password2) {
            this.passwordConfirmError += error;
          }
          form.controls['passwordConfirm'].setErrors({'valid': false});
        }
      }
    );




    // reroute user to location page
  }

}
