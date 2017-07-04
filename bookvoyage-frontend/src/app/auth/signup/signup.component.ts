import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {AuthService} from "../auth.service";
import {NgForm} from "@angular/forms";
import {Response} from "@angular/http";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  // default is false, turns true if password do not match at
  // submit click
  passwordMismatch = false;

  secretCode;

  constructor(private state: ActivatedRoute,
              private authService: AuthService,
              private router: Router) { }

  ngOnInit() {
    this.secretCode = this.authService.accessCode;
    // check if code is valid
    if (this.secretCode.length != 9) {
      this.router.navigate([''], {queryParams: {codeError: 1 }});
    }
    // check if code exists in book database
    // if not, reroute to denial page

    // if exists, put in form and continue rendering
  }

  createAccount(form: NgForm) {
    const email = form.value.email;
    const password = form.value.password;
    const passwordConfirm = form.value.passwordConfirm;

    // check if confirmed password is correct
    // if not, block rest of function
    if (password !== passwordConfirm) {
      this.passwordMismatch = true;
      return;
    }
    this.authService.registerUser(email, password, passwordConfirm, email)
      .subscribe(
        (response: Response) => {
          // console.log(response);
        }
      );
    // create account at backend

    // log user in and save token

    // reroute user to location page
  }

}
