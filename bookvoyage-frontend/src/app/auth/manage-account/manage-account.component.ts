import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NgForm} from "@angular/forms";
import {AuthService, CurrentUser} from "../auth.service";
import {nameCase} from "../../shared/name-case.module";
import {Router} from "@angular/router";

@Component({
  selector: 'app-manage-account',
  templateUrl: './manage-account.component.html',
  styleUrls: [
    '../signup/signup.component.css',
    '../../map/form-map/form-map.component.css',
    './manage-account.component.css',
  ]
})
export class ManageAccountComponent implements OnInit {
  error = '';
  usernameError = '';
  firstNameError = '';
  lastNameError = '';
  generalError = '';

  currentUser: CurrentUser;

  constructor(private authService: AuthService,
              private router: Router) { }

  // for some reason, the regular variable did not import
  // TODO: make more efficient
  get_first_name() {
    return this.currentUser.user.first_name;
  }
  get_last_name() {
    return this.currentUser.user.last_name;
  }
  get_email() {
    return this.currentUser.user.username;
  }

  ngOnInit() {
    // First, load profile information from server
    this.currentUser = this.authService.getCurrentUser();
  }

  updateAccount(form: NgForm) {
    let first_name = form.value.first_name;
    let last_name = form.value.last_name;
    let username = form.value.email;
    let anonymous: boolean = form.value['anonymous'];
    let mailUpdates: boolean = form.value['updates'];

    let username_changed: boolean = false;

    // Change username and personal names if required
    let userChange = {};
    if (first_name !== "") {
      userChange['first_name'] = nameCase(first_name);
    }
    if (last_name !== "") {
      userChange['last_name'] = nameCase(last_name);
    }
    if (username !== "") {
      userChange['username'] = username.toLowerCase();
      username_changed = true;
    }

    console.log(userChange);
    if (Object.keys(userChange).length !== 0 && userChange.constructor === Object) {
      this.authService.changeUserCredentials(userChange).subscribe(
        (success: boolean) => {
          // console.log("Yay"); // DEBUG
          if (username_changed) {
            this.authService.logout();
            this.router.navigate([''], {queryParams: {changedEmail: 1 }});
          } else {
            this.currentUser = this.authService.getCurrentUser();

            // Regular resetForm does not do the trick...
            form.resetForm();
            form.value.first_name = "";
            form.value.last_name = "";
            form.value.email = "";
          }

        },
        (errorData) => {
          // report on email errors
          let errors = errorData.json();

          this.firstNameError = '';
          // report on password errors
          if (errors.first_name) {
            for (let error of errors.first_name) {
              this.firstNameError += error;
              this.firstNameError += " ";
            }
            form.controls['first_name'].setErrors({'valid': false});
          }

          this.lastNameError = '';
          if (errors.new_password2) {
            for (let error of errors.lastNameError) {
              this.lastNameError += error;
              this.lastNameError += " ";
            }
            form.controls['last_name'].setErrors({'valid': false});
          }

          this.usernameError = '';
          if (errors.usernameError) {
            for (let error of errors.usernameError) {
              this.usernameError += error;
              this.usernameError += " ";
            }
            form.controls['email'].setErrors({'valid': false});
          }

          this.generalError = '';
          if (errors.non_field_errors) {
            for (let error of errors.non_field_errors) {
              this.generalError += error;
              this.generalError += " ";
            }
          }
        }
      );
    }

  }

}
