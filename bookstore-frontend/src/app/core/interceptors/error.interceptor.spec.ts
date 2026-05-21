import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { AuthService } from '../../features/auth/data-access/auth.service';
import { NotificationService } from '../services/notification.service';
import { ErrorInterceptor } from './error.interceptor';

describe('ErrorInterceptor', () => {
  let http: HttpClient;
  let httpController: HttpTestingController;
  let logoutMock: ReturnType<typeof vi.fn>;
  let showMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    logoutMock = vi.fn();
    showMock = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { logout: logoutMock } as Pick<AuthService, 'logout'> },
        {
          provide: NotificationService,
          useValue: { show: showMock } as Pick<NotificationService, 'show'>,
        },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  });

  it('logs out when a protected request returns an expired-session response', () => {
    let receivedError: Error | undefined;

    http.get('/api/cart').subscribe({
      error: (error: Error) => {
        receivedError = error;
      },
    });

    httpController.expectOne('/api/cart').flush(
      { message: 'Token expired.' },
      {
        status: 401,
        statusText: 'Unauthorized',
      },
    );

    expect(showMock).toHaveBeenCalledWith('Session expired. Please log in again.');
    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(receivedError?.message).toBe('Session expired. Please log in again.');
  });

  it('leaves login credential errors for the login form to handle', () => {
    let receivedError: HttpErrorResponse | undefined;

    http.post('/api/auth/login', { email: 'reader@example.com', password: 'wrong123' }).subscribe({
      error: (error: HttpErrorResponse) => {
        receivedError = error;
      },
    });

    httpController.expectOne('/api/auth/login').flush(
      { message: 'Invalid email or password.' },
      {
        status: 401,
        statusText: 'Unauthorized',
      },
    );

    expect(showMock).not.toHaveBeenCalled();
    expect(logoutMock).not.toHaveBeenCalled();
    expect(receivedError).toBeInstanceOf(HttpErrorResponse);
    expect(receivedError?.error).toEqual({ message: 'Invalid email or password.' });
  });

  it('leaves register validation errors for the registration form to handle', () => {
    let receivedError: HttpErrorResponse | undefined;

    http
      .post('/api/auth/register', {
        email: 'reader@example.com',
        password: 'secret123',
        firstName: 'Reader',
        lastName: 'Reader',
      })
      .subscribe({
        error: (error: HttpErrorResponse) => {
          receivedError = error;
        },
      });

    httpController.expectOne('/api/auth/register').flush(
      { message: 'Email already registered.' },
      {
        status: 400,
        statusText: 'Bad Request',
      },
    );

    expect(showMock).not.toHaveBeenCalled();
    expect(logoutMock).not.toHaveBeenCalled();
    expect(receivedError?.error).toEqual({ message: 'Email already registered.' });
  });
});
