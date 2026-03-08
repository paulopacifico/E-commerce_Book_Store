import { Component, inject, ChangeDetectionStrategy } from '@angular/core';

import { NotificationService } from '../../../core/services/notification.service';
import type { Notification, NotificationType } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-container',
  standalone: false,
  templateUrl: './notification-container.component.html',
  styleUrl: './notification-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationContainerComponent {
  protected readonly notificationService = inject(NotificationService);
  protected readonly notifications$ = this.notificationService.notifications$;

  getIcon(type: NotificationType): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  }

  trackById(_index: number, n: Notification): number {
    return n.id;
  }
}
