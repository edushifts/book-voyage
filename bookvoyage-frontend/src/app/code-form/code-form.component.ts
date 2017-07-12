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
              private state: ActivatedRoute,
              private authService: AuthService) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    if(this.validitySub) {
      this.validitySub.unsubscribe();
    }
  }

  displayCodeForm() {
    return !this.authService.isLoggedIn() || this.authService.getBookId() === -1;
  }

  displayReminder() {
    return this.authService.getBookId() !== -1 && this.authService.isLoggedIn();
  }

  onReminderButton() {
    this.router.navigate(['/continueJourney'], {relativeTo: this.state});
  }

  onAccessCode() {
    // check if code is correct in size
    if (this.codeForm.value['accessCode'].length !== 9) {
      alert("The code you entered was incorrect :( ")
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
            this.router.navigate(['/continueJourney'], {relativeTo: this.state});
          } else {
            this.router.navigate(['/signup'], {relativeTo: this.state});
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
