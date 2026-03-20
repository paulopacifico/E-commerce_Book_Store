import { Component, signal, inject, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../data-access/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notificationService = inject(NotificationService);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group(
    {
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  get username() {
    return this.form.get('username');
  }

  get email() {
    return this.form.get('email');
  }

  get password() {
    return this.form.get('password');
  }

  get confirmPassword() {
    return this.form.get('confirmPassword');
  }

  get secondaryAuthQueryParams(): { returnUrl: string } | null {
    const returnUrl = this.getSafeReturnUrl();
    return returnUrl ? { returnUrl } : null;
  }

  onSubmit(): void {
    if (this.loading()) return;
    this.errorMessage.set(null);
    if (this.form.invalid) return;

    this.loading.set(true);
    const { username, email, password } = this.form.getRawValue();
    const progressId = this.notificationService.progress(
      'Creating your account and preparing your library access.',
      { title: 'Creating Account' },
    );

    this.authService
      .register(username, email, password)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading.set(false);
          this.notificationService.dismiss(progressId);
        }),
      )
      .subscribe({
        next: () => {
          const targetUrl = this.getSafeReturnUrl() ?? '/books';
          this.notificationService.success('Your account is ready. Redirecting you now.', {
            title: 'Account Created',
          });
          void this.router.navigateByUrl(targetUrl);
        },
        error: (err) => {
          const msg =
            err?.error?.message ?? err?.message ?? 'Registration failed. Please try again.';
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
