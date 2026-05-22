import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { NotificationService } from '../../../../core/services/notification.service';
import { CartFacadeService } from '../../../cart/data-access/cart-facade.service';
import type { AuthResponse } from '../../models/auth.interface';
import { AuthService } from '../../data-access/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let loginMock: ReturnType<typeof vi.fn>;
  let navigateByUrlMock: ReturnType<typeof vi.fn>;
  let progressMock: ReturnType<typeof vi.fn>;
  let dismissMock: ReturnType<typeof vi.fn>;
  let successMock: ReturnType<typeof vi.fn>;
  let warningMock: ReturnType<typeof vi.fn>;
  let syncAfterAuthenticationMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    loginMock = vi.fn();
    navigateByUrlMock = vi.fn();
    progressMock = vi.fn().mockReturnValue(99);
    dismissMock = vi.fn();
    successMock = vi.fn();
    warningMock = vi.fn();
    syncAfterAuthenticationMock = vi.fn().mockReturnValue(of({ mergedGuestItems: 0, cart: [] }));

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [CommonModule, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: { login: loginMock } as Pick<AuthService, 'login'> },
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
            snapshot: {
              queryParamMap: convertToParamMap({ returnUrl: '/orders/42' }),
            },
            queryParams: of({ registered: 'true' }),
            queryParamMap: of(convertToParamMap({})),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows the registration success banner when redirected from signup', () => {
    const banner = fixture.nativeElement.querySelector(
      '.form-banner-success',
    ) as HTMLElement | null;

    expect(banner?.textContent).toContain('Registration successful');
  });

  it('does not submit while the form is invalid', () => {
    component.onSubmit();

    expect(loginMock).not.toHaveBeenCalled();
  });

  it('submits valid credentials and navigates to the return url', () => {
    loginMock.mockReturnValue(of({ accessToken: 'token-123' } as AuthResponse));
    component.form.setValue({
      email: 'reader@example.com',
      password: 'secret123',
    });

    component.onSubmit();

    expect(loginMock).toHaveBeenCalledWith('reader@example.com', 'secret123');
    expect(syncAfterAuthenticationMock).toHaveBeenCalledTimes(1);
    expect(navigateByUrlMock).toHaveBeenCalledWith('/orders/42');
    expect(progressMock).toHaveBeenCalledWith('Signing you in to your bookstore account.', {
      title: 'Signing In',
    });
    expect(successMock).toHaveBeenCalledWith('Welcome back. Redirecting you now.', {
      title: 'Signed In',
    });
    expect(dismissMock).toHaveBeenCalledWith(99);
    expect(component.loading()).toBe(false);
    expect(component.errorMessage()).toBeNull();
  });

  it('shows a cart sync success message when guest items were merged before redirect', () => {
    loginMock.mockReturnValue(of({ accessToken: 'token-123' } as AuthResponse));
    syncAfterAuthenticationMock.mockReturnValue(of({ mergedGuestItems: 2, cart: [] }));
    component.form.setValue({
      email: 'reader@example.com',
      password: 'secret123',
    });

    component.onSubmit();

    expect(successMock).toHaveBeenCalledWith(
      'Welcome back. Your guest cart was synced before redirecting you.',
      { title: 'Signed In' },
    );
  });

  it('warns and continues redirecting when cart sync cannot be confirmed', () => {
    loginMock.mockReturnValue(of({ accessToken: 'token-123' } as AuthResponse));
    syncAfterAuthenticationMock.mockReturnValue(throwError(() => new Error('sync failed')));
    component.form.setValue({
      email: 'reader@example.com',
      password: 'secret123',
    });

    component.onSubmit();

    expect(warningMock).toHaveBeenCalledWith(
      'Welcome back. Your session is ready, but we could not confirm your cart sync before redirecting.',
      { title: 'Cart Sync Warning' },
    );
    expect(navigateByUrlMock).toHaveBeenCalledWith('/orders/42');
  });

  it('renders the API error message when login fails', () => {
    loginMock.mockReturnValue(
      throwError(() => ({
        error: { message: 'Invalid email or password.' },
      })),
    );
    component.form.setValue({
      email: 'reader@example.com',
      password: 'secret123',
    });

    component.onSubmit();
    fixture.detectChanges();

    expect(progressMock).toHaveBeenCalled();
    expect(dismissMock).toHaveBeenCalledWith(99);
    expect(component.loading()).toBe(false);
    expect(component.errorMessage()).toBe('Invalid email or password.');
    expect(fixture.nativeElement.querySelector('.form-banner-error')?.textContent).toContain(
      'Invalid email or password.',
    );
  });

  it('preserves the return url when linking to registration', () => {
    expect(component.secondaryAuthQueryParams).toEqual({ returnUrl: '/orders/42' });
  });

  it('does not mark a non-checkout return url as checkout flow', () => {
    expect(component.isCheckoutReturnFlow).toBe(false);
  });
});
