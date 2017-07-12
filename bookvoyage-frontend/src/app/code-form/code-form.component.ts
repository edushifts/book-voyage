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
    return !this.authService.isLoggedIn();
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
          this.authService.setAccessCode(this.codeForm.value['accessCode']);
          this.router.navigate(['/signup'], {relativeTo: this.state});
        }
      },
      (error) => {
        console.log(error);
      }
    );

  }

}
