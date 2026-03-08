import { Routes } from '@angular/router';

import { BookListComponent } from './book-list/book-list.component';
import { BookDetailComponent } from './book-detail/book-detail.component';

export const booksRoutes: Routes = [
  { path: '', component: BookListComponent },
  { path: ':id', component: BookDetailComponent },
];
