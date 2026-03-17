import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'progress';

export interface NotificationOptions {
  title?: string;
  durationMs?: number | null;
  persistent?: boolean;
}

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  durationMs: number | null;
  persistent: boolean;
}

const AUTO_DISMISS_MS = 3000;
const MAX_NOTIFICATIONS = 3;
const DEFAULT_TITLES: Record<NotificationType, string> = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Heads Up',
  progress: 'In Progress',
};

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private nextId = 0;
  private readonly notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private dismissTimeouts = new Map<number, ReturnType<typeof setTimeout>>();

  readonly notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();

  success(message: string, options?: NotificationOptions): number {
    return this.add('success', message, options);
  }

  error(message: string, options?: NotificationOptions): number {
    return this.add('error', message, options);
  }

  warning(message: string, options?: NotificationOptions): number {
    return this.add('warning', message, options);
  }

  info(message: string, options?: NotificationOptions): number {
    return this.add('info', message, options);
  }

  progress(message: string, options?: NotificationOptions): number {
    return this.add('progress', message, {
      title: options?.title,
      durationMs: null,
      persistent: true,
    });
  }

  /** Alias for error(); used by ErrorInterceptor. */
  show(message: string, options?: NotificationOptions): number {
    return this.error(message, options);
  }

  dismiss(id: number): void {
    this.remove(id);
  }

  private add(type: NotificationType, message: string, options?: NotificationOptions): number {
    const id = ++this.nextId;
    const persistent = options?.persistent ?? type === 'progress';
    const durationMs = persistent ? null : (options?.durationMs ?? AUTO_DISMISS_MS);
    const notification: Notification = {
      id,
      type,
      title: options?.title ?? DEFAULT_TITLES[type],
      message,
      durationMs,
      persistent,
    };
    const current = this.notificationsSubject.value;
    const next = [...current, notification].slice(-MAX_NOTIFICATIONS);
    const removedIds = current.map((n) => n.id).filter((nid) => !next.some((n) => n.id === nid));
    removedIds.forEach((nid) => {
      const tid = this.dismissTimeouts.get(nid);
      if (tid) {
        clearTimeout(tid);
        this.dismissTimeouts.delete(nid);
      }
    });
    this.notificationsSubject.next(next);

    if (durationMs != null) {
      const timeoutId = setTimeout(() => {
        this.remove(id);
        this.dismissTimeouts.delete(id);
      }, durationMs);
      this.dismissTimeouts.set(id, timeoutId);
    }

    return id;
  }

  private remove(id: number): void {
    const timeoutId = this.dismissTimeouts.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.dismissTimeouts.delete(id);
    }
    const next = this.notificationsSubject.value.filter((n) => n.id !== id);
    this.notificationsSubject.next(next);
  }
}
