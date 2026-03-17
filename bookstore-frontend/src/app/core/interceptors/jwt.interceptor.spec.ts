import {
  HTTP_INTERCEPTORS,
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { JwtInterceptor } from './jwt.interceptor';
import { AuthService } from '../../features/auth/data-access/auth.service';

describe('JwtInterceptor', () => {
  let http: HttpClient;
  let httpController: HttpTestingController;
  let getTokenMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getTokenMock = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { getToken: getTokenMock } as Pick<AuthService, 'getToken'> },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
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

  it('adds the bearer token to protected requests', () => {
    getTokenMock.mockReturnValue('token-123');

    http.get('/api/books').subscribe();

    const req = httpController.expectOne('/api/books');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-123');
    req.flush({});
  });

  it('skips the token for auth endpoints', () => {
    getTokenMock.mockReturnValue('token-123');

    http.post('/api/auth/login', { email: 'reader@example.com', password: 'secret123' }).subscribe();

    const req = httpController.expectOne('/api/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});
