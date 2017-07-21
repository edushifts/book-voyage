import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AuthService, CurrentUser} from "../auth.service";
import {NgForm} from "@angular/forms";
import {nameCase} from "../../shared/name-case.function";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  passwordMismatch = false;
  subscribeSignUp;

  usernameError = '';
  passwordError  = 'The password needs to be at least 8 characters long';
  passwordConfirmError = '';

  secretCode;

  constructor(private authService: AuthService,
              private router: Router) { }

  ngOnInit() {
    this.secretCode = this.authService.getAccessCode();

    // check if code is valid (rough check, strictly performed on submit)
    if (this.secretCode.length != 9) {
      this.router.navigate([''], {queryParams: {error: 1 }});
    }
  }

  ngOnDestroy() {
    if (this.subscribeSignUp) {
      this.subscribeSignUp.unsubscribe();
    }
  }

  createAccount(form: NgForm) {
    const first_name = form.value.first_name;
    const last_name = form.value.last_name;
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
      (currentUser : CurrentUser) => {
        // login
        this.authService.setCurrentUser(currentUser);

        // set name of person too
        let userData = {
          first_name: nameCase(first_name),
          last_name: nameCase(last_name)
        }

        this.authService.changeUserCredentials(userData).subscribe(
          (success) => {
            // console.log("done!");
        },
          (error) => {
            console.log(error);
          }
        );

        this.router.navigate(['journey', this.authService.getBookId(), 'continue']);
        },
      (errorData) => {
        // report on email errors
        let errors = errorData.json();
        this.usernameError = '';
        if (errors.username) {
          for (let error of errors.username) {
            this.usernameError += error;
            this.usernameError += " ";
          }
          form.controls['email'].setErrors({'valid': false});
        }
        if (errors.email) {
          for (let error of errors.email) {
            this.usernameError += error;
            this.usernameError += " ";
          }
          form.controls['email'].setErrors({'valid': false});
        }

        this.passwordError = '';
        // report on password errors
        if (errors.password1) {

          this.passwordError = '';
          for (let error of errors.password1) {
            this.passwordError += error;
            this.passwordError += " ";
          }
          form.controls['password'].setErrors({'valid': false});
        }
        this.passwordConfirmError = '';
        if (errors.password2) {
          this.passwordConfirmError = '';
          for (let error of errors.password2) {
            this.passwordConfirmError += error;
            this.passwordConfirmError += " ";
          }
          form.controls['passwordConfirm'].setErrors({'valid': false});
        }
      }
    );




    // reroute user to location page
  }

}
