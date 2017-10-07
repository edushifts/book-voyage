import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import {NgForm} from "@angular/forms";
import {AuthService} from "../auth/auth.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-code-form',
  templateUrl: './code-form.component.html',
  styleUrls: ['./code-form.component.css']
})
export class CodeFormComponent implements OnInit, OnDestroy {

  @ViewChild('codeForm') codeForm: NgForm;
  validitySub;

  constructor(private router: Router,
              private authService: AuthService,
              private translate: TranslateService) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    if(this.validitySub) {
      this.validitySub.unsubscribe();
    }
  }

  displayCodeForm() {
    return !this.authService.isLoggedIn()
      || this.authService.getBookId() === -1 || this.authService.getAccessCode() === "wrong";
  }

  displayReminder() {
    return this.authService.getBookId() !== -1
      && this.authService.isLoggedIn() && this.authService.getAccessCode() !== "wrong";
  }

  onReminderButton() {
    let bookId = this.authService.getBookId();
    this.router.navigate(['journey', bookId, 'continue']);
  }

  onAccessCode() {
    // check if code is correct in size
    let givenCode = this.codeForm.value['accessCode'].toUpperCase();
    if (givenCode.length !== 9) {
      this.translate.get("ERROR_WRONG_CODE").subscribe(
        (message: string) => {
          alert(message);
        }
      );
      return;
    }

    // check if code is valid
    this.validitySub = this.authService.checkCode(givenCode).subscribe(
      (validity) => {
        if (!validity) {
          this.translate.get("ERROR_WRONG_CODE").subscribe(
            (message: string) => {
              alert(message);
            }
          );
        } else{
          // check if user is logged in already
          if (this.authService.isLoggedIn()) {
            // if so, immediately route to journey page
            let bookId = this.authService.getBookId();
            this.router.navigate(['journey', bookId, 'continue']);
          } else {
            // otherwise, route to signup page
            this.router.navigate(['/signup']);
          }
        }
      },
      (error) => {
        console.log(error);
      }
    );

  }

}
