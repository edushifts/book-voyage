import {Component, OnInit} from '@angular/core';
import {NgForm} from "@angular/forms";
import {AuthService} from "../../auth.service";
import {ActivatedRoute, Params, Router} from "@angular/router";

@Component({
  selector: 'app-password-reset',
  templateUrl: './request-reset.component.html',
  styleUrls: [
    './request-reset.component.css'
  ]
})
export class RequestResetComponent implements OnInit {

  constructor(private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute) { }


  ngOnInit() {
    this.route
      .queryParams
      .subscribe(params => {
        if (+params['error'] === 1) {
          alert("Sorry! Your previous token expired. Please request a new link here and try again.");
        }
      });
  }

  resetAccount(form: NgForm) {
    const email = form.value.email;
    console.log(email);

    if (email) {

      this.authService.requestPasswordReset(email).subscribe(
        (success: boolean) => {
          form.reset();
          this.router.navigate([''], {queryParams: {passwordReset: 1 }});
        },
        (errors) => {
          alert("Sorry, an error occurred! Please contact ahoi@edushifts.world.");
          return;
        }
      );
    }
  }
}
