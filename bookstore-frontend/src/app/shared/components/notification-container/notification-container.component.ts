import { Component, inject, ChangeDetectionStrategy } from '@angular/core';

import { NotificationService } from '../../../core/services/notification.service';
import type { NotificationType } from '../../../core/services/notification.service';

const ICON_MAP: Record<NotificationType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
  progress: '↻',
};

const ROLE_MAP: Record<NotificationType, 'status' | 'alert'> = {
  success: 'status',
  error: 'alert',
  warning: 'status',
  info: 'status',
  progress: 'status',
};

const LIVE_MAP: Record<NotificationType, 'polite' | 'assertive'> = {
  success: 'polite',
  error: 'assertive',
  warning: 'polite',
  info: 'polite',
  progress: 'polite',
};

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

  /** Pure lookup for template; no method calls during change detection. */
  protected readonly iconMap = ICON_MAP;
  protected readonly roleMap = ROLE_MAP;
  protected readonly liveMap = LIVE_MAP;
}
