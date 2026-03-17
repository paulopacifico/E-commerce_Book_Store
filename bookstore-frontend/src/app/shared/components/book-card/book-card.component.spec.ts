import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import type { Book } from '../../../features/books/models/book.interface';
import { BookCardComponent } from './book-card.component';

describe('BookCardComponent', () => {
  let fixture: ComponentFixture<BookCardComponent>;
  let component: BookCardComponent;

  const inStockBook: Book = {
    id: 7,
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    price: 36.9,
    stockQuantity: 4,
    categoryName: 'Design',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BookCardComponent);
    component = fixture.componentInstance;
  });

  it('shows refined fallback metadata and low stock messaging', () => {
    component.book = inStockBook;
    fixture.detectChanges();

    expect(component.stockState).toBe('low');
    expect(component.stockBadgeLabel).toBe('Only 4 left');
    expect(component.fallbackMonogram).toBe('TD');
    expect(fixture.nativeElement.textContent).toContain('Limited shelf stock');
    expect(fixture.nativeElement.textContent).toContain('Preview');
  });

  it('disables purchase for sold out books and still renders the fallback cover', () => {
    component.book = {
      ...inStockBook,
      stockQuantity: 0,
      imageUrl: 'https://example.com/cover.jpg',
    };
    component.onImageError();
    fixture.detectChanges();

    const addButton = fixture.nativeElement.querySelector('.btn-add') as HTMLButtonElement;

    expect(component.stockState).toBe('out');
    expect(addButton.disabled).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Sold Out');
    expect(fixture.nativeElement.querySelector('.card-image-placeholder')).not.toBeNull();
  });

  it('emits add to cart when the primary action is clicked', () => {
    const emitSpy = vi.spyOn(component.addToCart, 'emit');
    component.book = inStockBook;
    fixture.detectChanges();

    const addButton = fixture.nativeElement.querySelector('.btn-add') as HTMLButtonElement;
    addButton.click();

    expect(emitSpy).toHaveBeenCalledWith(inStockBook);
  });
});
