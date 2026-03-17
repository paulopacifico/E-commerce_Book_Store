import { ErrorHandler, Injectable, Inject, Optional, InjectionToken } from '@angular/core';
import { NotificationService } from './services/notification.service';
import { environment } from '../../environments/environment';

/**
 * Optional service for reporting errors to an external system (e.g. Sentry).
 * Provide this token in AppModule (or in production-only config) to enable.
 */
export interface ErrorLoggingService {
  logError(error: unknown, context?: Record<string, unknown>): void;
}

export const ERROR_LOGGING_SERVICE = new InjectionToken<ErrorLoggingService>(
  'ERROR_LOGGING_SERVICE',
);

const USER_MESSAGE = 'Something went wrong. Please try again or refresh the page.';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private readonly notificationService: NotificationService,
    @Optional()
    @Inject(ERROR_LOGGING_SERVICE)
    private readonly loggingService: ErrorLoggingService | null,
  ) {}

  handleError(error: unknown): void {
    if (!environment.production) {
      console.error('GlobalErrorHandler:', error);
    }

    this.notificationService.error(USER_MESSAGE);

    if (this.loggingService) {
      try {
        this.loggingService.logError(error, {
          production: environment.production,
        });
      } catch (e) {
        if (!environment.production) {
          console.warn('Error logging service failed:', e);
        }
      }
    }
  }
}
