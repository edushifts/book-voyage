import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {OverviewMapComponent} from "./map/overview-map/overview-map.component";
import {LoginComponent} from "./auth/login/login.component";
import {ManageAccountComponent} from "./auth/manage-account/manage-account.component";
import {SignupComponent} from "./auth/signup/signup.component";
import {FormMapComponent} from "./map/form-map/form-map.component";
import {DetailMapComponent} from "./map/detail-map/detail-map.component";
import {AuthGuard} from "./auth/auth-guard.service";
import {PageNotFoundComponent} from "./page-not-found/page-not-found.component";
import {PasswordComponent} from "./auth/manage-account/password/password.component";
import {AuthGuardReverse} from "./auth/auth-guard-reverse";
import {PasswordResetComponent} from "./auth/manage-account/password-reset/password-reset.component";
import {BookListComponent} from "./book/book-list/book-list.component";
import {FormUserMapComponent} from "./map/form-user-map/form-user-map.component";

const appRoutes: Routes = [
  { path: '', children: [
    { path: '', component: OverviewMapComponent, pathMatch: 'full'},
    { path: 'login', component: LoginComponent, canActivate: [AuthGuardReverse]},
    { path: 'account', canActivate: [AuthGuard], children: [
      { path: '', component: ManageAccountComponent, pathMatch: 'full' },
      { path: 'password', component: PasswordComponent },
      ]},
    { path: 'signup', canActivate: [AuthGuardReverse], children: [
      { path: '', component: SignupComponent, pathMatch: 'full', canActivate: [AuthGuardReverse]},
      { path: 'key/:key', component: PasswordResetComponent, canActivate: [AuthGuardReverse]},
    ]},
    { path: 'journey', children: [
      { path: '', redirectTo: '', pathMatch: 'full' },
      { path: ':id', children: [
        { path: '', component: DetailMapComponent, pathMatch: 'full' },
        { path: 'continue', component: FormMapComponent, canActivate: [AuthGuard]},
        { path: 'define', component: FormUserMapComponent, canActivate: [AuthGuard]},
      ]},
    ]},
    { path: 'journeys', component: BookListComponent, pathMatch: 'full', canActivate: [AuthGuard]},
    { path: '**', redirectTo: '' } // TODO: should be a 404 page that redirects
  ]}
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
