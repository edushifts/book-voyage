import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FooterComponent } from './footer/footer.component';
import { OverviewMapComponent } from './overview-map/overview-map.component';
import { HeaderComponent } from './header/header.component';
import { CodeFormComponent } from './code-form/code-form.component';
import { LoginComponent } from './auth/login/login.component';
import {AppRoutingModule} from "./app-routing.module";
import { ManageAccountComponent } from './auth/manage-account/manage-account.component';
import { SignupComponent } from './auth/signup/signup.component';
import {FormsModule} from "@angular/forms";
import {AuthService} from "./auth/auth.service";
import {HttpModule} from "@angular/http";

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    OverviewMapComponent,
    HeaderComponent,
    CodeFormComponent,
    LoginComponent,
    ManageAccountComponent,
    SignupComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpModule
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
