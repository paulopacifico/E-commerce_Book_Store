import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { throwError, of } from 'rxjs';
import { vi } from 'vitest';

import { NotificationService } from '../../../../core/services/notification.service';
import { CartFacadeService } from '../../../cart/data-access/cart-facade.service';
import type { AuthResponse } from '../../models/auth.interface';
import { AuthService } from '../../data-access/auth.service';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;
  let registerMock: ReturnType<typeof vi.fn>;
  let navigateByUrlMock: ReturnType<typeof vi.fn>;
  let progressMock: ReturnType<typeof vi.fn>;
  let dismissMock: ReturnType<typeof vi.fn>;
  let successMock: ReturnType<typeof vi.fn>;
  let warningMock: ReturnType<typeof vi.fn>;
  let syncAfterAuthenticationMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    registerMock = vi.fn();
    navigateByUrlMock = vi.fn();
    progressMock = vi.fn().mockReturnValue(77);
    dismissMock = vi.fn();
    successMock = vi.fn();
    warningMock = vi.fn();
    syncAfterAuthenticationMock = vi
      .fn()
      .mockReturnValue(of({ mergedGuestItems: 0, cart: [] }));

    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [CommonModule, ReactiveFormsModule],
      providers: [
        {
          provide: AuthService,
          useValue: { register: registerMock } as Pick<AuthService, 'register'>,
        },
        {
          provide: CartFacadeService,
          useValue: {
            syncAfterAuthentication: syncAfterAuthenticationMock,
          } as Pick<CartFacadeService, 'syncAfterAuthentication'>,
        },
        {
          provide: Router,
          useValue: { navigateByUrl: navigateByUrlMock } as Pick<Router, 'navigateByUrl'>,
        },
        {
          provide: NotificationService,
          useValue: {
            progress: progressMock,
            dismiss: dismissMock,
            success: successMock,
            warning: warningMock,
          } as Pick<NotificationService, 'progress' | 'dismiss' | 'success' | 'warning'>,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ returnUrl: '/checkout' }),
            snapshot: {
              queryParamMap: convertToParamMap({ returnUrl: '/checkout' }),
            },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('submits valid registration data and redirects to the return url', () => {
    registerMock.mockReturnValue(of({ accessToken: 'token-123' } as AuthResponse));
    component.form.setValue({
      username: 'reader',
      email: 'reader@example.com',
      password: 'secret123',
      confirmPassword: 'secret123',
    });

    component.onSubmit();

    expect(registerMock).toHaveBeenCalledWith('reader', 'reader@example.com', 'secret123');
    expect(progressMock).toHaveBeenCalledWith(
      'Creating your account and preparing your library access.',
      { title: 'Creating Account' },
    );
    expect(syncAfterAuthenticationMock).toHaveBeenCalledTimes(1);
    expect(successMock).toHaveBeenCalledWith('Your account is ready. Redirecting you now.', {
      title: 'Account Created',
    });
    expect(navigateByUrlMock).toHaveBeenCalledWith('/checkout');
    expect(dismissMock).toHaveBeenCalledWith(77);
    expect(component.loading()).toBe(false);
    expect(component.errorMessage()).toBeNull();
  });

  it('shows a cart sync success message when guest items were merged before redirect', () => {
    registerMock.mockReturnValue(of({ accessToken: 'token-123' } as AuthResponse));
    syncAfterAuthenticationMock.mockReturnValue(of({ mergedGuestItems: 3, cart: [] }));
    component.form.setValue({
      username: 'reader',
      email: 'reader@example.com',
      password: 'secret123',
      confirmPassword: 'secret123',
    });

    component.onSubmit();

    expect(successMock).toHaveBeenCalledWith(
      'Your account is ready and your guest cart was synced before redirecting.',
      { title: 'Account Created' },
    );
  });

  it('warns and continues redirecting when cart sync cannot be confirmed', () => {
    registerMock.mockReturnValue(of({ accessToken: 'token-123' } as AuthResponse));
    syncAfterAuthenticationMock.mockReturnValue(
      throwError(() => new Error('sync failed')),
    );
    component.form.setValue({
      username: 'reader',
      email: 'reader@example.com',
      password: 'secret123',
      confirmPassword: 'secret123',
    });

    component.onSubmit();

    expect(warningMock).toHaveBeenCalledWith(
      'Your account is ready, but we could not confirm your cart sync before redirecting.',
      { title: 'Cart Sync Warning' },
    );
    expect(navigateByUrlMock).toHaveBeenCalledWith('/checkout');
  });

  it('renders the API error message when registration fails', () => {
    registerMock.mockReturnValue(
      throwError(() => ({
        error: { message: 'Email already registered.' },
      })),
    );
    component.form.setValue({
      username: 'reader',
      email: 'reader@example.com',
      password: 'secret123',
      confirmPassword: 'secret123',
    });

    component.onSubmit();
    fixture.detectChanges();

    expect(progressMock).toHaveBeenCalled();
    expect(dismissMock).toHaveBeenCalledWith(77);
    expect(component.loading()).toBe(false);
    expect(component.errorMessage()).toBe('Email already registered.');
    expect(fixture.nativeElement.querySelector('.form-banner-error')?.textContent).toContain(
      'Email already registered.',
    );
  });

  it('preserves the return url when linking back to login', () => {
    expect(component.secondaryAuthQueryParams).toEqual({ returnUrl: '/checkout' });
  });

  it('shows checkout return context when registration starts from checkout', () => {
    expect(component.isCheckoutReturnFlow).toBe(true);
    expect(fixture.nativeElement.querySelector('.auth-context-banner')?.textContent).toContain(
      'After registration, you will return to checkout.',
    );
  });
});
