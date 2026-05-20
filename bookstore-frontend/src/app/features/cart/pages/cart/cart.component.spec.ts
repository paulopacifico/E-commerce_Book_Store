import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { NotificationService } from '../../../../core/services/notification.service';
import { CartFacadeService } from '../../data-access/cart-facade.service';
import type { LocalCartItem } from '../../data-access/cart-state.service';
import { CartSubtotalPipe } from '../../../../shared/pipes/cart-subtotal.pipe';
import { ConfirmationDialogService } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.service';
import { CartComponent } from './cart.component';

describe('CartComponent', () => {
  let fixture: ComponentFixture<CartComponent>;
  let component: CartComponent;
  let refreshMock: ReturnType<typeof vi.fn>;
  let updateQuantityMock: ReturnType<typeof vi.fn>;
  let removeItemMock: ReturnType<typeof vi.fn>;
  let errorMock: ReturnType<typeof vi.fn>;
  let openDialogMock: ReturnType<typeof vi.fn>;
  let cartItems$: BehaviorSubject<LocalCartItem[]>;

  const cartItem: LocalCartItem = {
    bookId: 1,
    bookTitle: 'Clean Architecture',
    bookAuthor: 'Robert C. Martin',
    bookPrice: 45,
    quantity: 2,
  };

  beforeEach(async () => {
    cartItems$ = new BehaviorSubject<LocalCartItem[]>([cartItem]);
    refreshMock = vi.fn().mockReturnValue(of([cartItem]));
    updateQuantityMock = vi.fn().mockReturnValue(of(void 0));
    removeItemMock = vi.fn().mockReturnValue(of(void 0));
    errorMock = vi.fn();
    openDialogMock = vi.fn().mockReturnValue(of(true));

    await TestBed.configureTestingModule({
      declarations: [CartComponent],
      imports: [CommonModule, CartSubtotalPipe],
      providers: [
        {
          provide: CartFacadeService,
          useValue: {
            cart$: cartItems$,
            refresh: refreshMock,
            updateQuantity: updateQuantityMock,
            removeItem: removeItemMock,
          } as Pick<CartFacadeService, 'cart$' | 'refresh' | 'updateQuantity' | 'removeItem'>,
        },
        {
          provide: NotificationService,
          useValue: {
            error: errorMock,
          } as Pick<NotificationService, 'error'>,
        },
        {
          provide: ConfirmationDialogService,
          useValue: {
            open: openDialogMock,
          } as Pick<ConfirmationDialogService, 'open'>,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the cart on init and enables editing when sync succeeds', () => {
    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(component.loading()).toBe(false);
    expect(component.syncError()).toBeNull();
    expect(component.canEditCart).toBe(true);
  });

  it('shows a retry banner and blocks cart edits when sync fails', async () => {
    refreshMock.mockReturnValueOnce(throwError(() => new Error('refresh failed')));
    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.loading()).toBe(false);
    expect(component.canEditCart).toBe(false);
    expect(component.syncError()).toBe(
      'We could not confirm your cart with the server. Retry before changing quantities or checking out.',
    );
    expect(errorMock).toHaveBeenCalledWith('Unable to refresh your cart right now.');
    expect(fixture.nativeElement.querySelector('.form-banner-error')?.textContent).toContain(
      'We could not confirm your cart with the server.',
    );
  });

  it('retries the cart sync and clears the error state on success', async () => {
    refreshMock
      .mockReturnValueOnce(throwError(() => new Error('refresh failed')))
      .mockReturnValueOnce(of([cartItem]));
    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    component.loadCart();
    fixture.detectChanges();

    expect(refreshMock.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(component.syncError()).toBeNull();
    expect(component.canEditCart).toBe(true);
  });

  it('does not update quantities while the cart sync is in an error state', () => {
    component.syncError.set('sync failed');

    component.updateQuantity(cartItem.bookId, 3);

    expect(updateQuantityMock).not.toHaveBeenCalled();
  });

  it('confirms removal through the app dialog before removing an item', () => {
    component.removeItem(cartItem);

    expect(openDialogMock).toHaveBeenCalledWith({
      title: 'Remove Item',
      message: 'Remove "Clean Architecture" from your cart?',
      confirmText: 'Remove',
      cancelText: 'Keep Item',
      tone: 'danger',
    });
    expect(removeItemMock).toHaveBeenCalledWith(cartItem.bookId);
  });

  it('does not remove an item when the dialog is cancelled', () => {
    openDialogMock.mockReturnValue(of(false));

    component.removeItem(cartItem);

    expect(removeItemMock).not.toHaveBeenCalled();
  });
});
