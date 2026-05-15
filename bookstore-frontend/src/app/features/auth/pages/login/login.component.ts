import { Component, signal, inject, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../../data-access/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CartFacadeService } from '../../../cart/data-access/cart-facade.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly cartFacade = inject(CartFacadeService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get email() {
    return this.form.get('email');
  }

  get password() {
    return this.form.get('password');
  }

  get secondaryAuthQueryParams(): { returnUrl: string } | null {
    const returnUrl = this.getSafeReturnUrl();
    return returnUrl ? { returnUrl } : null;
  }

  onSubmit(): void {
    this.errorMessage.set(null);
    if (this.form.invalid) return;

    this.loading.set(true);
    const { email, password } = this.form.getRawValue();
    const progressId = this.notificationService.progress(
      'Signing you in to your bookstore account.',
      {
        title: 'Signing In',
      },
    );

    this.authService
      .login(email.trim(), password)
      .pipe(
        switchMap(() =>
          this.cartFacade.syncAfterAuthentication().pipe(
            map((result) => ({
              mergedGuestItems: result.mergedGuestItems,
              cartSyncFailed: false,
            })),
            catchError(() =>
              of({
                mergedGuestItems: 0,
                cartSyncFailed: true,
              }),
            ),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading.set(false);
          this.notificationService.dismiss(progressId);
        }),
      )
      .subscribe({
        next: ({ mergedGuestItems, cartSyncFailed }) => {
          const targetUrl = this.getSafeReturnUrl() ?? '/books';
          if (cartSyncFailed) {
            this.notificationService.warning(
              'Welcome back. Your session is ready, but we could not confirm your cart sync before redirecting.',
              { title: 'Cart Sync Warning' },
            );
          } else if (mergedGuestItems > 0) {
            this.notificationService.success(
              'Welcome back. Your guest cart was synced before redirecting you.',
              { title: 'Signed In' },
            );
          } else {
            this.notificationService.success('Welcome back. Redirecting you now.', {
              title: 'Signed In',
            });
          }
          void this.router.navigateByUrl(targetUrl);
        },
        error: (err) => {
          const body = err?.error;
          const msg =
            body?.errors?.['email'] ??
            body?.errors?.['password'] ??
            body?.message ??
            err?.message ??
            'Login failed. Please try again.';
          this.errorMessage.set(msg);
        },
      });
  }

  private getSafeReturnUrl(): string | null {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (!returnUrl?.startsWith('/')) {
      return null;
    }
    return returnUrl;
  }
}
