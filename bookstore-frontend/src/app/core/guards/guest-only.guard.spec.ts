import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, convertToParamMap } from '@angular/router';
import { vi } from 'vitest';

import { AuthService } from '../../features/auth/data-access/auth.service';
import { GuestOnlyGuard } from './guest-only.guard';

describe('GuestOnlyGuard', () => {
  let guard: GuestOnlyGuard;
  let isAuthenticatedMock: ReturnType<typeof vi.fn>;
  let navigateByUrlMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    isAuthenticatedMock = vi.fn();
    navigateByUrlMock = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        GuestOnlyGuard,
        {
          provide: AuthService,
          useValue: { isAuthenticated: isAuthenticatedMock } as Pick<
            AuthService,
            'isAuthenticated'
          >,
        },
        {
          provide: Router,
          useValue: { navigateByUrl: navigateByUrlMock } as Pick<Router, 'navigateByUrl'>,
        },
      ],
    });

    guard = TestBed.inject(GuestOnlyGuard);
  });

  it('allows guests through the route', () => {
    isAuthenticatedMock.mockReturnValue(false);

    const allowed = guard.canActivate({} as ActivatedRouteSnapshot);

    expect(allowed).toBe(true);
    expect(navigateByUrlMock).not.toHaveBeenCalled();
  });

  it('redirects authenticated users to the requested return url', () => {
    isAuthenticatedMock.mockReturnValue(true);

    const allowed = guard.canActivate({
      queryParamMap: convertToParamMap({ returnUrl: '/checkout' }),
    } as ActivatedRouteSnapshot);

    expect(allowed).toBe(false);
    expect(navigateByUrlMock).toHaveBeenCalledWith('/checkout');
  });

  it('redirects authenticated users to the catalog when no safe return url exists', () => {
    isAuthenticatedMock.mockReturnValue(true);

    const allowed = guard.canActivate({
      queryParamMap: convertToParamMap({ returnUrl: 'https://example.com' }),
    } as ActivatedRouteSnapshot);

    expect(allowed).toBe(false);
    expect(navigateByUrlMock).toHaveBeenCalledWith('/books');
  });
});
