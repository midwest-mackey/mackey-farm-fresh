import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth-interceptor';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

import { BlankLayout } from './layouts/blank-layout/blank-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { MainLayout } from './layouts/main-layout/main-layout';

import { HomePage } from './pages/home-page/home-page';
import { NotFoundPage } from './pages/not-found-page/not-found-page';
import { AdminPage } from './pages/admin/admin-page/admin-page';
import { LoginPage } from './pages/login-page/login-page';

import { EggAvailability } from './components/egg-availability/egg-availability';
import { EggOrderForm } from './components/egg-order-form/egg-order-form';
import { Orders } from './pages/orders/orders';
import { MoreItems } from './pages/more-items/more-items';
import { SettingsPage } from './pages/admin/settings-page/settings-page';


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
    LoginPage,
    BlankLayout,
    AdminLayout,
    MainLayout,
    SettingsPage
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
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [App]
})
export class AppModule { }
