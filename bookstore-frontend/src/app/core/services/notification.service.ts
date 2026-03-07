import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly messageSubject = new Subject<string>();

  /** Emits when a message should be shown to the user. Subscribe in app shell to display (e.g. toast/snackbar). */
  readonly messages$ = this.messageSubject.asObservable();

  show(message: string): void {
    this.messageSubject.next(message);
  }
}
