import {Component, OnInit} from '@angular/core';
import {NgForm} from "@angular/forms";
import {AuthService, CurrentUser} from "../auth.service";
import {nameCase} from "../../shared/name-case.function";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-manage-account',
  templateUrl: './manage-account.component.html',
  styleUrls: [
    '../signup/signup.component.css',
    '../../map/form-map/form-map.component.css',
    './manage-account.component.css',
    '../../shared/checkbox-style.css'
  ]
})
export class ManageAccountComponent implements OnInit {
  error = '';
  usernameError = '';
  firstNameError = '';
  lastNameError = '';
  generalError = '';

  submitSuccess: boolean = false;
  submitFailure: boolean = false;

  passwordChanged: boolean = false;

  currentUser: CurrentUser;

  mail_updates: boolean;
  anonymous: boolean;

  constructor(private route: ActivatedRoute,
              private authService: AuthService,
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
    this.getUserPreferences();

    this.route
      .queryParams
      .subscribe(params => {
        if (+params['passwordChanged'] === 1) {
          this.passwordChanged = true;
        }
      });
  }

  goToPassword() {
    this.router.navigate(['account','password']);
  }

  getUserPreferences() {
    this.authService.getUserPreferences().subscribe(
      (response: Response) => {
        let preferences = response.json();
        this.mail_updates = preferences['mail_updates'];
        this.anonymous = preferences['anonymous'];
      },
      (errorData) => {
        console.log(errorData);
      }
    )
  }

  UpdateUserPreferences() {
    this.authService.updateUserPreferences(this.anonymous, this.mail_updates).subscribe(
      (preferences: Response) => {
        this.anonymous = preferences['anonymous'];
        this.mail_updates = preferences['mail_updates'];
      },
      (errorData) => {
        console.log(errorData);

        /* Failure animation */
        this.submitFailure = true;
        setTimeout(() => {
          this.submitFailure = false;
        }, 1500);
      }
    )
  }

  updateAccount(form: NgForm) {
    // First, update user preferences
    this.UpdateUserPreferences();

    let first_name = form.value.first_name;
    let last_name = form.value.last_name;
    let username = form.value.email;

    let username_changed: boolean = false;

    // Change username and personal names if required
    let userChange = {};
    if (first_name !== "" && first_name !== null) {
      userChange['first_name'] = nameCase(first_name);
    }
    if (last_name !== "" && last_name !== null) {
      userChange['last_name'] = nameCase(last_name);
    }
    if (username !== "" && username !== null) {
      userChange['username'] = username.toLowerCase();
      userChange['email'] = username.toLowerCase();
      username_changed = true;
    }

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
            form.reset();
            // reload preferences
            this.getUserPreferences();
            form.value.first_name = "";
            form.value.last_name = "";
            form.value.email = "";

            /* Success animation */
            this.submitSuccess = true;
            setTimeout(() => {
              this.submitSuccess = false;
            }, 1500);
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
          if (errors.last_name) {
            for (let error of errors.last_name) {
              this.lastNameError += error;
              this.lastNameError += " ";
            }
            form.controls['last_name'].setErrors({'valid': false});
          }

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

          this.generalError = '';
          if (errors.non_field_errors) {
            for (let error of errors.non_field_errors) {
              this.generalError += error;
              this.generalError += " ";
            }
          }

          /* Failure animation */
          this.submitFailure = true;
          setTimeout(() => {
            this.submitFailure = false;
          }, 1500);
        }
      );
    } else {
      /* Success animation */
      this.submitSuccess = true;
      setTimeout(() => {
        this.submitSuccess = false;
      }, 1500);
    }

  }

}
