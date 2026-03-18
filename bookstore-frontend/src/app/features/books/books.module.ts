import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { SharedModule } from '../../shared/shared.module';
import { booksRoutes } from './books.routes';
import { BookListComponent } from './pages/book-list/book-list.component';
import { BookDetailComponent } from './pages/book-detail/book-detail.component';

@NgModule({
  declarations: [BookListComponent, BookDetailComponent],
  imports: [CommonModule, RouterModule.forChild(booksRoutes), SharedModule, ScrollingModule],
})
export class BooksModule {}
