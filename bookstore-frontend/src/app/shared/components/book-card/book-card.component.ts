import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import type { Book } from '../../../features/books/models/book.interface';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './book-card.component.html',
  styleUrl: './book-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookCardComponent {
  @Input({ required: true }) set book(value: Book) {
    this._book = value;
    this.imageError.set(false);
  }
  get book(): Book {
    return this._book;
  }
  private _book!: Book;

  @Output() addToCart = new EventEmitter<Book>();

  /** Set when the cover image fails to load so we show the placeholder instead. */
  readonly imageError = signal(false);

  onAddToCart(): void {
    this.addToCart.emit(this._book);
  }

  onImageError(): void {
    this.imageError.set(true);
  }
}
