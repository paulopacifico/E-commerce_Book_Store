import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

import { AuthService } from '../../features/auth/data-access/auth.service';

@Injectable({ providedIn: 'root' })
export class GuestOnlyGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.isAuthenticated()) {
      return true;
    }

    const returnUrl = route.queryParamMap.get('returnUrl');
    const targetUrl = returnUrl?.startsWith('/') ? returnUrl : '/books';
    void this.router.navigateByUrl(targetUrl);
    return false;
  }
}
