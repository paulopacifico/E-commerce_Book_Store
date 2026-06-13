import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CartFacadeService } from '../../features/cart/data-access/cart-facade.service';
import { CartIconComponent } from './cart-icon.component';

describe('CartIconComponent', () => {
  let fixture: ComponentFixture<CartIconComponent>;
  let component: CartIconComponent;
  let cartCount$: Subject<number>;

  beforeEach(async () => {
    vi.useFakeTimers();
    cartCount$ = new Subject<number>();

    await TestBed.configureTestingModule({
      declarations: [CartIconComponent],
      imports: [CommonModule],
      providers: [
        {
          provide: CartFacadeService,
          useValue: { cartCount$ } as Pick<CartFacadeService, 'cartCount$'>,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CartIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    vi.useRealTimers();
  });

  it('animates when the cart count increases', () => {
    cartCount$.next(1);

    expect(component.bump()).toBe(true);

    vi.advanceTimersByTime(260);

    expect(component.bump()).toBe(false);
  });

  it('restarts the animation timeout after another increase', () => {
    cartCount$.next(1);
    vi.advanceTimersByTime(200);
    cartCount$.next(2);
    vi.advanceTimersByTime(60);

    expect(component.bump()).toBe(true);

    vi.advanceTimersByTime(200);

    expect(component.bump()).toBe(false);
  });

  it('clears the pending animation timeout on destruction', () => {
    cartCount$.next(1);
    expect(component.bump()).toBe(true);

    fixture.destroy();
    vi.advanceTimersByTime(260);

    expect(component.bump()).toBe(true);
  });
});
