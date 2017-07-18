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
import { FormMapComponent } from './map/form-map/form-map.component';
import {NgSpinKitModule} from "ng-spin-kit";
import { DetailMapComponent } from './map/detail-map/detail-map.component';
import {AuthGuard} from "./auth/auth-guard.service";
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PasswordComponent } from './auth/manage-account/password/password.component';
import {AuthGuardReverse} from "./auth/auth-guard-reverse";
import { PasswordResetComponent } from './auth/manage-account/password-reset/password-reset.component';
import { BookListComponent } from './book/book-list/book-list.component';
import { BookListItemComponent } from './book/book-list/book-list-item/book-list-item.component';
import { FormUserMapComponent } from './map/form-user-map/form-user-map.component';
import {GeoLocationService} from "./map/geo-location.service";
import {ShareButtonsModule} from "ngx-sharebuttons";

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
    FormMapComponent,
    DetailMapComponent,
    PageNotFoundComponent,
    PasswordComponent,
    PasswordResetComponent,
    BookListComponent,
    BookListItemComponent,
    FormUserMapComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpModule,
    NgSpinKitModule,
    ShareButtonsModule.forRoot()
  ],
  providers: [AuthService, HeaderService, BookService, MapService, AuthGuard, AuthGuardReverse, GeoLocationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
