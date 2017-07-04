import { Component, OnInit } from '@angular/core';
import {AuthService} from "../auth.service";
import {ActivatedRoute, Params} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  secretCode;

  constructor(private state: ActivatedRoute,
  private authService: AuthService) { }

  ngOnInit() {
    this.state.params
      .subscribe(
        (params: Params) => {
          this.secretCode = params['code'];
          console.log(params);
        }
      )
  }

}
