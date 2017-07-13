import {Component, DoCheck, OnInit} from '@angular/core';
import {AuthService} from "../auth/auth.service";
import {HeaderService} from "./header.service";
import {Router} from "@angular/router";
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, DoCheck {
  isLoggedIn = false;
  showAccountButtons;

  constructor(private authService: AuthService,
              private headerService: HeaderService,
              private router: Router) { }

  ngOnInit() {
    // clear local data if not logged in
    if (!this.authService.isLoggedIn()) {
      this.authService.clearLocalBookData();
    }

    // check over time if user token is still valid
    let timer = Observable.timer(0,300000); // every 5 minutes, check token
    timer.subscribe(t => {
        // console.log(t); // DEBUG
        if (this.authService.isLoggedIn()) {
          this.authService.refreshToken();
        }
      }
    );
  }

  openProfile() {
    alert("Profile will soon be available");
  }

  ngDoCheck() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.showAccountButtons = this.headerService.showAccountButtons;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

}
