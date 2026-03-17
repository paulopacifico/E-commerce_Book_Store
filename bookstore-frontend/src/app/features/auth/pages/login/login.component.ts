import { Component, signal, inject, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../data-access/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

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
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading.set(false);
          this.notificationService.dismiss(progressId);
        }),
      )
      .subscribe({
        next: () => {
          this.notificationService.success('Welcome back. Redirecting you to the catalog.', {
            title: 'Signed In',
          });
          this.router.navigate(['/books']);
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
}
