// Import components
import {OverviewMapComponent} from "./map/overview-map/overview-map.component";
import {LoginComponent} from "./auth/login/login.component";
import {ManageAccountComponent} from "./auth/manage-account/manage-account.component";
import {SignupComponent} from "./auth/signup/signup.component";
import {FormMapComponent} from "./map/form-map/form-map.component";
import {DetailMapComponent} from "./map/detail-map/detail-map.component";
import {PasswordComponent} from "./auth/manage-account/password/password.component";
import {PasswordResetComponent} from "./auth/manage-account/password-reset/password-reset.component";
import {BookListComponent} from "./book/book-list/book-list.component";
// import {FormMapOwnerComponent} from "./map/form-map-owner/form-map-owner.component"; // WIP

// Import auth guards and router
import {AuthGuard} from "./auth/auth-guard.service";
import {AuthGuardReverse} from "./auth/auth-guard-reverse";
import {MetaGuard} from '@ngx-meta/core'
import {Routes} from "@angular/router";

export const routes: Routes = [
  { path: '', canActivateChild: [MetaGuard], children: [
    { path: '', component: OverviewMapComponent, pathMatch: 'full'},
    { path: 'login', component: LoginComponent, canActivate: [AuthGuardReverse], data: {
      meta: {
        title: 'Login',
      }
    }},
    { path: 'account', canActivate: [AuthGuard], children: [
      { path: '', component: ManageAccountComponent, pathMatch: 'full', data: {
        meta: {
          title: 'Account Management',
        }
      } },
      { path: 'password', component: PasswordComponent, data: {
        meta: {
          title: 'Change Password',
        }
      } },
      ]},
    { path: 'signup', canActivate: [AuthGuardReverse], children: [
      { path: '', component: SignupComponent, pathMatch: 'full', canActivate: [AuthGuardReverse], data: {
        meta: {
          title: 'Sign up',
        }
      }},
      { path: 'key/:key', component: PasswordResetComponent, canActivate: [AuthGuardReverse], data: {
        meta: {
          title: 'Your journey has started',
        }
      }},
    ]},
    { path: 'journey', children: [
      { path: '', redirectTo: '', pathMatch: 'full' },
      { path: ':id', children: [
        { path: '', component: DetailMapComponent, pathMatch: 'full', },
        { path: 'continue', component: FormMapComponent, canActivate: [AuthGuard]},
        // { path: 'define', component: FormMapOwnerComponent, canActivate: [AuthGuard]}, # WIP
      ]},
    ]},
    { path: 'journeys', component: BookListComponent, pathMatch: 'full', canActivate: [AuthGuard]},
    { path: '**', redirectTo: '' } // TODO: should be a 404 page that redirects
  ]}
];
