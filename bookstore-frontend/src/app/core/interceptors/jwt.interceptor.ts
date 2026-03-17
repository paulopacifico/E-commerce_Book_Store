import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../features/auth/data-access/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (this.shouldSkipToken(req.url)) {
      return next.handle(req);
    }
    const token = this.authService.getToken();
    if (!token) {
      return next.handle(req);
    }
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next.handle(cloned);
  }

  private shouldSkipToken(url: string): boolean {
    return (
      url.endsWith('/auth/login') ||
      url.endsWith('/auth/register') ||
      url.includes('/auth/login') ||
      url.includes('/auth/register')
    );
  }
}
