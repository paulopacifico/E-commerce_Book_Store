import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
}

const AUTO_DISMISS_MS = 3000;
const MAX_NOTIFICATIONS = 3;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private nextId = 0;
  private readonly notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private dismissTimeouts = new Map<number, ReturnType<typeof setTimeout>>();

  readonly notifications$: Observable<Notification[]> =
    this.notificationsSubject.asObservable();

  success(message: string): void {
    this.add('success', message);
  }

  error(message: string): void {
    this.add('error', message);
  }

  warning(message: string): void {
    this.add('warning', message);
  }

  info(message: string): void {
    this.add('info', message);
  }

  /** Alias for error(); used by ErrorInterceptor. */
  show(message: string): void {
    this.error(message);
  }

  dismiss(id: number): void {
    this.remove(id);
  }

  private add(type: NotificationType, message: string): void {
    const id = ++this.nextId;
    const notification: Notification = { id, type, message };
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

    const timeoutId = setTimeout(() => {
      this.remove(id);
      this.dismissTimeouts.delete(id);
    }, AUTO_DISMISS_MS);
    this.dismissTimeouts.set(id, timeoutId);
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
