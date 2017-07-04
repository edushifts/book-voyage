import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import { NgForm } from "@angular/forms";
import {AuthService} from "../auth/auth.service";

@Component({
  selector: 'app-code-form',
  templateUrl: './code-form.component.html',
  styleUrls: ['./code-form.component.css']
})
export class CodeFormComponent implements OnInit {

  @ViewChild('codeForm') codeForm: NgForm;

  constructor(private router: Router,
              private state: ActivatedRoute,
              private loginService: AuthService) { }

  ngOnInit() {
  }

  onAccessCode() {
    this.loginService.accessCode = this.codeForm.value['accessCode'];
    this.router.navigate(['/signup'], {relativeTo: this.state});
  }

}
