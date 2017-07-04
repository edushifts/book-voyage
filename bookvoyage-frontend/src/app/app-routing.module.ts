import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {OverviewMapComponent} from "./overview-map/overview-map.component";
import {LoginComponent} from "./auth/login/login.component";
import {ManageAccountComponent} from "./auth/manage-account/manage-account.component";
import {SignupComponent} from "./auth/signup/signup.component";

const appRoutes: Routes = [
  { path: '', component: OverviewMapComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent},
  { path: 'account', component: ManageAccountComponent},
  { path: 'signup', component: SignupComponent},
  { path: 'signup', component: SignupComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
