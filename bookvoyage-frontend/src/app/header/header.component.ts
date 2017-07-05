import {Component, DoCheck, OnInit} from '@angular/core';
import {AuthService} from "../auth/auth.service";
import {HeaderService} from "./header.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, DoCheck {
  isLoggedIn;
  showAccountButtons;

  constructor(private authService: AuthService,
              private headerService: HeaderService) { }

  ngOnInit() {
    //if user is logged in, show account button
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  openProfile() {
    alert("Profile will soon be available");
  }

  ngDoCheck() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.showAccountButtons = this.headerService.showAccountButtons
  }

  logout() {
    this.authService.logout();
    alert("You are logged out now");
  }

}
