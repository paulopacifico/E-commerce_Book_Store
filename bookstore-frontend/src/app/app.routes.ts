import { Routes } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';
import { GuestOnlyGuard } from './core/guards/guest-only.guard';
import { HomeComponent } from './features/home/pages/home/home.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { CartComponent } from './features/cart/pages/cart/cart.component';
import { CheckoutComponent } from './features/checkout/pages/checkout/checkout.component';
import { NotFoundComponent } from './features/not-found/pages/not-found/not-found.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent, data: { animation: 'HomePage' } },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [GuestOnlyGuard],
    data: { animation: 'LoginPage' },
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [GuestOnlyGuard],
    data: { animation: 'RegisterPage' },
  },
  {
    path: 'books',
    loadChildren: () => import('./features/books/books.module').then((m) => m.BooksModule),
    data: { animation: 'Books' },
  },
  {
    path: 'cart',
    component: CartComponent,
    data: { animation: 'CartPage' },
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
    canActivate: [AuthGuard],
    data: { animation: 'CheckoutPage' },
  },
  {
    path: 'orders',
    loadChildren: () => import('./features/orders/orders.module').then((m) => m.OrdersModule),
    canActivate: [AuthGuard],
    data: { animation: 'Orders' },
  },
  {
    path: 'categories',
    loadChildren: () =>
      import('./features/categories/categories.module').then((m) => m.CategoriesModule),
    data: { animation: 'CategoriesPage' },
  },
  {
    path: '**',
    component: NotFoundComponent,
    data: { animation: 'NotFoundPage' },
  },
];

export const routes = appRoutes;
