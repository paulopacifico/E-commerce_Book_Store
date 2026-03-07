import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'books', pathMatch: 'full' },
  {
    path: 'books',
    loadComponent: () =>
      import('./features/books/book-list/book-list.component').then((m) => m.BookListComponent),
  },
  { path: 'categories', redirectTo: 'books', pathMatch: 'full' },
  { path: 'login', redirectTo: 'books', pathMatch: 'full' },
  { path: 'register', redirectTo: 'books', pathMatch: 'full' },
  { path: 'cart', redirectTo: 'books', pathMatch: 'full' },
  { path: 'orders', redirectTo: 'books', pathMatch: 'full' },
  { path: '**', redirectTo: 'books' },
];
