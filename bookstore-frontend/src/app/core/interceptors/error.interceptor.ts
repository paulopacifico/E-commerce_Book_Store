import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const userMessage = this.getUserMessage(error);
        switch (error.status) {
          case 401:
            this.notification.show(userMessage);
            this.authService.logout();
            return throwError(() => new Error(userMessage));
          case 403:
            this.notification.show('Access denied');
            return throwError(() => new Error(userMessage));
          case 404:
            this.notification.show('Resource not found');
            return throwError(() => new Error(userMessage));
          case 500:
            this.notification.show('Server error');
            return throwError(() => new Error(userMessage));
          default:
            this.notification.show(userMessage);
            return throwError(() => new Error(userMessage));
        }
      })
    );
  }

  private getUserMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 401:
        return 'Session expired. Please log in again.';
      case 403:
        return 'Access denied';
      case 404:
        return 'Resource not found';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
}
