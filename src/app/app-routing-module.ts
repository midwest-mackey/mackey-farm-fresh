import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { NotFoundPage } from './pages/not-found-page/not-found-page';
import { Orders } from './pages/orders/orders';
import { MoreItems } from './pages/more-items/more-items';
import { AdminPage } from './pages/admin/admin-page/admin-page';
import { adminGuard } from './guards/admin-guard';
import { LoginPage } from './pages/login-page/login-page';

const routes: Routes = [
  // { path: '', redirectTo: '', pathMatch: 'full' },
  { path: '', component: HomePage, pathMatch: 'full', title: '🐔 Mackey\'s Farm Fresh Eggs - Home'},
  { path: 'more-items', component: MoreItems, pathMatch: 'full', title: '🐔 Mackey\'s Farm Fresh Eggs - More Items'},
  { path: 'orders', component: Orders, runGuardsAndResolvers: 'always', pathMatch: 'full', title: '🐔 Mackey\'s Farm Fresh Eggs - Orders'},
  { path: 'login', component: LoginPage, pathMatch: 'full', title: '🔑 LOGIN -  Mackey\'s Farm Fresh Eggs'},
  { path: 'admin', component: AdminPage, canActivate: [adminGuard], runGuardsAndResolvers: 'always', pathMatch: 'full', title: '🔐 ADMIN - Mackey\'s Farm Fresh Eggs'},

  // 404 route (ALWAYS last)
  {path: '**', component: NotFoundPage, title: '404 - Page Not Found'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }