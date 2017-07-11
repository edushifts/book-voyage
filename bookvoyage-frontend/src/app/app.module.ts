import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FooterComponent } from './footer/footer.component';
import { OverviewMapComponent } from './map/overview-map/overview-map.component';
import { HeaderComponent } from './header/header.component';
import { CodeFormComponent } from './code-form/code-form.component';
import { LoginComponent } from './auth/login/login.component';
import {AppRoutingModule} from "./app-routing.module";
import { ManageAccountComponent } from './auth/manage-account/manage-account.component';
import { SignupComponent } from './auth/signup/signup.component';
import {FormsModule} from "@angular/forms";
import {AuthService} from "./auth/auth.service";
import {HttpModule} from "@angular/http";
import {HeaderService} from "./header/header.service";
import {BookService} from "./book/book.service";
import {MapService} from "./map/map.service";
import { DetailMapComponent } from './map/detail-map/detail-map.component';

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    OverviewMapComponent,
    HeaderComponent,
    CodeFormComponent,
    LoginComponent,
    ManageAccountComponent,
    SignupComponent,
    DetailMapComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpModule,
  ],
  providers: [AuthService, HeaderService, BookService, MapService],
  bootstrap: [AppComponent]
})
export class AppModule { }
