import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';
import { booksRoutes } from './books.routes';
import { BookListComponent } from './pages/book-list/book-list.component';
import { BookDetailComponent } from './pages/book-detail/book-detail.component';

@NgModule({
  declarations: [BookListComponent, BookDetailComponent],
  imports: [CommonModule, RouterModule.forChild(booksRoutes), SharedModule],
})
export class BooksModule {}
