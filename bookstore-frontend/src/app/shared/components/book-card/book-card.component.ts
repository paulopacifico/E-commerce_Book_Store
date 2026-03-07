import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import type { Book } from '../../../core/models/book.interface';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './book-card.component.html',
  styleUrl: './book-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookCardComponent {
  @Input({ required: true }) book!: Book;

  @Output() addToCart = new EventEmitter<Book>();

  onAddToCart(): void {
    this.addToCart.emit(this.book);
  }
}
