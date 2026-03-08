import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { BookCardComponent } from './components/book-card/book-card.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { PaginationComponent } from './components/pagination/pagination.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    BookCardComponent,
    LoadingSpinnerComponent,
    ConfirmationDialogComponent,
    PaginationComponent,
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    BookCardComponent,
    LoadingSpinnerComponent,
    ConfirmationDialogComponent,
    PaginationComponent,
  ],
})
export class SharedModule {}
