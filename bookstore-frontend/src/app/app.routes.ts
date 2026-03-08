import { Routes } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'books', pathMatch: 'full' },
  {
    path: 'books',
    loadComponent: () =>
      import('./features/books/book-list/book-list.component').then((m) => m.BookListComponent),
  },
  {
    path: 'books/:id',
    loadComponent: () =>
      import('./features/books/book-detail/book-detail.component').then((m) => m.BookDetailComponent),
  },
  { path: 'categories', redirectTo: 'books', pathMatch: 'full' },
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
    path: 'cart',
    loadComponent: () =>
      import('./features/cart/cart.component').then((m) => m.CartComponent),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/checkout/checkout.component').then((m) => m.CheckoutComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'orders/:id',
    loadComponent: () =>
      import('./features/orders/order-detail/order-detail.component').then((m) => m.OrderDetailComponent),
    canActivate: [AuthGuard],
  },
  { path: 'orders', redirectTo: 'books', pathMatch: 'full' },
  { path: '**', redirectTo: 'books' },
];
