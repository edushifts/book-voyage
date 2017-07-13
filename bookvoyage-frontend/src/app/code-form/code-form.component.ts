import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import { NgForm } from "@angular/forms";
import {AuthService} from "../auth/auth.service";

@Component({
  selector: 'app-code-form',
  templateUrl: './code-form.component.html',
  styleUrls: ['./code-form.component.css']
})
export class CodeFormComponent implements OnInit, OnDestroy {

  @ViewChild('codeForm') codeForm: NgForm;
  validitySub;


  constructor(private router: Router,
              private authService: AuthService) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    if(this.validitySub) {
      this.validitySub.unsubscribe();
    }
  }

  displayCodeForm() {
    return !this.authService.isLoggedIn() || this.authService.getBookId() === -1 || this.authService.getAccessCode() === "wrong";
  }

  displayReminder() {
    return this.authService.getBookId() !== -1 && this.authService.isLoggedIn() && this.authService.getAccessCode() !== "wrong";
  }

  onReminderButton() {
    let bookId = this.authService.getBookId();
    this.router.navigate(['journey', bookId, 'continue']);
  }

  onAccessCode() {
    // check if code is correct in size
    if (this.codeForm.value['accessCode'].length !== 9) {
      alert("The code you entered was incorrect :( ");
      return;
    }

    // check if code is valid
    this.validitySub = this.authService.checkCode(this.codeForm.value['accessCode']).subscribe(
      (validity) => {
        if (!validity) {
          alert("The code you entered was incorrect :( ")
        } else{
          // check if user is logged in already
          // if so, immediately route to journey page
          if (this.authService.isLoggedIn()) {
            let bookId = this.authService.getBookId();
            this.router.navigate(['journey', bookId, 'continue']);
          } else {
            this.router.navigate(['/signup']);
          }
          // otherwise, route to signup page

        }
      },
      (error) => {
        console.log(error);
      }
    );

  }

}
