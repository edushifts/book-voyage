// Import modules
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http"; // DEPRECATED
import { NgSpinKitModule } from "ng-spin-kit";
import { ShareButtonsModule } from "ngx-sharebuttons";
import { RouterModule } from "@angular/router";
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AngularFontAwesomeModule } from 'angular-font-awesome/angular-font-awesome';

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
import { RequestResetComponent } from "./auth/login/request-reset/request-reset.component";
import { HttpModule } from "@angular/http";
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';



// Define default meta descriptions
export function metaFactory(): MetaLoader {
  return new MetaStaticLoader({
    pageTitlePositioning: PageTitlePositioning.PrependPageTitle,
    pageTitleSeparator: ' | ',
    applicationName: 'EDUshifts Now!',
    defaults: {
      title: 'EDUshifts Now!',
      description: 'Follow 1000 books as they travel across the globe and connect innovators of education.',
      'og:image': environment.protocol + environment.url + environment.assetRoot + 'img/faces.jpg',
      'og:type': 'website',
      'og:locale': 'en_US',
    }
  });
}

// Translate plugin
// AoT requires an exported function for factories
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
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
    RequestResetComponent,
    PrivacyPolicyComponent
    // FormMapOwnerComponent # WIP
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule, // DEPRECATED
    HttpClientModule,
    NgSpinKitModule,
    ShareButtonsModule.forRoot(),
    RouterModule.forRoot(routes),
    MetaModule.forRoot({
      provide: MetaLoader,
      useFactory: (metaFactory)
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    AngularFontAwesomeModule
  ],
  providers: [AuthService, HeaderService, BookService, MapService, AuthGuard, AuthGuardReverse, GeoLocationService, MetaGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
