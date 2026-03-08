import { Routes } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'books', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'books',
    loadChildren: () =>
      import('./features/books/books.module').then((m) => m.BooksModule),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/cart/cart.component').then((m) => m.CartComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/checkout/checkout.component').then((m) => m.CheckoutComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'orders',
    loadChildren: () =>
      import('./features/orders/orders.module').then((m) => m.OrdersModule),
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
