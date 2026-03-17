import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { vi } from 'vitest';

import { AuthGuard } from './auth.guard';
import { AuthService } from '../../features/auth/data-access/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let isAuthenticatedMock: ReturnType<typeof vi.fn>;
  let navigateMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    isAuthenticatedMock = vi.fn();
    navigateMock = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        {
          provide: AuthService,
          useValue: { isAuthenticated: isAuthenticatedMock } as Pick<
            AuthService,
            'isAuthenticated'
          >,
        },
        { provide: Router, useValue: { navigate: navigateMock } as Pick<Router, 'navigate'> },
      ],
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('allows authenticated users through the route', () => {
    isAuthenticatedMock.mockReturnValue(true);

    const allowed = guard.canActivate(
      {} as ActivatedRouteSnapshot,
      { url: '/checkout' } as RouterStateSnapshot,
    );

    expect(allowed).toBe(true);
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('redirects guests to login and preserves the requested URL', () => {
    isAuthenticatedMock.mockReturnValue(false);

    const allowed = guard.canActivate(
      {} as ActivatedRouteSnapshot,
      { url: '/orders/42' } as RouterStateSnapshot,
    );

    expect(allowed).toBe(false);
    expect(navigateMock).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/orders/42' },
    });
  });
});
