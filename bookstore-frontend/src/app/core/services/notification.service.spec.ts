import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { skip } from 'rxjs/operators';
import { vi } from 'vitest';

import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates a progress notification that stays visible until dismissed', async () => {
    const notificationsPromise = firstValueFrom(service.notifications$.pipe(skip(1)));

    const id = service.progress('Syncing your library.', { title: 'Syncing' });
    const notifications = await notificationsPromise;

    expect(id).toBe(1);
    expect(notifications[0]).toMatchObject({
      id: 1,
      type: 'progress',
      title: 'Syncing',
      message: 'Syncing your library.',
      persistent: true,
      durationMs: null,
    });
  });

  it('auto-dismisses transient success notifications', async () => {
    const notificationsPromise = firstValueFrom(service.notifications$.pipe(skip(1)));

    service.success('Saved successfully.');
    const notifications = await notificationsPromise;
    expect(notifications).toHaveLength(1);

    vi.advanceTimersByTime(3001);

    const finalNotifications = await firstValueFrom(service.notifications$);
    expect(finalNotifications).toHaveLength(0);
  });

  it('dismisses a notification manually by id', async () => {
    service.info('Heads up.');
    expect(await firstValueFrom(service.notifications$)).toHaveLength(1);

    service.dismiss(1);

    const notifications = await firstValueFrom(service.notifications$);
    expect(notifications).toEqual([]);
  });
});
