import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { Book } from '../../../features/books/models/book.interface';

const LOW_STOCK_THRESHOLD = 5;

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
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

  detailLink(): (string | number)[] {
    return ['/books', this.book.id];
  }

  get categoryLabel(): string {
    return this.book.categoryName?.trim() || 'Curated Edition';
  }

  get stockBadgeLabel(): string {
    if (this.book.stockQuantity === 0) return 'Sold Out';
    if (this.book.stockQuantity <= LOW_STOCK_THRESHOLD) {
      return `Only ${this.book.stockQuantity} left`;
    }
    return 'Ready to Ship';
  }

  get stockState(): 'out' | 'low' | 'in' {
    if (this.book.stockQuantity === 0) return 'out';
    if (this.book.stockQuantity <= LOW_STOCK_THRESHOLD) return 'low';
    return 'in';
  }

  get availabilityMessage(): string {
    if (this.book.stockQuantity === 0) return 'Currently unavailable';
    if (this.book.stockQuantity <= LOW_STOCK_THRESHOLD) return 'Limited shelf stock';
    return 'In stock for fast checkout';
  }

  get fallbackMonogram(): string {
    const titleLetter = this.book.title.trim().charAt(0);
    const authorLetter = this.book.author.trim().charAt(0);
    return `${titleLetter}${authorLetter}`.toUpperCase();
  }

  get fallbackLabel(): string {
    return this.book.categoryName?.trim() || 'Shelf Copy';
  }
}
