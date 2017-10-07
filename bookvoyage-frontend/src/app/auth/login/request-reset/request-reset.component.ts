import {Component, OnInit} from '@angular/core';
import {NgForm} from "@angular/forms";
import {AuthService} from "../../auth.service";
import {ActivatedRoute, Params, Router} from "@angular/router";
import { TranslateService } from "@ngx-translate/core";

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
              private route: ActivatedRoute,
              private translate: TranslateService) { }


  ngOnInit() {
    this.route
      .queryParams
      .subscribe(params => {
        if (+params['error'] === 1) {
          this.translate.get("ERROR_TOKEN_EXPIRED").subscribe(
            (message: string) => {
              alert(message);
            }
          );

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
          this.translate.get("ERROR_GENERIC").subscribe(
            (message: string) => {
              alert(message);
              return;
            }
          );
        }
      );
    }
  }
}
