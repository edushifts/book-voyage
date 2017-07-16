import {Component, DoCheck, OnInit} from '@angular/core';
import {AuthService} from "../auth/auth.service";
import {HeaderService} from "./header.service";
import {Router} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {environment} from "../../environments/environment";

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

    // Every so often, refresh token (time period can be set in the environment file)
    let timer = Observable.timer(0,environment.tokenRefresh);
    timer.subscribe(t => {
        // console.log(t); // DEBUG
        if (this.authService.isLoggedIn()) {
          this.authService.refreshToken();
        }
      }
    );
  }

  onAccountButton() {
    if (this.isLoggedIn) {
      this.router.navigate(['account']);
    } else {
      this.router.navigate(['login']);
    }

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
