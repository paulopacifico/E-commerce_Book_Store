import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { NotificationService } from '../../../../core/services/notification.service';
import type { AuthResponse } from '../../models/auth.interface';
import { AuthService } from '../../data-access/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let loginMock: ReturnType<typeof vi.fn>;
  let navigateMock: ReturnType<typeof vi.fn>;
  let progressMock: ReturnType<typeof vi.fn>;
  let dismissMock: ReturnType<typeof vi.fn>;
  let successMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    loginMock = vi.fn();
    navigateMock = vi.fn();
    progressMock = vi.fn().mockReturnValue(99);
    dismissMock = vi.fn();
    successMock = vi.fn();

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [CommonModule, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: { login: loginMock } as Pick<AuthService, 'login'> },
        { provide: Router, useValue: { navigate: navigateMock } as Pick<Router, 'navigate'> },
        {
          provide: NotificationService,
          useValue: {
            progress: progressMock,
            dismiss: dismissMock,
            success: successMock,
          } as Pick<NotificationService, 'progress' | 'dismiss' | 'success'>,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ registered: 'true' }),
            queryParamMap: of(convertToParamMap({})),
          },
        },
      ],
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

  it('submits valid credentials and navigates to the catalog', () => {
    loginMock.mockReturnValue(of({ accessToken: 'token-123' } as AuthResponse));
    component.form.setValue({
      email: 'reader@example.com',
      password: 'secret123',
    });

    component.onSubmit();

    expect(loginMock).toHaveBeenCalledWith('reader@example.com', 'secret123');
    expect(navigateMock).toHaveBeenCalledWith(['/books']);
    expect(progressMock).toHaveBeenCalledWith('Signing you in to your bookstore account.', {
      title: 'Signing In',
    });
    expect(successMock).toHaveBeenCalledWith('Welcome back. Redirecting you to the catalog.', {
      title: 'Signed In',
    });
    expect(dismissMock).toHaveBeenCalledWith(99);
    expect(component.loading()).toBe(false);
    expect(component.errorMessage()).toBeNull();
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
});
