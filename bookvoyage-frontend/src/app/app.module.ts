// Import modules
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { NgSpinKitModule } from "ng-spin-kit";
import { ShareButtonsModule } from "ngx-sharebuttons";
import { RouterModule } from "@angular/router";
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// Import services
import { HeaderService } from "./header/header.service";
import { BookService } from "./book/book.service";
import { MapService } from "./map/map.service";
import { AuthService } from "./auth/auth.service";
import { GeoLocationService } from "./map/geo-location.service";

// Import routes, auth guards and ngx-meta
import { routes } from './app.routes';
import { AuthGuard } from "./auth/auth-guard.service";
import { AuthGuardReverse } from "./auth/auth-guard-reverse";
import { MetaGuard, MetaLoader, MetaModule, MetaStaticLoader, PageTitlePositioning } from "@ngx-meta/core";

// Import components
import { AppComponent } from './app.component';
import { FooterComponent } from './footer/footer.component';
import { OverviewMapComponent } from './map/overview-map/overview-map.component';
import { HeaderComponent } from './header/header.component';
import { CodeFormComponent } from './code-form/code-form.component';
import { LoginComponent } from './auth/login/login.component';
import { ManageAccountComponent } from './auth/manage-account/manage-account.component';
import { SignupComponent } from './auth/signup/signup.component';
import { FormMapComponent } from './map/form-map/form-map.component';
import { PasswordResetComponent } from './auth/manage-account/password-reset/password-reset.component';
import { BookListItemComponent } from './book/book-list/book-list-item/book-list-item.component';
import { BookListComponent } from './book/book-list/book-list.component';
import { DetailMapComponent } from './map/detail-map/detail-map.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PasswordComponent } from './auth/manage-account/password/password.component';
// import { FormMapOwnerComponent } from './map/form-user-map/form-user-map.component'; # WIP

// Import environment
import { environment } from "../environments/environment";


// Define default meta descriptions
export function metaFactory(): MetaLoader {
  return new MetaStaticLoader({
    pageTitlePositioning: PageTitlePositioning.PrependPageTitle,
    pageTitleSeparator: ' | ',
    applicationName: 'EDUshifts Now!',
    defaults: {
      title: 'EDUshifts Now!',
      description: 'Follow 1000 books as they ',
      'og:image': environment.protocol + environment.url + environment.assetRoot + 'img/faces.jpg',
      'og:type': 'website',
      'og:locale': 'en_US',
    }
  });
}

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
    // FormMapOwnerComponent # WIP
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    NgSpinKitModule,
    ShareButtonsModule.forRoot(),
    RouterModule.forRoot(routes),
    MetaModule.forRoot({
      provide: MetaLoader,
      useFactory: (metaFactory)
    })
  ],
  providers: [AuthService, HeaderService, BookService, MapService, AuthGuard, AuthGuardReverse, GeoLocationService, MetaGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
