import {Component, OnInit} from '@angular/core';
import {NgForm} from "@angular/forms";
import {AuthService} from "../../auth.service";
import {ActivatedRoute, Params, Router} from "@angular/router";

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: [
    '/../../signup/signup.component.css',
    '../../../map/form-map/form-map.component.css',
    '../manage-account.component.css',
    './password-reset.component.css',
  ]
})
export class PasswordResetComponent implements OnInit {
  passwordConfirmError = '';
  passwordError  = 'The password needs to be at least 8 characters long';
  generalError = '';
  passwordToken: string;

  constructor(private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute) { }


  ngOnInit() {
    this.route.params
      .subscribe(
        (params: Params) => {
          this.passwordToken = params['key'];
          // Check if password token is correct
          // Rough check - real check will happen upon submit
          if (this.passwordToken.length < 20) {
            this.router.navigate([''], {queryParams: {error: 4 }});
          }
        }
      );
  }

  updatePassword(form: NgForm) {
    // Change password
    const password = form.value.password;
    const passwordConfirm = form.value.passwordConfirm;

    if (password) {
      let tokenLength = this.passwordToken.length;

      let token = this.passwordToken.substr(tokenLength - 24);
      let uid = this.passwordToken.substr(0, tokenLength - 25);

      this.authService.resetPassword(token, uid, password, passwordConfirm).subscribe(
        (success: boolean) => {
          // console.log("Yay"); // DEBUG
          form.reset();
          this.router.navigate(['login'], {queryParams: {accountActivated: 1 }});
        },
        (errorData) => {
          let errors = errorData.json();

          if (errors.token || errors.uid) {
            this.router.navigate([''], {queryParams: {error: 4 }});
          }

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
