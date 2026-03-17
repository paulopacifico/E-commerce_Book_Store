import { Component, signal, inject, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../data-access/auth.service';

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

  goToRegister(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/register']);
  }

  onSubmit(): void {
    this.errorMessage.set(null);
    if (this.form.invalid) return;

    this.loading.set(true);
    const { email, password } = this.form.getRawValue();

    this.authService
      .login(email.trim(), password)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.router.navigate(['/books']);
        },
        error: (err) => {
          this.loading.set(false);
          const body = err?.error;
          const msg =
            body?.errors?.['email'] ??
            body?.errors?.['password'] ??
            body?.message ??
            err?.message ??
            'Login failed. Please try again.';
          this.errorMessage.set(msg);
        },
        complete: () => {
          this.loading.set(false);
        },
      });
  }
}
