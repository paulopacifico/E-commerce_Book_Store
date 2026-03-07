import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'books', pathMatch: 'full' },
  {
    path: 'books',
    loadComponent: () =>
      import('./features/books/book-list/book-list.component').then((m) => m.BookListComponent),
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
  { path: 'cart', redirectTo: 'books', pathMatch: 'full' },
  { path: 'orders', redirectTo: 'books', pathMatch: 'full' },
  { path: '**', redirectTo: 'books' },
];
