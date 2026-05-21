import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';


import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { EggAvailability } from './egg-availability/egg-availability';
import { HomePage } from './pages/home-page/home-page';
import { NotFoundPage } from './pages/not-found-page/not-found-page';
import { EggOrderForm } from './egg-order-form/egg-order-form';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Orders } from './pages/orders/orders';
import { MoreItems } from './pages/more-items/more-items';
import { AdminPage } from './pages/admin/admin-page/admin-page';
import { LoginPage } from './pages/login-page/login-page';

@NgModule({
  declarations: [
    App,
    EggAvailability,
    HomePage,
    NotFoundPage,
    EggOrderForm,
    Orders,
    MoreItems,
    AdminPage,
    LoginPage
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    HttpClientModule,
    CommonModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
  ],
  bootstrap: [App]
})
export class AppModule { }
