import {Component} from '@angular/core';
import {NgForm} from "@angular/forms";
import {AuthService, CurrentUser} from "../../auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: [
    '/../../signup/signup.component.css',
    '../../../map/form-map/form-map.component.css',
    '../manage-account.component.css',
  ]
})
export class PasswordComponent{
  passwordConfirmError = '';
  oldPasswordError = '';
  passwordError  = 'The password needs to be at least 8 characters long';
  generalError = '';

  constructor(private authService: AuthService,
              private router: Router) { }

  returnToAccount() {
    this.router.navigate(['account']);
  }

  updatePassword(form: NgForm) {
    // Change password
    const password = form.value.password;
    const passwordConfirm = form.value.passwordConfirm;
    const oldPassword = form.value.oldPassword;

    if (password) {

      this.authService.changeUserPassword(password, passwordConfirm, oldPassword).subscribe(
        (success: boolean) => {
          // console.log("Yay"); // DEBUG
            form.reset();
            this.router.navigate(['account'], {queryParams: {passwordChanged: 1 }});
        },
        (errorData) => {
          let errors = errorData.json();

          this.passwordError = '';
          // report on password errors
          if (errors.new_password1) {

            for (let error of errors.new_password1) {
              this.passwordError += error;
              this.passwordError += " ";
            }
            form.controls['password'].setErrors({'valid': false});
          }

          this.passwordConfirmError = '';
          if (errors.new_password2) {
            for (let error of errors.new_password2) {
              this.passwordConfirmError += error;
              this.passwordConfirmError += " ";
            }
            form.controls['passwordConfirm'].setErrors({'valid': false});
          }

          this.oldPasswordError = '';
          if (errors.old_password) {
            for (let error of errors.old_password) {
              this.oldPasswordError += error;
              this.oldPasswordError += " ";
            }
            form.controls['oldPassword'].setErrors({'valid': false});
          }

          this.generalError = '';
          if (errors.non_field_errors) {
            for (let error of errors.non_field_errors) {
              this.generalError += error;
              this.generalError += " ";
            }
          }

          return;
        }
      );
    }

  }

}
