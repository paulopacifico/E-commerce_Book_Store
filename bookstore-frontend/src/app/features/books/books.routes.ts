import { Routes } from '@angular/router';

import { BookListComponent } from './pages/book-list/book-list.component';
import { BookDetailComponent } from './pages/book-detail/book-detail.component';

export const booksRoutes: Routes = [
  { path: '', component: BookListComponent, data: { animation: 'CatalogPage' } },
  { path: ':id', component: BookDetailComponent, data: { animation: 'BookDetailPage' } },
];
