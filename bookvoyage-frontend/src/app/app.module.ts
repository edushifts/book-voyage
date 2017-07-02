import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FooterComponent } from './footer/footer.component';
import { OverviewMapComponent } from './overview-map/overview-map.component';
import { HeaderComponent } from './header/header.component';
import { CodeFormComponent } from './code-form/code-form.component';
import { LoginComponent } from './login/login.component';

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    OverviewMapComponent,
    HeaderComponent,
    CodeFormComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
