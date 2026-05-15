import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';

import { environment } from '../../../../environments/environment';
import type { AuthResponse } from '../models/auth.interface';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const loginUrl = `${environment.apiUrl}/auth/login`;
  let navigateMock: ReturnType<typeof vi.fn>;
  let httpController: HttpTestingController;

  const setup = (): AuthService => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate: navigateMock } as Pick<Router, 'navigate'> },
      ],
    });

    httpController = TestBed.inject(HttpTestingController);
    return TestBed.inject(AuthService);
  };

  beforeEach(() => {
    localStorage.clear();
    navigateMock = vi.fn();
  });

  afterEach(() => {
    httpController.verify();
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('hydrates the token from storage on startup', () => {
    localStorage.setItem('authToken', 'persisted-token');
    localStorage.setItem('authIdentity', 'Reader@Example.com');

    const service = setup();

    expect(service.getToken()).toBe('persisted-token');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.getCartStorageScope()).toBe('user:reader%40example.com');
  });

  it('stores the token after a successful login', () => {
    const service = setup();
    let response: AuthResponse | undefined;

    service.login('reader@example.com', 'secret123').subscribe((value) => {
      response = value;
    });

    const req = httpController.expectOne(loginUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'reader@example.com',
      password: 'secret123',
    });

    req.flush({ accessToken: 'token-123', email: 'Reader@Example.com' });

    expect(response?.accessToken).toBe('token-123');
    expect(service.getToken()).toBe('token-123');
    expect(service.isAuthenticated()).toBe(true);
    expect(localStorage.getItem('authToken')).toBe('token-123');
    expect(localStorage.getItem('authIdentity')).toBe('reader@example.com');
    expect(service.getCartStorageScope()).toBe('user:reader%40example.com');
  });

  it('clears the cart when a different authenticated session replaces the current token', () => {
    localStorage.setItem('authToken', 'existing-token');
    const service = setup();
    const sessionEvents: Array<{ type: string; replacedSession?: boolean }> = [];

    service.sessionEvents$.subscribe((event) => {
      sessionEvents.push(event);
    });

    service.login('reader@example.com', 'secret123').subscribe();

    const req = httpController.expectOne(loginUrl);
    req.flush({ accessToken: 'new-token' });

    expect(service.getToken()).toBe('new-token');
    expect(sessionEvents).toEqual([{ type: 'authenticated', replacedSession: true }]);
  });

  it('clears the session and redirects to login on logout', () => {
    const service = setup();
    const sessionEvents: Array<{ type: string; replacedSession?: boolean }> = [];

    service.sessionEvents$.subscribe((event) => {
      sessionEvents.push(event);
    });

    service.login('reader@example.com', 'secret123').subscribe();
    httpController.expectOne(loginUrl).flush({ accessToken: 'token-123' });

    service.logout();

    expect(service.getToken()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('authIdentity')).toBeNull();
    expect(navigateMock).toHaveBeenCalledWith(['/login']);
    expect(sessionEvents.at(-1)).toEqual({ type: 'cleared' });
  });
});
